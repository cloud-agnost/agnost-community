import express from "express";
import userCtrl from "../controllers/user.js";
import auditCtrl from "../controllers/audit.js";
import prjInvitationCtrl from "../controllers/projectInvitation.js";
import clsCtrl from "../controllers/cluster.js";
import { authSession } from "../middlewares/authSession.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validateOrg } from "../middlewares/validateOrg.js";
import { validateProject } from "../middlewares/validateProject.js";
import { authorizeProjectAction } from "../middlewares/authorizeProjectAction.js";
import { validateGitOps } from "../middlewares/validateGitOps.js";
import { applyRules as invitationApplyRules } from "../schemas/projectInvitation.js";
import { validate } from "../middlewares/validate.js";
import { sendMessage } from "../init/queue.js";
import { sendMessage as sendNotification } from "../init/sync.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/org/:orgId/project/:projectId/invite?uiBaseURL=http://...
@method     POST
@desc       Invites user(s) to the project
@access     private
*/
router.post(
	"/",
	checkContentType,
	authSession,
	validateGitOps,
	validateOrg,
	validateProject,
	authorizeProjectAction("project.invite.create"),
	invitationApplyRules("invite"),
	validate,
	async (req, res) => {
		try {
			const { user, org, project } = req;
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
					projectId: project._id,
					email: entry.email,
					token: helper.generateSlug("tkn", 36),
					role: entry.role,
					orgRole: "Member",
				});
			});

			// Create invitations
			let result = await prjInvitationCtrl.createMany(invitations);

			// Send invitation emails
			invitations.forEach((entry) => {
				sendMessage("send-project-inivation", {
					to: entry.email,
					role: entry.role,
					organization: org.name,
					project: project.name,
					url: `${uiBaseURL}/studio/redirect-handle?token=${entry.token}&type=project-invite`,
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
					object: "org.project.invite",
					description: t(
						"Invited you to join project '%s' in organization '%s' with '%s' permissions",
						project.name,
						org.name,
						invite.role
					),
					timestamp: Date.now(),
					data: {
						token: invite.token,
					},
					identifiers: { orgId: org._id, projectId: project._id },
				});
			});

			res.json(result);

			// Log action
			auditCtrl.log(
				user,
				"org.project.invite",
				"create",
				t(
					"Invited users to project '%s' in organization '%s'",
					project.name,
					org.name
				),
				result,
				{ orgId: org._id, projectId: project._id }
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/project/:projectId/invite?token=tkn_...
@method     PUT
@desc       Updates the project invitation role
@access     private
*/
router.put(
	"/",
	checkContentType,
	authSession,
	validateGitOps,
	validateOrg,
	validateProject,
	authorizeProjectAction("project.invite.update"),
	invitationApplyRules("update-invite"),
	validate,
	async (req, res) => {
		try {
			const { role } = req.body;
			const { token } = req.query;
			const { user, org, project } = req;

			let invite = await prjInvitationCtrl.getOneByQuery({ token });
			if (!invite) {
				return res.status(404).json({
					error: t("Not Found"),
					details: t("No such project invitation exists."),
					code: ERROR_CODES.notFound,
				});
			}

			if (invite.status !== "Pending") {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"Invitation role can only be changed for invites in 'pending' status."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// All good, update the invitation
			let updatedInvite = await prjInvitationCtrl.updateOneByQuery(
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
					object: "org.project.invite",
					description: t(
						"Invited you to join project '%s' in organization '%s' with '%s' permissions",
						project.name,
						org.name,
						role
					),
					timestamp: Date.now(),
					data: {
						token: invite.token,
					},
					identifiers: { orgId: org._id, projectId: project._id },
				});
			}

			res.json(updatedInvite);

			// Log action
			auditCtrl.log(
				user,
				"org.project.invite",
				"update",
				t(
					"Updated project invitation role of '%s' from '%s' to '%s'",
					invite.email,
					invite.role,
					role
				),
				updatedInvite,
				{ orgId: org._id, projectId: project._id }
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/project/:projectId/invite/resend?token=tkn_...&uiBaseURL=http://...
@method     POST
@desc       Resends the project invitation to the user email
@access     private
*/
router.post(
	"/resend",
	checkContentType,
	authSession,
	validateGitOps,
	validateOrg,
	validateProject,
	authorizeProjectAction("project.invite.resend"),
	invitationApplyRules("resend-invite"),
	validate,
	async (req, res) => {
		try {
			const { token, uiBaseURL } = req.query;
			const { user, org, project } = req;

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

			let invite = await prjInvitationCtrl.getOneByQuery({ token });
			if (!invite) {
				return res.status(404).json({
					error: t("Not Found"),
					details: t("No such project invitation exists."),
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
			sendMessage("send-project-inivation", {
				to: invite.email,
				role: invite.role,
				organization: org.name,
				project: project.name,
				url: `${uiBaseURL}/studio/redirect-handle?token=${invite.token}&type=project-invite`,
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
					object: "org.project.invite",
					description: t(
						"Invited you to join project '%s' in organization '%s' with '%s' permissions",
						project.name,
						org.name,
						invite.role
					),
					timestamp: Date.now(),
					data: {
						token: invite.token,
					},
					identifiers: { orgId: org._id, projectId: project._id },
				});
			}
			res.json(invite);

			// Log action
			auditCtrl.log(
				user,
				"org.project.invite",
				"resend",
				t("Resent project invitation to '%s'", invite.email),
				invite,
				{ orgId: org._id, projectId: project._id }
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/project/:projectId/invite?token=tkn_...
@method     DELETE
@desc       Deletes the project invitation to the user
@access     private
*/
router.delete(
	"/",
	checkContentType,
	authSession,
	validateGitOps,
	validateOrg,
	validateProject,
	authorizeProjectAction("project.invite.delete"),
	invitationApplyRules("delete-invite"),
	validate,
	async (req, res) => {
		try {
			const { token } = req.query;
			const { user, org, project } = req;

			let invite = await prjInvitationCtrl.getOneByQuery({ token });
			if (!invite) {
				return res.status(404).json({
					error: t("Not Found"),
					details: t("No such project invitation exists."),
					code: ERROR_CODES.notFound,
				});
			}

			// Delete the organization invitation
			await prjInvitationCtrl.deleteOneById(invite._id);

			res.json();

			// Log action
			auditCtrl.log(
				user,
				"org.project.invite",
				"delete",
				t("Deleted project invitation to '%s'", invite.email),
				invite,
				{ orgId: org._id, projectId: project._id }
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/project/:projectId/invite/multi
@method     DELETE
@desc       Deletes multiple project invitations
@access     private
*/
router.delete(
	"/multi",
	checkContentType,
	authSession,
	validateGitOps,
	validateOrg,
	validateProject,
	authorizeProjectAction("project.invite.delete"),
	invitationApplyRules("delete-invite-multi"),
	validate,
	async (req, res) => {
		try {
			const { tokens } = req.body;
			const { user, org, project } = req;

			// Delete the project invitations
			await prjInvitationCtrl.deleteManyByQuery({ token: { $in: tokens } });

			res.json();

			// Log action
			auditCtrl.log(
				user,
				"org.project.invite",
				"delete",
				t("Deleted multiple project invitations"),
				{ tokens },
				{ orgId: org._id, projectId: project._id }
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/project/:projectId/invite?page=0&size=10&status=&email=&role=&start=&end&sortBy=email&sortDir=asc
@method     GET
@desc       Get project invitations
@access     private
*/
router.get(
	"/",
	authSession,
	validateGitOps,
	validateOrg,
	validateProject,
	authorizeProjectAction("project.invite.view"),
	invitationApplyRules("get-invites"),
	validate,
	async (req, res) => {
		try {
			const { org, project } = req;
			const { page, size, status, email, role, start, end, sortBy, sortDir } =
				req.query;

			let query = { orgId: org._id, projectId: project._id };
			if (email && email !== "null")
				query.email = {
					$regex: helper.escapeStringRegexp(email),
					$options: "i",
				};

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
			} else sort = { createdAt: "desc" };

			let invites = await prjInvitationCtrl.getManyByQuery(query, {
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
@route      /v1/org/:orgId/project/:projectId/invite/list-eligible?page=0&size=10&email=&sortBy=email&sortDir=asc
@method     GET
@desc       Get eligible cluster members to invite to the project
@access     private
*/
router.get(
	"/list-eligible",
	authSession,
	validateGitOps,
	validateOrg,
	validateProject,
	authorizeProjectAction("project.team.view"),
	invitationApplyRules("list-eligible"),
	validate,
	async (req, res) => {
		try {
			const { user, project } = req;
			const { page, size, search, sortBy, sortDir } = req.query;

			// We just need to get the project members that are not already a team member of the project
			let projectTeam = project.team.map((entry) =>
				helper.objectId(entry.userId)
			);
			// The current user is also not eligible for invitation
			projectTeam.push(helper.objectId(user._id));

			let query = { _id: { $nin: projectTeam }, status: "Active" };
			if (search && search !== "null") {
				query.$or = [
					{
						name: { $regex: helper.escapeStringRegexp(search), $options: "i" },
					},
					{
						contactEmail: {
							$regex: helper.escapeStringRegexp(search),
							$options: "i",
						},
					},
					{
						"loginProfiles.email": {
							$regex: helper.escapeStringRegexp(search),
							$options: "i",
						},
					},
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
				projection: "-loginProfiles.password -notifications -editorSettings",
			});

			res.json(users);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

export default router;
