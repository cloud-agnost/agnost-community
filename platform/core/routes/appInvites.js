import express from "express";
import userCtrl from "../controllers/user.js";
import auditCtrl from "../controllers/audit.js";
import appInvitationCtrl from "../controllers/appInvitation.js";
import orgMemberCtrl from "../controllers/organizationMember.js";
import { authSession } from "../middlewares/authSession.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validateOrg } from "../middlewares/validateOrg.js";
import { validateApp } from "../middlewares/validateApp.js";
import { authorizeAppAction } from "../middlewares/authorizeAppAction.js";
import { applyRules as invitationApplyRules } from "../schemas/appInvitation.js";
import { applyRules as memberApplyRules } from "../schemas/organizationMember.js";
import { validate } from "../middlewares/validate.js";
import { sendMessage } from "../init/queue.js";
import { sendMessage as sendNotification } from "../init/sync.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/org/:orgId/app/:appId/invite
@method     POST
@desc       Invites user(s) to the app
@access     private
*/
router.post(
	"/",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	authorizeAppAction("app.invite.create"),
	invitationApplyRules("invite"),
	validate,
	async (req, res) => {
		try {
			const { user, org, app } = req;
			// Prepare the invitations array to store in the database
			let invitations = [];
			req.body.forEach((entry) => {
				invitations.push({
					orgId: org._id,
					appId: app._id,
					email: entry.email,
					token: helper.generateSlug("tkn", 36),
					role: entry.role,
					orgRole: "Developer",
				});
			});

			// Create invitations
			let result = await appInvitationCtrl.createMany(invitations);

			// Send invitation emails
			invitations.forEach((entry) => {
				sendMessage("send-app-inivation", {
					to: entry.email,
					role: entry.role,
					organization: org.name,
					app: app.name,
					url: `${process.env.UI_BASE_URL}/v1/user/invitation/app/${entry.token}`,
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
					object: "org.app.invite",
					description: t(
						"Invited you to join app '%s' in organization '%s' with '%s' permissions",
						app.name,
						org.name,
						invite.role
					),
					timestamp: Date.now(),
					data: {
						token: invite.token,
					},
					identifiers: { orgId: org._id, appId: app._id },
				});
			});

			res.json(result);

			// Log action
			auditCtrl.log(
				user,
				"org.app.invite",
				"create",
				t("Invited users to app '%s' in organization '%s'", app.name, org.name),
				result,
				{ orgId: org._id, appId: app._id }
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/invite?token=tkn_...
@method     PUT
@desc       Updates the app invitation role
@access     private
*/
router.put(
	"/",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	authorizeAppAction("app.invite.update"),
	invitationApplyRules("update-invite"),
	validate,
	async (req, res) => {
		try {
			const { role } = req.body;
			const { token } = req.query;
			const { user, org, app } = req;

			let invite = await appInvitationCtrl.getOneByQuery({ token });
			if (!invite) {
				return res.status(404).json({
					error: t("Not Found"),
					details: t("No such app invitation exists."),
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

			//All good, update the invitation
			let updatedInvite = await appInvitationCtrl.updateOneByQuery(
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
					object: "org.app.invite",
					description: t(
						"Invited you to join app '%s' in organization '%s' with '%s' permissions",
						app.name,
						org.name,
						role
					),
					timestamp: Date.now(),
					data: {
						token: invite.token,
					},
					identifiers: { orgId: org._id, appId: app._id },
				});
			}

			res.json(updatedInvite);

			// Log action
			auditCtrl.log(
				user,
				"org.app.invite",
				"update",
				t(
					"Updated app invitation role of '%s' from '%s' to '%s'",
					invite.email,
					invite.role,
					role
				),
				updatedInvite,
				{ orgId: org._id, appId: app._id }
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/invite/resend?token=tkn_...
@method     POST
@desc       Resends the app invitation to the user email
@access     private
*/
router.post(
	"/resend",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	authorizeAppAction("app.invite.resend"),
	invitationApplyRules("resend-invite"),
	validate,
	async (req, res) => {
		try {
			const { token } = req.query;
			const { user, org, app } = req;

			let invite = await appInvitationCtrl.getOneByQuery({ token });
			if (!invite) {
				return res.status(404).json({
					error: t("Not Found"),
					details: t("No such app invitation exists."),
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
			sendMessage("send-app-inivation", {
				to: invite.email,
				role: invite.role,
				organization: org.name,
				app: app.name,
				url: `${process.env.UI_BASE_URL}/v1/user/invitation/app/${invite.token}`,
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
					object: "org.app.invite",
					description: t(
						"Invited you to join app '%s' in organization '%s' with '%s' permissions",
						app.name,
						org.name,
						invite.role
					),
					timestamp: Date.now(),
					data: {
						token: invite.token,
					},
					identifiers: { orgId: org._id, appId: app._id },
				});
			}
			res.json(invite);

			// Log action
			auditCtrl.log(
				user,
				"org.app.invite",
				"resend",
				t("Resent app invitation to '%s'", invite.email),
				invite,
				{ orgId: org._id, appId: app._id }
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/invite?token=tkn_...
@method     DELETE
@desc       Deletes the organization invitation to the user
@access     private
*/
router.delete(
	"/",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	authorizeAppAction("app.invite.delete"),
	invitationApplyRules("delete-invite"),
	validate,
	async (req, res) => {
		try {
			const { token } = req.query;
			const { user, org, app } = req;

			let invite = await appInvitationCtrl.getOneByQuery({ token });
			if (!invite) {
				return res.status(404).json({
					error: t("Not Found"),
					details: t("No such app invitation exists."),
					code: ERROR_CODES.notFound,
				});
			}

			// Delete the organization invitation
			await appInvitationCtrl.deleteOneById(invite._id);

			res.json();

			// Log action
			auditCtrl.log(
				user,
				"org.app.invite",
				"delete",
				t("Deleted app invitation to '%s'", invite.email),
				invite,
				{ orgId: org._id, appId: app._id }
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/invite?page=0&size=10&status=&email=&role=&start=&end&sortBy=email&sortDir=asc
@method     GET
@desc       Get app invitations
@access     private
*/
router.get(
	"/",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	authorizeAppAction("app.invite.view"),
	invitationApplyRules("get-invites"),
	validate,
	async (req, res) => {
		try {
			const { org, app } = req;
			const { page, size, status, email, role, start, end, sortBy, sortDir } =
				req.query;

			let query = { orgId: org._id, appId: app._id };
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

			let invites = await appInvitationCtrl.getManyByQuery(query, {
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
@route      /v1/org/:orgId/app/:appId/invite/list-eligible?page=0&size=10&email=&sortBy=email&sortDir=asc
@method     GET
@desc       Get eligible organization members to invite to app
@access     private
*/
router.get(
	"/list-eligible",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	authorizeAppAction("app.team.view"),
	memberApplyRules("list-eligible"),
	validate,
	async (req, res) => {
		try {
			const { org, app } = req;
			const { page, size, email, sortBy, sortDir } = req.query;

			// We just need to get the organization members that are not already a team member of the app
			let appTeam = app.team.map((entry) => helper.objectId(entry.userId));

			let pipeline = [
				{
					$match: {
						orgId: helper.objectId(org._id),
						userId: { $nin: appTeam },
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

			// Email search
			if (email && email !== "null") {
				pipeline.push({
					$match: {
						"user.loginProfiles.email": { $regex: email, $options: "i" },
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

export default router;
