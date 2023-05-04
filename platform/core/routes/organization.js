import express from "express";
import sharp from "sharp";
import orgCtrl from "../controllers/organization.js";
import appCtrl from "../controllers/app.js";
import orgMemberCtrl from "../controllers/organizationMember.js";
import userCtrl from "../controllers/user.js";
import orgInvitationCtrl from "../controllers/orgInvitation.js";
import resourceCtrl from "../controllers/resource.js";
import auditCtrl from "../controllers/audit.js";
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
router.get("/roles", checkContentType, authSession, async (req, res) => {
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
router.get("/", checkContentType, authSession, async (req, res) => {
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
					.sort((a, b) => {
						if (a.name < b.name) return -1;
						if (a.name > b.name) return 1;
						return 0;
					})
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
					.sort((a, b) => {
						if (a.name < b.name) return -1;
						if (a.name > b.name) return 1;
						return 0;
					})
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

			// We just need to create the storage resource, default queue and scheduler are bound to the existing resources
			await resourceCtrl.manageClusterResources([
				resources.storage,
				resources.queue,
				resources.scheduler,
			]);

			// Log action
			auditCtrl.log(
				req.user,
				"org",
				"create",
				t("Created a new organization named '%s'", name),
				req.body,
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
@method     GET
@desc       Returns organization information of the user
@access     private
*/
router.get(
	"/:orgId",
	checkContentType,
	authSession,
	validateOrg,
	async (req, res) => {
		try {
			res.json({ ...req.org, role: req.orgMembrer.role });
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

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

			// Resize image if width and height specifiec
			buffer = await sharp(req.file.buffer).resize(width, height).toBuffer();

			// A bucket is a container for objects (files)
			const bucket = storage.bucket(config.get("storage.orgImagesBucket"));
			// Create a new blob in the bucket and upload the file data
			let blob = bucket.file(
				`${helper.generateSlug("img", 6)}-${req.file.originalname}`
			);

			// Delete old porfile picture if exists
			if (req.user.pictureUrl) {
				try {
					// Get the file name
					let filename = req.user.pictureUrl.substring(
						req.user.pictureUrl.lastIndexOf("/") + 1
					);
					let oldFile = bucket.file(filename);
					let exists = await oldFile.exists();
					if (exists[0]) await oldFile.delete();
				} catch (err) {}
			}

			// Make sure to set the contentType metadata for the browser to be able to render the image instead of downloading the file (default behavior)
			const blobStream = blob
				.createWriteStream({
					metadata: {
						contentType: req.file.mimetype,
						metadata: {
							uploadDtm: Date.now(),
						},
					},
				})
				.on("error", (err) => {
					return res.status(400).json({
						error: t("Upload Failed"),
						details: t(
							"An error occured while uploading the profile image. %s",
							err.message
						),
						code: ERROR_CODES.fileUploadError,
					});
				})
				.on("finish", () => {
					// The public URL can be used to directly access the file via HTTP.
					const pictureUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

					// Make the image public to the web
					blob.makePublic().then(async () => {
						// Update user with the new profile image url
						let orgObj = await orgCtrl.updateOneById(
							req.org._id,
							{
								pictureUrl,
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
					});
				});

			blobStream.end(buffer);
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
			// A bucket is a container for objects (files)
			const bucket = storage.bucket(config.get("storage.orgImagesBucket"));
			// Delete the porfile picture if exists from storages
			if (req.org.pictureUrl) {
				try {
					// Get the file name
					let filename = req.org.pictureUrl.substring(
						req.user.pictureUrl.lastIndexOf("/") + 1
					);
					let oldFile = bucket.file(filename);
					let exists = await oldFile.exists();
					if (exists[0]) await oldFile.delete();
				} catch (err) {}
			}

			// Update user with the new profile image url
			let orgObj = await orgCtrl.updateOneById(
				req.org._id,
				{ updatedBy: req.user._id },
				{ pictureUrl: 1 },
				{ cacheKey: req.org._id }
			);

			res.json(orgObj);

			// Log action
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
@route      /v1/org/:orgId/invite
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
					url: `${config.get("general.uiBaseUrl")}/v1/user/invitation/${
						entry.token
					}`,
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
				// Find the invidation entry matching the user's emails
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

			// If there are alreay a user account with provided email then send them realtime notifications
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
@route      /v1/org/:orgId/invite-resend?token=tkn_...
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
					details: t("Invitations only in 'pending' status can be resent."),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Send invitation email
			sendMessage("send-organization-inivation", {
				to: invite.email,
				role: invite.role,
				organization: org.name,
				url: `${config.get("general.uiBaseUrl")}/v1/user/invitation/${
					invite.token
				}`,
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
@route      /v1/org/:orgId/invite?page=0&size=10&status=&email=&role=&start=&end&sortBy=email&sortDir=asc
@method     GET
@desc       Get user invitations
@access     private
*/
router.get(
	"/:orgId/invite",
	checkContentType,
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
			else if (start && end) query.createdAt = { $gte: start, $lt: end };

			let sort = {};
			if (sortBy && sortDir) {
				sort[sortBy] = sortDir;
			} else sort = { createdAt: "desc" };

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
@route      /v1/org/:orgId/member?page=0&size=10&role=&search&sortBy=email&sortDir=asc
@method     GET
@desc       Get organization members
@access     private
*/
router.get(
	"/:orgId/member",
	checkContentType,
	authSession,
	validateOrg,
	authorizeOrgAction("org.member.view"),
	memberApplyRules("get-members"),
	validate,
	async (req, res) => {
		try {
			const { org } = req;
			const { page, size, search, role, sortBy, sortDir } = req.query;

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

			// Pagination
			pipeline.push({
				$skip: size * page,
			});
			pipeline.push({
				$limit: size,
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
@route      /v1/org/:orgId/me
@method     GET
@desc       Get current user's organization membership info
@access     private
*/
router.get(
	"/:orgId/me",
	checkContentType,
	authSession,
	validateOrg,
	authorizeOrgAction("org.member.view"),
	async (req, res) => {
		try {
			const { org, user } = req;

			let pipeline = [
				{
					$match: {
						orgId: helper.objectId(org._id),
						userId: helper.objectId(user._id),
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

			let result = await orgMemberCtrl.aggregate(pipeline);
			let processedList = result.map((entry) => {
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
					},
				};
			});
			res.json(processedList.length > 0 ? processedList[0] : undefined);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/member/exclude-current?page=0&size=10&role=&search&sortBy=email&sortDir=asc
@method     GET
@desc       Get organization members excluding the current user making this request
@access     private
*/
router.get(
	"/:orgId/member/exclude-current",
	checkContentType,
	authSession,
	validateOrg,
	authorizeOrgAction("org.member.view"),
	memberApplyRules("get-members"),
	validate,
	async (req, res) => {
		try {
			const { user, org } = req;
			const { page, size, search, role, sortBy, sortDir } = req.query;

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

			// Pagination
			pipeline.push({
				$skip: size * page,
			});
			pipeline.push({
				$limit: size,
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
			let member = await orgMemberCtrl.getOneByQuery({
				orgId: req.org._id,
				userId: userId,
			});

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

			// Check if the target user is the organization creator. The role of organization owner cannot be changed.
			if (user._id.toString() === req.org.createdBy.toString()) {
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
					"Updated organization member role of user '%s' from '%s' to '%s'",
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
		try {
			const { userId } = req.params;

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
				{
					cacheKey: `${req.org._id}.${userId}`,
				}
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

			// Check if the user is the creator of the organization or not
			if (req.org.createdBy.toString() === userId) {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"You are the owner of the organization. The organization owner cannot be removed from the organization team."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Check to see if the user has app team memberships. If the use is member of an app then first the user needs to be removed from app teams.
			let apps = await appCtrl.getManyByQuery({
				orgId: req.org._id,
				"team.userId": userId,
			});

			if (apps.length > 0) {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"User is a team member in at least one of the apps of the organization. You first need to remove the user from these app teams and then remove it from the organization team."
					),
					code: ERROR_CODES.notFound,
				});
			}

			// Remove user from the organization
			await orgMemberCtrl.deleteOneById(member._id, {
				cacheKey: `${req.org._id}.${userId}`,
			});

			res.json();

			// Log action
			auditCtrl.logAndNotify(
				req.org._id,
				req.user,
				"org.member",
				"delete",
				t("Removed user '%s' from organization team", user.contactEmail),
				{
					_id: user._id,
					iid: user.iid,
					color: user.color,
					contactEmail: user.contactEmail,
					name: user.name,
					pictureUrl: user.pictureUrl,
				},
				{ orgId: req.org._id }
			);
		} catch (error) {
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
				return res.status(404).json({
					error: t("Not a Member"),
					details: t(
						"You are not a member of the organization '%s'.",
						req.org.name
					),
					code: ERROR_CODES.notFound,
				});
			}

			// Check if the user is the creator of the organization or not
			if (req.org.createdBy.toString() === user._id) {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"You are the owner of the organization. The organization owner cannot leave the organization team."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Check to see if the user has app team memberships. If the use is member of an app then first the user needs to be removed from app teams.
			let apps = await appCtrl.getManyByQuery({
				orgId: req.org._id,
				"team.userId": user._id,
			});

			if (apps.length > 0) {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"You are a team member in at least one of the apps of the organization. You first need to leave from these app teams and then leave from the organization team."
					),
					code: ERROR_CODES.notFound,
				});
			}

			// Leave the organization team
			await orgMemberCtrl.deleteOneById(user._id, {
				cacheKey: `${req.org._id}.${user._id}`,
			});

			res.json();

			// Log action
			auditCtrl.logAndNotify(
				req.org._id,
				req.user,
				"org.member",
				"delete",
				t("User '%s' has left the organization team", user.contactEmail),
				{
					_id: user._id,
					iid: user.iid,
					color: user.color,
					contactEmail: user.contactEmail,
					name: user.name,
					pictureUrl: user.pictureUrl,
				},
				{ orgId: req.org._id }
			);
		} catch (error) {
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
				{ createdBy: transferredUser._id, updatedBy: req.user._id },
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
					"Transferred organization ownership to '%s'",
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
