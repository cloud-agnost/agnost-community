import express from "express";
import appCtrl from "../controllers/app.js";
import userCtrl from "../controllers/user.js";
import auditCtrl from "../controllers/audit.js";
import { authSession } from "../middlewares/authSession.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validateOrg } from "../middlewares/validateOrg.js";
import { validateApp } from "../middlewares/validateApp.js";
import { authorizeAppAction } from "../middlewares/authorizeAppAction.js";
import { applyRules } from "../schemas/app.js";
import { validate } from "../middlewares/validate.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/org/:orgId/app/:appId/team
@method     GET
@desc       Get application team members
@access     private
*/
router.get(
	"/",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	authorizeAppAction("app.team.view"),
	async (req, res) => {
		try {
			const { app } = req;

			let appTeam = await appCtrl.getOneById(app._id, {
				lookup: "team.userId",
			});

			res.json(
				appTeam.team.map((entry) => {
					return {
						_id: entry._id,
						appId: app._id,
						role: entry.role,
						joinDate: entry.joinDate,
						member: {
							_id: entry.userId._id,
							iid: entry.userId.iid,
							color: entry.userId.color,
							contactEmail: entry.userId.contactEmail,
							name: entry.userId.name,
							pictureUrl: entry.userId.pictureUrl,
							loginEmail: entry.userId.loginProfiles[0].email,
							isAppOwner:
								app.ownerUserId.toString() === entry.userId._id.toString(),
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
@route      /v1/org/:orgId/app/:appId/team/me
@method     GET
@desc       Get current user's app team membership info
@access     private
*/
router.get(
	"/me",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	authorizeAppAction("app.team.view"),
	async (req, res) => {
		try {
			const { user, app } = req;

			let appTeam = await appCtrl.getOneById(app._id, {
				lookup: "team.userId",
			});

			let processedList = appTeam.team
				.filter((entry) => entry.userId._id.toString() === user._id.toString())
				.map((entry) => {
					return {
						_id: entry._id,
						appId: app._id,
						role: entry.role,
						joinDate: entry.joinDate,
						member: {
							_id: entry.userId._id,
							iid: entry.userId.iid,
							color: entry.userId.color,
							contactEmail: entry.userId.contactEmail,
							name: entry.userId.name,
							pictureUrl: entry.userId.pictureUrl,
							isAppOwner:
								app.ownerUserId.toString() === entry.userId._id.toString(),
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
@route      /v1/org/:orgId/app/:appId/team/:userId
@method     PUT
@desc       Update role of team member
@access     private
*/
router.put(
	"/:userId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	authorizeAppAction("app.team.update"),
	applyRules("update-member-role"),
	validate,
	async (req, res) => {
		try {
			const { app, user, org } = req;
			const { userId } = req.params;
			const { role } = req.body;

			// Check if there is such a user
			let targetUser = await userCtrl.getOneById(userId);
			if (!targetUser) {
				return res.status(404).json({
					error: t("Not Found"),
					details: t("No such user exists"),
					code: ERROR_CODES.notFound,
				});
			}

			// Check if the user is a member of the app or not
			let member = app.team.find((entry) => entry.userId.toString() === userId);
			if (!member) {
				return res.status(404).json({
					error: t("Not a Member"),
					details: t("User is not a member of the app '%s'.", app.name),
					code: ERROR_CODES.notFound,
				});
			}

			// Check if the target user is the current user or not. Users cannot change their own role.
			if (targetUser._id.toString() === user._id.toString()) {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t("You cannot change your own app role."),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Check if the target user is the app owner. The role of app owner cannot be changed.
			if (targetUser._id.toString() === app.ownerUserId.toString()) {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t("You cannot change the app role of the app owner."),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Update the role of the user
			let result = await appCtrl.updateOneByQuery(
				{ _id: app._id, "team._id": member._id },
				{
					"team.$.role": role,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: app._id }
			);

			result = {
				_id: member._id,
				appId: app._id,
				role: role,
				joinDate: member.joinDate,
				member: {
					_id: targetUser._id,
					iid: targetUser.iid,
					color: targetUser.color,
					contactEmail: targetUser.contactEmail,
					name: targetUser.name,
					pictureUrl: targetUser.pictureUrl,
					loginEmail: targetUser.loginProfiles[0].email,
					isAppOwner: app.ownerUserId.toString() === targetUser._id.toString(),
				},
			};

			res.json(result);

			// Log action
			auditCtrl.logAndNotify(
				app._id,
				req.user,
				"org.app.team",
				"update",
				t(
					"Updated app member role of user '%s' (%s) from '%s' to '%s'",
					targetUser.name,
					targetUser.contactEmail,
					member.role,
					role
				),
				result,
				{ orgId: org._id, appId: app._id }
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/team/:userId
@method     DELETE
@desc       Remove member from app team
@access     private
*/
router.delete(
	"/:userId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	authorizeAppAction("app.team.delete"),
	applyRules("remove-member"),
	validate,
	async (req, res) => {
		try {
			const { org, app } = req;
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

			// Check if the user is a member of the app or not
			let member = app.team.find((entry) => entry.userId.toString() === userId);
			if (!member) {
				return res.status(404).json({
					error: t("Not a Member"),
					details: t("User is not a member of the app '%s'.", app.name),
					code: ERROR_CODES.notFound,
				});
			}

			// Check if the target user is the current user or not. Users cannot delete themselves from the org team, they need to leave from org team.
			if (req.user._id.toString() === user._id.toString()) {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"You cannot remove yourself from the app team. Try to leave the app team."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Check if the user is the creator of the app or not
			if (app.ownerUserId.toString() === userId) {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"The app owner cannot be removed from the app team. If you would like to remove the current app owner from the app team then the app ownership needs to be transferred to another app team 'Admin' member."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Remove user from the app team
			await appCtrl.pullObjectById(
				app._id,
				"team",
				member._id,
				{ updatedBy: user._id },
				{ cacheKey: app._id }
			);

			res.json();

			// Log action
			auditCtrl.logAndNotify(
				app._id,
				req.user,
				"org.app.team",
				"delete",
				t("Removed user '%s' (%s) from app team", user.name, user.contactEmail),
				{
					_id: user._id,
					iid: user.iid,
					color: user.color,
					contactEmail: user.contactEmail,
					name: user.name,
					pictureUrl: user.pictureUrl,
					loginEmail: user.loginProfiles[0].email,
				},
				{ orgId: org._id, appId: app._id }
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/team/delete-multi
@method     POST
@desc       Remove multiple members from app team
@access     private
*/
router.post(
	"/delete-multi",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	authorizeAppAction("app.team.delete"),
	applyRules("remove-members"),
	validate,
	async (req, res) => {
		try {
			const { org, app } = req;
			const { userIds } = req.body;

			// Users cannot remove themselves from the app team, they need to leave from org team.
			if (userIds.includes(req.user._id.toString())) {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"You cannot remove yourself from the app team. Try to leave the app team."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Check if one of the deleted user is the owner of the app or not
			if (userIds.includes(app.ownerUserId.toString())) {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"The app owner cannot be removed from the app team. If you would like to remove the current app owner from the app team, then the app ownership needs to be transferred to another app 'Admin' member."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Remove users from the app team
			await appCtrl.pullObjectByQuery(
				app._id,
				"team",
				{ userId: { $in: userIds } },
				{ updatedBy: req.user._id },
				{ cacheKey: app._id }
			);

			res.json();

			// Log action
			auditCtrl.logAndNotify(
				app._id,
				req.user,
				"org.app.team",
				"delete",
				t("Removed users from app team"),
				{
					userIds,
				},
				{ orgId: org._id, appId: app._id }
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/team
@method     DELETE
@desc       Leave the app team
@access     private
*/
router.delete(
	"/",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	async (req, res) => {
		try {
			const { org, app, user } = req;

			// Check if the user is a member of the app or not
			let member = app.team.find(
				(entry) => entry.userId.toString() === user._id.toString()
			);

			if (!member) {
				return res.status(404).json({
					error: t("Not a Member"),
					details: t("You are not a member of the app '%s'.", app.name),
					code: ERROR_CODES.notFound,
				});
			}

			// Check if the user is the creator of the app or not
			if (app.ownerUserId.toString() === user._id) {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"You are the owner of the app. The app owner cannot leave the app team. You first need to transfer app ownership to another app 'Admin' member."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Leave the app team
			await appCtrl.pullObjectById(
				app._id,
				"team",
				member._id,
				{ updatedBy: user._id },
				{ cacheKey: app._id }
			);

			res.json();

			// Log action
			auditCtrl.logAndNotify(
				app._id,
				user,
				"org.app.team",
				"delete",
				t("User '%s' (%s) has left the app team", user.name, user.contactEmail),
				{
					_id: user._id,
					iid: user.iid,
					color: user.color,
					contactEmail: user.contactEmail,
					name: user.name,
					pictureUrl: user.pictureUrl,
					loginEmail: user.loginProfiles[0].email,
				},
				{ orgId: org._id, appId: app._id }
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

export default router;
