import express from "express";
import sharp from "sharp";
import orgCtrl from "../controllers/organization.js";
import appCtrl from "../controllers/app.js";
import versionCtrl from "../controllers/version.js";
import orgMemberCtrl from "../controllers/organizationMember.js";
import userCtrl from "../controllers/user.js";
import orgInvitationCtrl from "../controllers/orgInvitation.js";
import resourceCtrl from "../controllers/resource.js";
import envCtrl from "../controllers/environment.js";
import auditCtrl from "../controllers/audit.js";
import deployCtrl from "../controllers/deployment.js";
import clsCtrl from "../controllers/cluster.js";
import { applyRules } from "../schemas/organization.js";
import { applyRules as invitationApplyRules } from "../schemas/orgInvitation.js";
import { applyRules as memberApplyRules } from "../schemas/organizationMember.js";
import { authSession } from "../middlewares/authSession.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validateOrg } from "../middlewares/validateOrg.js";
import {
	authorizeOrgAction,
	orgAuthorization,
} from "../middlewares/authorizeOrgAction.js";
import { validate } from "../middlewares/validate.js";
import { handleFile } from "../middlewares/handleFile.js";
import { sendMessage } from "../init/queue.js";
import { sendMessage as sendNotification } from "../init/sync.js";
import { storage } from "../init/storage.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/org/roles
@method     GET
@desc       Get organization role definitions
@access     private
*/
router.get("/roles", authSession, async (req, res) => {
	try {
		res.json(orgAuthorization);
	} catch (error) {
		handleError(req, res, error);
	}
});

/*
@route      /v1/org
@method     GET
@desc       Get all organizations where a user is a member of (sorted by organization name ascending)
@access     private
*/
router.get("/", authSession, async (req, res) => {
	try {
		const { user } = req;
		let orgs = [];

		// Cluster owner is by default Admin member of all organizations
		if (user.isClusterOwner) {
			orgs = await orgCtrl.getManyByQuery({});
			res.json(
				orgs
					.map((entry) => {
						return { ...entry, role: "Admin" };
					})
					.sort((a, b) =>
						a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
					)
			);
		} else {
			orgs = await orgMemberCtrl.getManyByQuery(
				{ userId: user._id },
				{ lookup: "orgId" }
			);
			res.json(
				orgs
					.map((entry) => {
						return { ...entry.orgId, role: entry.role };
					})
					.sort((a, b) =>
						a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
					)
			);
		}
	} catch (error) {
		handleError(req, res, error);
	}
});

/*
@route      /v1/org
@method     POST
@desc       Creates a new organization
@access     private
*/
router.post(
	"/",
	checkContentType,
	authSession,
	applyRules("create"),
	validate,
	async (req, res) => {
		// Start new database transaction session
		const session = await orgCtrl.startSession();
		try {
			let orgId = helper.generateId();
			const { name } = req.body;
			const { user } = req;
			// Check if the user can create an organization or not
			if (!req.user.canCreateOrg) {
				await orgCtrl.endSession(session);
				return res.status(401).json({
					error: t("Unauthorized"),
					details: t(
						"You do not have the authorization to create a new organization."
					),
					code: ERROR_CODES.unauthorized,
				});
			}

			// Create the new organization object
			let orgObj = await orgCtrl.create(
				{
					_id: orgId,
					ownerUserId: user._id,
					iid: helper.generateSlug("org"),
					name: name,
					color: helper.generateColor("light"),
					createdBy: user._id,
				},
				{ session, cacheKey: orgId }
			);

			// Add the creator of the organization as an 'Admin' member
			await orgMemberCtrl.create(
				{
					orgId: orgId,
					userId: req.user._id,
					role: "Admin",
				},
				{ session, cacheKey: `${orgId}.${user._id}` }
			);

			// Add the default Agnost cluster resources to the organization
			const resources = await resourceCtrl.addDefaultOrganizationResources(
				session,
				user,
				orgObj
			);

			// Commit transaction
			await orgCtrl.commit(session);

			// Return the newly created organization object
			res.json(orgObj);

			// We just need to create the storage resource. Default queue, scheduler and realtime are bound to the existing resources
			await resourceCtrl.manageClusterResources([
				resources.storage,
				resources.queue,
				resources.scheduler,
				resources.realtime,
			]);

			// Log action
			auditCtrl.log(
				req.user,
				"org",
				"create",
				t("Created a new organization named '%s'", name),
				orgObj,
				{ orgId }
			);
		} catch (error) {
			await orgCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId
@method     PUT
@desc       Updates organization name
@access     private
*/
router.put(
	"/:orgId",
	checkContentType,
	authSession,
	validateOrg,
	authorizeOrgAction("org.update"),
	applyRules("update"),
	validate,
	async (req, res) => {
		try {
			const { name } = req.body;
			let orgObj = await orgCtrl.updateOneById(
				req.org._id,
				{ name: name, updatedBy: req.user._id },
				{},
				{ cacheKey: req.org._id }
			);

			res.json(orgObj);

			// Log action
			auditCtrl.logAndNotify(
				req.org._id,
				req.user,
				"org",
				"update",
				t("Updated organization name from '%s' to '%s'", req.org.name, name),
				orgObj,
				{ orgId: req.org._id }
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId
@method     DELETE
@desc       Deletes the organization
@access     private
*/
router.delete(
	"/:orgId",
	checkContentType,
	authSession,
	validateOrg,
	authorizeOrgAction("org.delete"),
	async (req, res) => {
		// Start new database transaction session
		const session = await orgCtrl.startSession();
		try {
			const { org, user } = req;

			if (
				org.ownerUserId.toString() !== req.user._id.toString() &&
				!req.user.isClusterOwner
			) {
				return res.status(401).json({
					error: t("Not Authorized"),
					details: t(
						"You are not authorized to delete organization '%s'. Only the owner of the organization or cluster owner can delete it.",
						app.name
					),
					code: ERROR_CODES.unauthorized,
				});
			}

			// First get all organization resources, environments, apps and versions
			const resources = await resourceCtrl.getManyByQuery({ orgId: org._id });
			const envs = await envCtrl.getManyByQuery({ orgId: org._id });
			const apps = await appCtrl.getManyByQuery({ orgId: org._id });
			const versions = await versionCtrl.getManyByQuery({ orgId: org._id });

			// Delete all organization related data
			await orgCtrl.deleteOrganization(session, org);
			// Commit transaction
			await orgCtrl.commit(session);

			// Iterate through all environments and delete them
			for (let i = 0; i < envs.length; i++) {
				const env = envs[i];
				deployCtrl.delete(
					apps.find((entry) => env.appId.toString() === entry._id.toString()),
					versions.find(
						(entry) => env.versionId.toString() === entry._id.toString()
					),
					env,
					user
				);
			}

			// Iterate through all resources and delete them if they are managed
			const managedResources = resources.filter(
				(entry) => entry.managed === true
			);

			// Delete managed organization resources
			resourceCtrl.deleteClusterResources(managedResources);

			res.json();

			// Log action
			auditCtrl.logAndNotify(
				org._id,
				user,
				"org",
				"delete",
				t("Deleted organization '%s'", org.name),
				org,
				{ orgId: org._id }
			);
		} catch (error) {
			await orgCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId
@method     GET
@desc       Returns organization information of the user
@access     private
*/
router.get("/:orgId", authSession, validateOrg, async (req, res) => {
	try {
		res.json({ ...req.org, role: req.orgMember.role });
	} catch (error) {
		handleError(req, res, error);
	}
});

/*
@route      /v1/org/:orgId/picture?width=128&height=128
@method     PUT
@desc       Updates the profile image of the organization. A picture with the name 'picture' needs to be uploaded in body of the request.
@access     private
*/
router.put(
	"/:orgId/picture",
	handleFile.single("picture"),
	authSession,
	validateOrg,
	authorizeOrgAction("org.update"),
	applyRules("upload-picture"),
	validate,
	async (req, res) => {
		try {
			let buffer = req.file?.buffer;
			let { width, height } = req.query;
			if (!width) width = config.get("general.profileImgSizePx");
			if (!height) height = config.get("general.profileImgSizePx");

			if (!req.file) {
				return res.status(422).json({
					error: t("Missing Upload File"),
					details: t("Missing file, no file uploaded."),
					code: ERROR_CODES.fileUploadError,
				});
			}

			// Resize image if width and height specified and if the image is not in svg format
			if (req.file.mimetype !== "image/svg+xml")
				buffer = await sharp(req.file.buffer).resize(width, height).toBuffer();

			// Specify the directory where you want to store the image
			const uploadBucket = config.get("general.storageBucket");
			// Ensure file storage folder exists
			await storage.ensureBucket(uploadBucket);
			// Delete existing file if it exists
			await storage.deleteFile(uploadBucket, req.org.pictureUrl);
			// Save the new file
			const filePath = `storage/avatars/${helper.generateSlug("img", 6)}-${
				req.file.originalname
			}`;

			const metaData = {
				"Content-Type": req.file.mimetype,
			};
			await storage.saveFile(uploadBucket, filePath, buffer, metaData);

			// Update organization with the new profile image url
			let orgObj = await orgCtrl.updateOneById(
				req.org._id,
				{
					pictureUrl: filePath,
					updatedBy: req.user._id,
				},
				{},
				{ cacheKey: req.org._id }
			);

			res.json(orgObj);

			// Log action
			auditCtrl.logAndNotify(
				req.org._id,
				req.user,
				"org",
				"update",
				t("Updated organization picture"),
				orgObj,
				{ orgId: req.org._id }
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/picture
@method     DELETE
@desc       Removes the profile picture of the organization.
@access     private
*/
router.delete(
	"/:orgId/picture",
	authSession,
	validateOrg,
	authorizeOrgAction("org.update"),
	async (req, res) => {
		try {
			// Delete existing file if it exists
			storage.deleteFile(req.org.pictureUrl);

			// Update user with the new profile image url
			let orgObj = await orgCtrl.updateOneById(
				req.org._id,
				{ updatedBy: req.user._id },
				{ pictureUrl: 1 },
				{ cacheKey: req.org._id }
			);

			res.json(orgObj);

			// Log action
			auditCtrl.logAndNotify(
				req.org._id,
				req.user,
				"org",
				"update",
				t("Removed organization picture"),
				orgObj,
				{ orgId: req.org._id }
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/invite?&uiBaseURL=http://...
@method     POST
@desc       Invites user(s) to the organization
@access     private
*/
router.post(
	"/:orgId/invite",
	checkContentType,
	authSession,
	validateOrg,
	authorizeOrgAction("org.invite.create"),
	invitationApplyRules("invite"),
	validate,
	async (req, res) => {
		try {
			const { user, org } = req;
			const { uiBaseURL } = req.query;

			// Get cluster configuration
			let cluster = await clsCtrl.getOneByQuery({
				clusterAccesssToken: process.env.CLUSTER_ACCESS_TOKEN,
			});

			const canSendEmail = cluster?.smtp ?? false;
			if (!canSendEmail) {
				return res.status(404).json({
					error: t("Not Allowed"),
					details: t(
						"You have not defined the SMTP server to send invitation emails in your cluster settings. An SMTP server needs to be defined to send invitation emails."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Prepare the invitations array to store in the database
			let invitations = [];
			req.body.forEach((entry) => {
				invitations.push({
					orgId: org._id,
					email: entry.email,
					token: helper.generateSlug("tkn", 36),
					role: entry.role,
				});
			});

			// Create invitations
			let result = await orgInvitationCtrl.createMany(invitations);

			// Send invitation emails
			invitations.forEach((entry) => {
				sendMessage("send-organization-inivation", {
					to: entry.email,
					role: entry.role,
					organization: org.name,
					url: `${uiBaseURL}/redirect-handle?token=${entry.token}&type=org-invite`,
				});
			});

			// If there are alreay user accounts with provided emails then send them realtime notifications
			let matchingUsers = await userCtrl.getManyByQuery({
				"loginProfiles.email": { $in: invitations.map((entry) => entry.email) },
				status: "Active",
			});

			// Send realtime notifications to invited users with accounts
			matchingUsers.forEach((entry) => {
				let userEmails = entry.loginProfiles.map((entry) => entry.email);
				// Find the invitation entry matching the user's emails
				let invite = invitations.find((entry) =>
					userEmails.includes(entry.email)
				);

				sendNotification(entry._id, {
					actor: {
						userId: user._id,
						name: user.name,
						pictureUrl: user.pictureUrl,
						color: user.color,
						contactEmail: user.contactEmail,
						loginEmail: user.loginProfiles[0].email,
					},
					action: "invite",
					object: "org.invite",
					description: t(
						"Invited you to join organization '%s' with '%s' permissions",
						org.name,
						invite.role
					),
					timestamp: Date.now(),
					data: {
						token: invite.token,
					},
					identifiers: { orgId: org._id },
				});
			});

			res.json(result);

			// Log action
			auditCtrl.log(
				user,
				"org.invite",
				"create",
				t("Invited users to organization %'s'", org.name),
				result,
				{ orgId: org._id }
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/invite?token=tkn_...
@method     PUT
@desc       Updates the invitation role
@access     private
*/
router.put(
	"/:orgId/invite",
	checkContentType,
	authSession,
	validateOrg,
	authorizeOrgAction("org.invite.update"),
	invitationApplyRules("update-invite"),
	validate,
	async (req, res) => {
		try {
			const { role } = req.body;
			const { token } = req.query;
			const { user, org } = req;

			let invite = await orgInvitationCtrl.getOneByQuery({ token });
			if (!invite) {
				return res.status(404).json({
					error: t("Not Found"),
					details: t("No such invitation exists."),
					code: ERROR_CODES.notFound,
				});
			}

			if (invite.status !== "Pending") {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"Organization invitation role can only be changed for invites in 'pending' status."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			//All good, update the invitation
			let updatedInvite = await orgInvitationCtrl.updateOneByQuery(
				{ token },
				{ role }
			);

			// If there is alreay a user account with provided email then send them realtime notifications
			let matchingUser = await userCtrl.getOneByQuery({
				"loginProfiles.email": invite.email,
				status: "Active",
			});

			if (matchingUser) {
				sendNotification(matchingUser._id, {
					actor: {
						userId: user._id,
						name: user.name,
						pictureUrl: user.pictureUrl,
						color: user.color,
						contactEmail: user.contactEmail,
						loginEmail: user.loginProfiles[0].email,
					},
					action: "invite",
					object: "org.invite",
					description: t(
						"Invited you to join organization '%s' with '%s' permissions",
						org.name,
						role
					),
					timestamp: Date.now(),
					data: {
						token: invite.token,
					},
					identifiers: { orgId: org._id },
				});
			}

			res.json(updatedInvite);

			// Log action
			auditCtrl.log(
				user,
				"org.invite",
				"update",
				t(
					"Updated invitation role of '%s' from '%s' to '%s'",
					invite.email,
					invite.role,
					role
				),
				updatedInvite,
				{ orgId: org._id }
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/invite-resend?token=tkn_...&uiBaseURL=http://...
@method     POST
@desc       Resends the organization invitation to the user email
@access     private
*/
router.post(
	"/:orgId/invite-resend",
	checkContentType,
	authSession,
	validateOrg,
	authorizeOrgAction("org.invite.resend"),
	invitationApplyRules("resend-invite"),
	validate,
	async (req, res) => {
		try {
			const { token, uiBaseURL } = req.query;
			const { user, org } = req;

			// Get cluster configuration
			let cluster = await clsCtrl.getOneByQuery({
				clusterAccesssToken: process.env.CLUSTER_ACCESS_TOKEN,
			});

			const canSendEmail = cluster?.smtp ?? false;
			if (!canSendEmail) {
				return res.status(404).json({
					error: t("Not Allowed"),
					details: t(
						"You have not defined the SMTP server to send invitation emails in your cluster settings. An SMTP server needs to be defined to send invitation emails."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			let invite = await orgInvitationCtrl.getOneByQuery({ token });
			if (!invite) {
				return res.status(404).json({
					error: t("Not Found"),
					details: t("No such invitation exists."),
					code: ERROR_CODES.notFound,
				});
			}

			if (invite.status !== "Pending") {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t("Invitations only in 'pending' status can be resent."),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Send invitation email
			sendMessage("send-organization-inivation", {
				to: invite.email,
				role: invite.role,
				organization: org.name,
				url: `${uiBaseURL}/redirect-handle?token=${invite.token}&type=org-invite`,
			});

			// If there are alreay user accounts with provided email then send them realtime notifications
			let matchingUser = await userCtrl.getOneByQuery({
				"loginProfiles.email": invite.email,
				status: "Active",
			});

			// Send realtime notifications to invited user with an account
			if (matchingUser) {
				sendNotification(matchingUser._id, {
					actor: {
						userId: user._id,
						name: user.name,
						pictureUrl: user.pictureUrl,
						color: user.color,
						contactEmail: user.contactEmail,
					},
					action: "invite",
					object: "org.invite",
					description: t(
						"Invited you to join organization '%s' with '%s' permissions",
						org.name,
						invite.role
					),
					timestamp: Date.now(),
					data: {
						token: invite.token,
					},
					identifiers: { orgId: org._id },
				});
			}
			res.json(invite);

			// Log action
			auditCtrl.log(
				user,
				"org.invite",
				"resend",
				t("Resent organization invitation to '%s'", invite.email),
				invite,
				{ orgId: org._id }
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/invite?token=tkn_...
@method     DELETE
@desc       Deletes the organization invitation to the user
@access     private
*/
router.delete(
	"/:orgId/invite",
	checkContentType,
	authSession,
	validateOrg,
	authorizeOrgAction("org.invite.delete"),
	invitationApplyRules("delete-invite"),
	validate,
	async (req, res) => {
		try {
			const { token } = req.query;
			const { user, org } = req;

			let invite = await orgInvitationCtrl.getOneByQuery({ token });
			if (!invite) {
				return res.status(404).json({
					error: t("Not Found"),
					details: t("No such invitation exists."),
					code: ERROR_CODES.notFound,
				});
			}

			// Delete the organization invitation
			await orgInvitationCtrl.deleteOneById(invite._id);

			res.json();

			// Log action
			auditCtrl.log(
				user,
				"org.invite",
				"delete",
				t("Deleted organization invitation to '%s'", invite.email),
				invite,
				{ orgId: org._id }
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/invite/multi
@method     DELETE
@desc       Deletes multiple organization invitations
@access     private
*/
router.delete(
	"/:orgId/invite/multi",
	checkContentType,
	authSession,
	validateOrg,
	authorizeOrgAction("org.invite.delete"),
	invitationApplyRules("delete-invite-multi"),
	validate,
	async (req, res) => {
		try {
			const { tokens } = req.body;
			const { user, org } = req;

			// Delete the organization invitations
			await orgInvitationCtrl.deleteManyByQuery({ token: { $in: tokens } });

			res.json();

			// Log action
			auditCtrl.log(
				user,
				"org.invite",
				"delete",
				t("Deleted multiple organization invitations"),
				{ tokens },
				{ orgId: org._id }
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/invite?page=0&size=10&status=&email=&role=&start=&end&sortBy=email&sortDir=asc
@method     GET
@desc       Get organization invitations
@access     private
*/
router.get(
	"/:orgId/invite",
	authSession,
	validateOrg,
	authorizeOrgAction("org.invite.view"),
	invitationApplyRules("get-invites"),
	validate,
	async (req, res) => {
		try {
			const { page, size, status, email, role, start, end, sortBy, sortDir } =
				req.query;

			let query = { orgId: req.org._id };
			if (email && email !== "null")
				query.email = { $regex: email, $options: "i" };

			if (status) {
				if (Array.isArray(status)) query.status = { $in: status };
				else query.status = status;
			}

			if (role) {
				if (Array.isArray(role)) query.role = { $in: role };
				else query.role = role;
			}

			if (start && !end) query.createdAt = { $gte: start };
			else if (!start && end) query.createdAt = { $lte: end };
			else if (start && end) query.createdAt = { $gte: start, $lte: end };

			let sort = {};
			if (sortBy && sortDir) {
				sort[sortBy] = sortDir;
			} else sort = { createdAt: "asc" };

			let invites = await orgInvitationCtrl.getManyByQuery(query, {
				sort,
				skip: size * page,
				limit: size,
			});

			res.json(invites);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/invite/list-eligible?page=0&size=10&email=&sortBy=email&sortDir=asc
@method     GET
@desc       Get eligible cluster members to invite to the organization
@access     private
*/
router.get(
	"/:orgId/invite/list-eligible",
	authSession,
	validateOrg,
	authorizeOrgAction("org.invite.view"),
	invitationApplyRules("get-invites"),
	validate,
	async (req, res) => {
		try {
			const { user, org } = req;
			const { page, size, search, sortBy, sortDir } = req.query;

			// Get current organization team
			let orgTeam = await orgMemberCtrl.getManyByQuery({ orgId: org._id });
			// We just need to get the cluster members that are not already a team member of the organization
			orgTeam = orgTeam.map((entry) => helper.objectId(entry.userId));
			// The current user is also not eligible for invitation
			orgTeam.push(helper.objectId(user._id));

			let query = { _id: { $nin: orgTeam }, status: "Active" };
			if (search && search !== "null") {
				query.$or = [
					{ name: { $regex: search, $options: "i" } },
					{ contactEmail: { $regex: search, $options: "i" } },
					{ "loginProfiles.email": { $regex: search, $options: "i" } },
				];
			}

			let sort = {};
			if (sortBy && sortDir) {
				sort[sortBy] = sortDir;
			} else sort = { name: "asc" };

			let users = await userCtrl.getManyByQuery(query, {
				sort,
				skip: size * page,
				limit: size,
				projection: "-loginProfiles.password -notifications",
			});

			res.json(users);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/member?role=&search&sortBy=email&sortDir=asc
@method     GET
@desc       Get organization members
@access     private
*/
router.get(
	"/:orgId/member",
	authSession,
	validateOrg,
	authorizeOrgAction("org.member.view"),
	async (req, res) => {
		try {
			const { org } = req;
			const { search, role, sortBy, sortDir } = req.query;

			let pipeline = [
				{
					$match: {
						orgId: helper.objectId(org._id),
					},
				},
				{
					$lookup: {
						from: "users",
						localField: "userId",
						foreignField: "_id",
						as: "user",
					},
				},
			];

			// Email or name search
			if (search && search !== "null") {
				pipeline.push({
					$match: {
						$or: [
							{
								"user.loginProfiles.email": { $regex: search, $options: "i" },
							},
							{
								"user.name": { $regex: search, $options: "i" },
							},
							{
								"user.contactEmail": { $regex: search, $options: "i" },
							},
						],
					},
				});
			}

			// Role filter
			if (role) {
				if (Array.isArray(role))
					pipeline.push({
						$match: {
							role: { $in: role },
						},
					});
				else
					pipeline.push({
						$match: {
							role: role,
						},
					});
			}

			// Sort rules (currently support role and createdAt fields)
			if (sortBy && sortDir) {
				pipeline.push({
					$sort: {
						[sortBy]: sortDir.toString().toLowerCase() === "desc" ? -1 : 1,
					},
				});
			} else
				pipeline.push({
					$sort: {
						createdAt: -1,
					},
				});

			let result = await orgMemberCtrl.aggregate(pipeline);
			res.json(
				result.map((entry) => {
					return {
						_id: entry._id,
						orgId: entry.orgId,
						role: entry.role,
						joinDate: entry.joinDate,
						member: {
							_id: entry.user[0]._id,
							iid: entry.user[0].iid,
							color: entry.user[0].color,
							contactEmail: entry.user[0].contactEmail,
							name: entry.user[0].name,
							pictureUrl: entry.user[0].pictureUrl,
							loginEmail: entry.user[0].loginProfiles[0].email,
							isOrgOwner:
								org.ownerUserId.toString() === entry.user[0]._id.toString(),
						},
					};
				})
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/member/exclude-current?role=&search&sortBy=email&sortDir=asc
@method     GET
@desc       Get organization members excluding the current user making this request
@access     private
*/
router.get(
	"/:orgId/member/exclude-current",
	authSession,
	validateOrg,
	authorizeOrgAction("org.member.view"),
	async (req, res) => {
		try {
			const { user, org } = req;
			const { search, role, sortBy, sortDir } = req.query;

			let pipeline = [
				{
					$match: {
						orgId: helper.objectId(org._id),
						userId: { $ne: helper.objectId(user._id) },
					},
				},
				{
					$lookup: {
						from: "users",
						localField: "userId",
						foreignField: "_id",
						as: "user",
					},
				},
			];

			// Email or name search
			if (search && search !== "null") {
				pipeline.push({
					$match: {
						$or: [
							{
								"user.loginProfiles.email": { $regex: search, $options: "i" },
							},
							{
								"user.name": { $regex: search, $options: "i" },
							},
							{
								"user.contactEmail": { $regex: search, $options: "i" },
							},
						],
					},
				});
			}

			// Role filter
			if (role) {
				if (Array.isArray(role))
					pipeline.push({
						$match: {
							role: { $in: role },
						},
					});
				else
					pipeline.push({
						$match: {
							role: role,
						},
					});
			}

			// Sort rules (currently support role and createdAt fields)
			if (sortBy && sortDir) {
				pipeline.push({
					$sort: {
						[sortBy]: sortDir.toString().toLowerCase() === "desc" ? -1 : 1,
					},
				});
			} else
				pipeline.push({
					$sort: {
						createdAt: -1,
					},
				});

			let result = await orgMemberCtrl.aggregate(pipeline);
			res.json(
				result.map((entry) => {
					return {
						_id: entry._id,
						orgId: entry.orgId,
						role: entry.role,
						joinDate: entry.joinDate,
						member: {
							_id: entry.user[0]._id,
							iid: entry.user[0].iid,
							color: entry.user[0].color,
							contactEmail: entry.user[0].contactEmail,
							name: entry.user[0].name,
							pictureUrl: entry.user[0].pictureUrl,
							loginEmail: entry.user[0].loginProfiles[0].email,
							isOrgOwner:
								org.ownerUserId.toString() === entry.user[0]._id.toString(),
						},
					};
				})
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/member/:userId
@method     PUT
@desc       Update role of organization member
@access     private
*/
router.put(
	"/:orgId/member/:userId",
	checkContentType,
	authSession,
	validateOrg,
	authorizeOrgAction("org.member.update"),
	memberApplyRules("update-member-role"),
	validate,
	async (req, res) => {
		try {
			const { userId } = req.params;
			const { role } = req.body;

			// Check if there is such a user
			let user = await userCtrl.getOneById(userId);
			if (!user) {
				return res.status(404).json({
					error: t("Not Found"),
					details: t("No such user exists"),
					code: ERROR_CODES.notFound,
				});
			}

			// Check if the user is a member of the organization or not
			let member = await orgMemberCtrl.getOneByQuery(
				{
					orgId: req.org._id,
					userId: userId,
				},
				{ cacheKey: `${req.org._id}.${userId}` }
			);

			if (!member) {
				return res.status(404).json({
					error: t("Not a Member"),
					details: t(
						"User is not a member of the organization '%s'.",
						req.org.name
					),
					code: ERROR_CODES.notFound,
				});
			}

			// Check if the target user is the current user or not. Users cannot change their own role.
			if (req.user._id.toString() === user._id.toString()) {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t("You cannot change your own organization role."),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Check if the target user is the organization owner. The role of organization owner cannot be changed.
			if (user._id.toString() === req.org.ownerUserId.toString()) {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t("You cannot change the role of the organization owner."),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Update the role of the user
			let result = await orgMemberCtrl.updateOneById(
				member._id,
				{ role },
				{},
				{ cacheKey: `${req.org._id}.${userId}` }
			);

			result = {
				...result,
				member: {
					_id: user._id,
					iid: user.iid,
					color: user.color,
					contactEmail: user.contactEmail,
					name: user.name,
					pictureUrl: user.pictureUrl,
					loginEmail: user.loginProfiles[0].email,
					isOrgOwner: req.org.ownerUserId.toString() === user._id.toString(),
				},
			};

			res.json(result);

			// Log action
			auditCtrl.logAndNotify(
				req.org._id,
				req.user,
				"org.member",
				"update",
				t(
					"Updated organization member role of user '%s' (%s) from '%s' to '%s'",
					user.name,
					user.contactEmail,
					member.role,
					role
				),
				result,
				{ orgId: req.org._id }
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/member/:userId
@method     DELETE
@desc       Remove member from organization
@access     private
*/
router.delete(
	"/:orgId/member/:userId",
	checkContentType,
	authSession,
	validateOrg,
	authorizeOrgAction("org.member.delete"),
	memberApplyRules("remove-member"),
	validate,
	async (req, res) => {
		const session = await orgMemberCtrl.startSession();
		try {
			const { userId } = req.params;

			// Check if there is such a user
			let user = await userCtrl.getOneById(userId);
			if (!user) {
				await orgMemberCtrl.endSession(session);
				return res.status(404).json({
					error: t("Not Found"),
					details: t("No such user exists"),
					code: ERROR_CODES.notFound,
				});
			}

			// Check if the user is a member of the organization or not
			let member = await orgMemberCtrl.getOneByQuery(
				{
					orgId: req.org._id,
					userId: userId,
				},
				{
					cacheKey: `${req.org._id}.${userId}`,
				}
			);

			if (!member) {
				await orgMemberCtrl.endSession(session);
				return res.status(404).json({
					error: t("Not a Member"),
					details: t(
						"User is not a member of the organization '%s'.",
						req.org.name
					),
					code: ERROR_CODES.notFound,
				});
			}

			// Check if the target user is the current user or not. Users cannot delete themselves from the org team, they need to leave from org team.
			if (req.user._id.toString() === user._id.toString()) {
				await orgMemberCtrl.endSession(session);
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"You cannot remove yourself from the organization. Try to leave the organization team."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Check if the user is the owner of the organization or not
			if (req.org.ownerUserId.toString() === user._id.toString()) {
				await orgMemberCtrl.endSession(session);
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"The organization owner cannot be removed from the organization team. If you would like to remove the current organization owner from the organization then the organization ownership needs to be transferred to another organization 'Admin' member."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Check to see if the user has app team memberships. If the user is member of an app then first the user needs to be removed from app teams.
			let apps = await appCtrl.getManyByQuery({
				orgId: req.org._id,
				"team.userId": userId,
			});

			// Check if the removed user is an app owner or not
			for (let i = 0; i < apps.length; i++) {
				const app = apps[i];
				if (app.ownerUserId.toString() === user._id.toString()) {
					await orgMemberCtrl.endSession(session);
					return res.status(422).json({
						error: t("Not Allowed"),
						details: t(
							"You cannot remove a user who owns an app from the organization. The user first needs to transfer the app '%s' ownership to another app 'Admin' member.",
							app.name
						),
						code: ERROR_CODES.notAllowed,
					});
				}
			}

			// Remove user from app teams
			for (let i = 0; i < apps.length; i++) {
				const app = apps[i];
				await appCtrl.pullObjectByQuery(
					app._id,
					"team",
					{ userId: user._id },
					{ updatedBy: req.user._id },
					{ cacheKey: app._id, session }
				);
			}

			// Remove user from the organization
			await orgMemberCtrl.deleteOneById(member._id, {
				session,
				cacheKey: `${req.org._id}.${userId}`,
			});

			// Commit changes
			await orgMemberCtrl.commit(session);
			res.json();

			// Log action
			auditCtrl.logAndNotify(
				req.org._id,
				req.user,
				"org.member",
				"delete",
				t(
					"Removed user '%s' (%s) from organization team",
					user.name,
					user.contactEmail
				),
				{
					_id: user._id,
					iid: user.iid,
					color: user.color,
					contactEmail: user.contactEmail,
					name: user.name,
					pictureUrl: user.pictureUrl,
					loginEmail: user.loginProfiles[0].email,
				},
				{ orgId: req.org._id }
			);

			if (apps.length > 0) {
				// Get all updated applications
				const appIds = apps.map((entry) => entry._id);
				const appsWithMembers = await appCtrl.getManyByQuery(
					{ _id: { $in: appIds } },
					{
						lookup: {
							path: "team.userId",
							select: "-loginProfiles -notifications",
						},
					}
				);

				// Send realtime notifications for updated apps
				appsWithMembers.forEach((entry) => {
					sendNotification(entry._id, {
						actor: {
							userId: req.user._id,
							name: req.user.name,
							pictureUrl: req.user.pictureUrl,
							color: req.user.color,
							contactEmail: req.user.contactEmail,
							loginEmail: req.user.loginProfiles[0].email,
						},
						action: "delete",
						object: "org.app.team",
						description: t(
							"Removed user '%s' (%s) from app team",
							user.name,
							user.contactEmail
						),
						timestamp: Date.now(),
						data: entry,
						identifiers: { orgId: org._id, appId: entry._id },
					});
				});
			}
		} catch (error) {
			await orgMemberCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/member/delete-multi
@method     POST
@desc       Remove multiple members from organization
@access     private
*/
router.post(
	"/:orgId/member/delete-multi",
	checkContentType,
	authSession,
	validateOrg,
	authorizeOrgAction("org.member.delete"),
	memberApplyRules("remove-members"),
	validate,
	async (req, res) => {
		const session = await orgMemberCtrl.startSession();
		try {
			const { userIds } = req.body;

			// Users cannot delete themselves from the org team, they need to leave from org team.
			if (userIds.includes(req.user._id.toString())) {
				await orgMemberCtrl.endSession(session);
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"You cannot remove yourself from the organization. Try to leave the organization team."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Check if one of the deleted user is the owner of the organization or not
			if (userIds.includes(req.org.ownerUserId.toString())) {
				await orgMemberCtrl.endSession(session);
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"The organization owner cannot be removed from the organization team. If you would like to remove the current organization owner from the organization, then the organization ownership needs to be transferred to another organization 'Admin' member."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Check to see if the deleted users have app team memberships. If they have then we first need to remove them from the app teams.
			let apps = await appCtrl.getManyByQuery({
				orgId: req.org._id,
				"team.userId": { $in: userIds },
			});

			// Check if any of the removed users is an app owner or not
			for (let i = 0; i < apps.length; i++) {
				const app = apps[i];
				if (userIds.includes(app.ownerUserId.toString())) {
					await orgMemberCtrl.endSession(session);
					return res.status(422).json({
						error: t("Not Allowed"),
						details: t(
							"You cannot remove a user who owns an app from the organization. The user first needs to transfer the app ownership to another app 'Admin' member."
						),
						code: ERROR_CODES.notAllowed,
					});
				}
			}

			// Remove users from app teams
			for (let i = 0; i < apps.length; i++) {
				const app = apps[i];
				await appCtrl.pullObjectByQuery(
					app._id,
					"team",
					{ userId: { $in: userIds } },
					{ updatedBy: req.user._id },
					{ cacheKey: app._id, session }
				);
			}

			// Remove users from the organization
			await orgMemberCtrl.deleteManyByQuery(
				{ orgId: req.org._id, userId: { $in: userIds } },
				{
					session,
					cacheKey: userIds.map((entry) => `${req.org._id}.${entry}`),
				}
			);

			// Commit changes
			await orgMemberCtrl.commit(session);
			res.json();

			// Log action
			auditCtrl.logAndNotify(
				req.org._id,
				req.user,
				"org.member",
				"delete",
				t("Removed users from organization team"),
				{
					userIds,
				},
				{ orgId: req.org._id }
			);

			if (apps.length > 0) {
				// Get all updated applications
				const appIds = apps.map((entry) => entry._id);
				const appsWithMembers = await appCtrl.getManyByQuery(
					{ _id: { $in: appIds } },
					{
						lookup: {
							path: "team.userId",
							select: "-loginProfiles -notifications",
						},
					}
				);

				// Send realtime notifications for updated apps
				appsWithMembers.forEach((entry) => {
					sendNotification(entry._id, {
						actor: {
							userId: req.user._id,
							name: req.user.name,
							pictureUrl: req.user.pictureUrl,
							color: req.user.color,
							contactEmail: req.user.contactEmail,
							loginEmail: req.user.loginProfiles[0].email,
						},
						action: "delete",
						object: "org.app.team",
						description: t("Removed user(s) from app team"),
						timestamp: Date.now(),
						data: entry,
						identifiers: { orgId: org._id, appId: entry._id },
					});
				});
			}
		} catch (error) {
			await orgMemberCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/member
@method     DELETE
@desc       Leave organization team
@access     private
*/
router.delete(
	"/:orgId/member",
	checkContentType,
	authSession,
	validateOrg,
	async (req, res) => {
		const session = await orgMemberCtrl.startSession();
		try {
			const { user } = req;
			// Check if the user is a member of the organization or not
			let member = await orgMemberCtrl.getOneByQuery(
				{
					orgId: req.org._id,
					userId: user._id,
				},
				{
					cacheKey: `${req.org._id}.${user._id}`,
				}
			);

			if (!member) {
				await orgMemberCtrl.endSession(session);
				return res.status(404).json({
					error: t("Not a Member"),
					details: t(
						"You are not a member of the organization '%s'.",
						req.org.name
					),
					code: ERROR_CODES.notFound,
				});
			}

			// Check if the user is the owner of the organization or not
			if (req.org.ownerUserId.toString() === user._id) {
				await orgMemberCtrl.endSession(session);
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"You are the owner of the organization. The organization owner cannot leave the organization team. You first need to transfer organization ownership to another organization 'Admin' member."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Check to see if the user has app team memberships. If the user is member of an app then first the user needs to be removed from app teams.
			let apps = await appCtrl.getManyByQuery({
				orgId: req.org._id,
				"team.userId": user._id,
			});

			// Check if the removed user is an app owner or not
			for (let i = 0; i < apps.length; i++) {
				const app = apps[i];
				if (app.ownerUserId.toString() === user._id.toString()) {
					await orgMemberCtrl.endSession(session);
					return res.status(422).json({
						error: t("Not Allowed"),
						details: t(
							"You cannot leave the organization team, because you are owner of at least one app of the organization. You first need to transfer  app '%s' ownership to another app 'Admin' member.",
							app.name
						),
						code: ERROR_CODES.notAllowed,
					});
				}
			}

			// Remove user from app teams
			for (let i = 0; i < apps.length; i++) {
				const app = apps[i];
				await appCtrl.pullObjectByQuery(
					app._id,
					"team",
					{ userId: user._id },
					{ updatedBy: user._id },
					{ cacheKey: app._id, session }
				);
			}

			// Leave the organization team
			await orgMemberCtrl.deleteOneByQuery(
				{ orgId: req.org._id, userId: user._id },
				{
					cacheKey: `${req.org._id}.${user._id}`,
					session,
				}
			);

			// Commit changes
			await orgMemberCtrl.commit(session);
			res.json();

			// Log action
			auditCtrl.logAndNotify(
				req.org._id,
				req.user,
				"org.member",
				"delete",
				t(
					"User '%s' (%s) has left the organization team",
					user.name,
					user.contactEmail
				),
				{
					_id: user._id,
					iid: user.iid,
					color: user.color,
					contactEmail: user.contactEmail,
					name: user.name,
					pictureUrl: user.pictureUrl,
					loginEmail: user.loginProfiles[0].email,
				},
				{ orgId: req.org._id }
			);

			if (apps.length > 0) {
				// Get all updated applications
				const appIds = apps.map((entry) => entry._id);
				const appsWithMembers = await appCtrl.getManyByQuery(
					{ _id: { $in: appIds } },
					{
						lookup: {
							path: "team.userId",
							select: "-loginProfiles -notifications",
						},
					}
				);

				// Send realtime notifications for updated apps
				appsWithMembers.forEach((entry) => {
					sendNotification(entry._id, {
						actor: {
							userId: req.user._id,
							name: req.user.name,
							pictureUrl: req.user.pictureUrl,
							color: req.user.color,
							contactEmail: req.user.contactEmail,
							loginEmail: req.user.loginProfiles[0].email,
						},
						action: "delete",
						object: "org.app.team",
						description: t(
							"User '%s' (%s) has left the app team",
							user.name,
							user.contactEmail
						),
						timestamp: Date.now(),
						data: entry,
						identifiers: { orgId: org._id, appId: entry._id },
					});
				});
			}
		} catch (error) {
			await orgMemberCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/transfer/:userId
@method     POST
@desc       Transfers the ownership of the organization to an existing organization member.
@access     private
*/
router.post(
	"/:orgId/transfer/:userId",
	checkContentType,
	authSession,
	validateOrg,
	authorizeOrgAction("org.transfer"),
	applyRules("transfer"),
	validate,
	async (req, res) => {
		try {
			// Get transferred user information
			let transferredUser = await userCtrl.getOneById(req.params.userId);

			// Transfer organization ownership
			let orgObj = await orgCtrl.updateOneById(
				req.org._id,
				{ ownerUserId: transferredUser._id, updatedBy: req.user._id },
				{},
				{ cacheKey: req.org._id }
			);

			res.json(orgObj);

			// Log action
			auditCtrl.logAndNotify(
				req.org._id,
				req.user,
				"org",
				"transfer",
				t(
					"Transferred organization ownership to user '%s' (%s)",
					transferredUser.name,
					transferredUser.contactEmail
				),
				orgObj,
				{ orgId: req.org._id }
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

export default router;
