import express from "express";
import auditCtrl from "../controllers/audit.js";
import { AuditModel } from "../schemas/audit.js";
import { authSession } from "../middlewares/authSession.js";
import { validateOrg } from "../middlewares/validateOrg.js";
import { validateApp } from "../middlewares/validateApp.js";
import { validateVersion } from "../middlewares/validateVersion.js";
import { authorizeAppAction } from "../middlewares/authorizeAppAction.js";
import { applyRules } from "../schemas/audit.js";
import { validate } from "../middlewares/validate.js";
import { handleError } from "../schemas/platformError.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/log/org/:orgId/app/:appId/version/:versionId?page=0&size=50&action=&actor=&sortBy=createdAt&sortDir=desc&start&end
@method     GET
@desc       Get version audit trails
@access     private
*/
router.get(
	"/org/:orgId/app/:appId/version/:versionId",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.viewLogs"),
	applyRules("view-logs"),
	validate,
	async (req, res) => {
		try {
			const { org, app, version } = req;
			const { page, size, action, actor, sortBy, sortDir, start, end } =
				req.query;

			let query = {
				orgId: org._id,
				appId: app._id,
				versionId: version._id,
			};

			// Action filter
			if (action) {
				if (Array.isArray(action)) query.action = { $in: action };
				else query.action = action;
			}

			// Actor filter
			if (actor) {
				if (Array.isArray(action)) query["actor.userId"] = { $in: actor };
				else query["actor.userId"] = actor;
			}

			if (start && !end) query.createdAt = { $gte: start };
			else if (!start && end) query.createdAt = { $lte: end };
			else if (start && end) query.createdAt = { $gte: start, $lte: end };

			let sort = {};
			if (sortBy && sortDir) {
				sort[sortBy] = sortDir;
			} else sort = { createdAt: "desc" };

			let logs = await auditCtrl.getManyByQuery(query, {
				sort,
				skip: size * page,
				limit: size,
				projection: { data: 0 },
			});

			res.json(logs);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/log/org/:orgId/app/:appId/version/:versionId/filters
@method     GET
@desc       Get distinct actions
@access     private
*/
router.get(
	"/org/:orgId/app/:appId/version/:versionId/filters",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.viewLogs"),
	async (req, res) => {
		try {
			const { org, app, version } = req;

			let results = await AuditModel.find({
				orgId: org._id,
				appId: app._id,
				versionId: version._id,
			}).distinct("action");

			res.json(results);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

export default router;
