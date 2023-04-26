import express from "express";
import auditCtrl from "../controllers/audit.js";
import { authSession } from "../middlewares/authSession.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validateOrg } from "../middlewares/validateOrg.js";
import { validateApp } from "../middlewares/validateApp.js";
import { validateVersion } from "../middlewares/validateVersion.js";
import { authorizeOrgAction } from "../middlewares/authorizeOrgAction.js";
import { authorizeAppAction } from "../middlewares/authorizeAppAction.js";
import { applyRules } from "../schemas/audit.js";
import { validate } from "../middlewares/validate.js";
import { handleError } from "../schemas/platformError.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/log/org/:orgId?page=0&size=50&action=&actor=&search=&sortBy=createdAt&sortDir=desc&start&end
@method     GET
@desc       Get organization logs
@access     private
*/
router.get(
	"/org/:orgId",
	checkContentType,
	authSession,
	validateOrg,
	authorizeOrgAction("org.viewLogs"),
	applyRules("view-logs"),
	validate,
	async (req, res) => {
		try {
			const { org } = req;
			const { page, size, action, actor, search, sortBy, sortDir, start, end } =
				req.query;

			let query = {
				orgId: org._id,
				object: { $in: ["org", "org.resource", "org.invite", "org.member"] },
			};

			// Action filter
			if (action) {
				if (Array.isArray(action)) query.action = { $in: action };
				else query.action = action;
			}

			// Actor filter
			if (actor) {
				query.actor = { userId: actor };
			}

			// Search filter
			if (search && search !== "null") {
				query.$or = [
					{ description: { $regex: search, $options: "i" } },
					{ "actor.name": { $regex: search, $options: "i" } },
					{ "actor.contactEmail": { $regex: search, $options: "i" } },
				];
			}

			if (start && !end) query.createdAt = { $gte: start };
			else if (!start && end) query.createdAt = { $lte: end };
			else if (start && end) query.createdAt = { $gte: start, $lt: end };

			let sort = {};
			if (sortBy && sortDir) {
				sort[sortBy] = sortDir;
			} else sort = { createdAt: "desc" };

			let logs = await auditCtrl.getManyByQuery(query, {
				sort,
				skip: size * page,
				limit: size,
			});

			res.json(logs);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/log/org/:orgId/app/:appId?page=0&size=50&action=&actor=&search=&sortBy=createdAt&sortDir=desc&start&end
@method     GET
@desc       Get application logs
@access     private
*/
router.get(
	"/org/:orgId/app/:appId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	authorizeAppAction("app.viewLogs"),
	applyRules("view-logs"),
	validate,
	async (req, res) => {
		try {
			const { org, app } = req;
			const { page, size, action, actor, search, sortBy, sortDir, start, end } =
				req.query;

			let query = {
				orgId: org._id,
				appId: app._id,
				object: {
					$in: [
						"org.app",
						"org.app.params",
						"org.app.limits",
						"org.app.invite",
						"org.app.member",
					],
				},
			};

			// Action filter
			if (action) {
				if (Array.isArray(action)) query.action = { $in: action };
				else query.action = action;
			}

			// Actor filter
			if (actor) {
				query.actor = { userId: actor };
			}

			// Search filter
			if (search && search !== "null") {
				query.$or = [
					{ description: { $regex: search, $options: "i" } },
					{ "actor.name": { $regex: search, $options: "i" } },
					{ "actor.contactEmail": { $regex: search, $options: "i" } },
				];
			}

			if (start && !end) query.createdAt = { $gte: start };
			else if (!start && end) query.createdAt = { $lte: end };
			else if (start && end) query.createdAt = { $gte: start, $lt: end };

			let sort = {};
			if (sortBy && sortDir) {
				sort[sortBy] = sortDir;
			} else sort = { createdAt: "desc" };

			let logs = await auditCtrl.getManyByQuery(query, {
				sort,
				skip: size * page,
				limit: size,
			});

			res.json(logs);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/log/org/:orgId/app/:appId/version/:versionId?page=0&size=50&action=&actor=&search=&sortBy=createdAt&sortDir=desc&start&end
@method     GET
@desc       Get version logs
@access     private
*/
router.get(
	"/org/:orgId/app/:appId/version/:versionId",
	checkContentType,
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
			const { page, size, action, actor, search, sortBy, sortDir, start, end } =
				req.query;

			let query = {
				orgId: org._id,
				appId: app._id,
				versionId: version._id,
				object: { $regex: "^org.app.version", $options: "i" },
			};

			// Action filter
			if (action) {
				if (Array.isArray(action)) query.action = { $in: action };
				else query.action = action;
			}

			// Actor filter
			if (actor) {
				query.actor = { userId: actor };
			}

			// Search filter
			if (search && search !== "null") {
				query.$or = [
					{ description: { $regex: search, $options: "i" } },
					{ "actor.name": { $regex: search, $options: "i" } },
					{ "actor.contactEmail": { $regex: search, $options: "i" } },
				];
			}

			if (start && !end) query.createdAt = { $gte: start };
			else if (!start && end) query.createdAt = { $lte: end };
			else if (start && end) query.createdAt = { $gte: start, $lt: end };

			let sort = {};
			if (sortBy && sortDir) {
				sort[sortBy] = sortDir;
			} else sort = { createdAt: "desc" };

			let logs = await auditCtrl.getManyByQuery(query, {
				sort,
				skip: size * page,
				limit: size,
			});

			res.json(logs);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/log/org/:orgId/app/:appId/version/:versionId/all?page=0&size=50&action=&actor=&search=&sortBy=createdAt&sortDir=desc&start&end
@method     GET
@desc       Get application and version logs together
@access     private
*/
router.get(
	"/org/:orgId/app/:appId/version/:versionId/all",
	checkContentType,
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
			const { page, size, action, actor, search, sortBy, sortDir, start, end } =
				req.query;

			let query = {
				$and: [
					{
						$or: [
							{
								$and: [
									{ orgId: org._id },
									{ appId: app._id },
									{ versionId: version._id },
									{ object: { $regex: "^org.app.version", $options: "i" } },
								],
							},
							{
								$and: [
									{ orgId: org._id },
									{ appId: app._id },
									{
										object: {
											$in: [
												"org.app",
												"org.app.params",
												"org.app.limits",
												"org.app.invite",
												"org.app.member",
											],
										},
									},
								],
							},
						],
					},
				],
			};

			// Action filter
			if (action) {
				if (Array.isArray(action)) query.action = { $in: action };
				else query.action = action;
			}

			// Actor filter
			if (actor) {
				query.actor = { userId: actor };
			}

			// Search filter
			if (search && search !== "null") {
				query.$or = [
					{ description: { $regex: search, $options: "i" } },
					{ "actor.name": { $regex: search, $options: "i" } },
					{ "actor.contactEmail": { $regex: search, $options: "i" } },
				];
			}

			if (start && !end) query.createdAt = { $gte: start };
			else if (!start && end) query.createdAt = { $lte: end };
			else if (start && end) query.createdAt = { $gte: start, $lt: end };

			let sort = {};
			if (sortBy && sortDir) {
				sort[sortBy] = sortDir;
			} else sort = { createdAt: "desc" };

			let logs = await auditCtrl.getManyByQuery(query, {
				sort,
				skip: size * page,
				limit: size,
			});

			res.json(logs);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

export default router;
