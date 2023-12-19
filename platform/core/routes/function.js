import express from "express";
import deployCtrl from "../controllers/deployment.js";
import auditCtrl from "../controllers/audit.js";
import funcCtrl from "../controllers/function.js";
import { authSession } from "../middlewares/authSession.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validateOrg } from "../middlewares/validateOrg.js";
import { validateApp } from "../middlewares/validateApp.js";
import { validateVersion } from "../middlewares/validateVersion.js";
import { validateFunction } from "../middlewares/validateFunction.js";
import { authorizeAppAction } from "../middlewares/authorizeAppAction.js";
import { applyRules } from "../schemas/function.js";
import { validate } from "../middlewares/validate.js";
import { defaultFunctionCode } from "../config/constants.js";
import { handleError } from "../schemas/platformError.js";
import { refreshTypings } from "../util/typings.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/func?page=0&size=10&search=&sortBy=email&sortDir=asc&start&end
@method     GET
@desc       Get functions of the app version. This does not return the logic (e.g., code or flow) of the functions
@access     private
*/
router.get(
	"/",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.function.view"),
	applyRules("view"),
	validate,
	async (req, res) => {
		try {
			const { version } = req;
			const { page, size, search, sortBy, sortDir, start, end } = req.query;

			let query = { versionId: version._id };
			if (search) {
				query.name = { $regex: search, $options: "i" };
			}
			if (start && !end) query.createdAt = { $gte: start };
			else if (!start && end) query.createdAt = { $lte: end };
			else if (start && end) query.createdAt = { $gte: start, $lte: end };

			let sort = {};
			if (sortBy && sortDir) {
				sort[sortBy] = sortDir;
			} else sort = { createdAt: "desc" };

			let functions = await funcCtrl.getManyByQuery(query, {
				sort,
				skip: size * page,
				limit: size,
				// projection: "-logic",
			});

			res.json(functions);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/func/:funcId
@method     GET
@desc       Get a specific function, which also returns the logic (e.g., code or flow)
@access     private
*/
router.get(
	"/:funcId",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateFunction,
	authorizeAppAction("app.function.view"),
	async (req, res) => {
		try {
			const { func } = req;
			res.json(func);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/func
@method     POST
@desc       Creates a new function
@access     private
*/
router.post(
	"/",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.function.create"),
	applyRules("create"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version } = req;
			const { name } = req.body;

			// Create the function
			let funcId = helper.generateId();
			let funciid = helper.generateSlug("fn");

			let func = await funcCtrl.create(
				{
					_id: funcId,
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					iid: funciid,
					name,
					type: "code",
					logic: defaultFunctionCode,
					createdBy: user._id,
				},
				{ cacheKey: funcId }
			);

			res.json(func);

			// Deploy function updates to environments if auto-deployment is enabled
			await deployCtrl.updateFunctions(app, version, user, [func], "add");

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.function",
				"create",
				t("Created a new helper function '%s'", name),
				func,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					functionId: func._id,
				}
			);

			refreshTypings(user, version);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/func/:funcId
@method     PUT
@desc      	Updates function properties
@access     private
*/
router.put(
	"/:funcId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateFunction,
	authorizeAppAction("app.function.update"),
	applyRules("update"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version, func } = req;
			const { name } = req.body;

			let updatedFunc = await funcCtrl.updateOneById(
				func._id,
				{
					name,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: func._id }
			);

			res.json(updatedFunc);

			// Deploy function updates to environments if auto-deployment is enabled
			await deployCtrl.updateFunctions(
				app,
				version,
				user,
				[updatedFunc],
				"update"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.function",
				"update",
				t("Updated the properties of helper function '%s'", updatedFunc.name),
				updatedFunc,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					functionId: func._id,
				}
			);

			refreshTypings(user, version);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/func/:funcId/logic
@method     PUT
@desc       Saves the logic (e.g., code) of the function
@access     private
*/
router.put(
	"/:funcId/logic",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateFunction,
	authorizeAppAction("app.function.update"),
	applyRules("save-logic"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version, func } = req;
			const { logic } = req.body;

			// Update the endpoing logic/code
			const updatedFunc = await funcCtrl.updateOneById(
				func._id,
				{ logic, updatedBy: user._id },
				{},
				{ cacheKey: func._id }
			);

			res.json(updatedFunc);

			// Deploy function updates to environments if auto-deployment is enabled
			await deployCtrl.updateFunctions(
				app,
				version,
				user,
				[updatedFunc],
				"update"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.function",
				"update",
				t("Updated the code of helper function '%s'", updatedFunc.name),
				updatedFunc,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					functionId: func._id,
				}
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/func/delete-multi
@method     DELETE
@desc       Deletes multiple functions
@access     private
*/
router.delete(
	"/delete-multi",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.function.delete"),
	applyRules("delete-multi"),
	validate,
	async (req, res) => {
		const session = await funcCtrl.startSession();
		try {
			const { org, user, app, version } = req;
			const { functionIds } = req.body;

			// Get the list of functions that will be deleted
			let funcs = await funcCtrl.getManyByQuery({
				_id: { $in: functionIds },
				versionId: version._id,
			});

			if (funcs.length === 0) return res.json();

			// Delete the functions
			let ids = funcs.map((entry) => entry._id);
			await funcCtrl.deleteManyByQuery(
				{ _id: { $in: ids } },
				{ cacheKey: ids, session }
			);

			await funcCtrl.commit(session);
			res.json();

			// Deploy function updates to environments if auto-deployment is enabled
			await deployCtrl.updateFunctions(app, version, user, funcs, "delete");

			funcs.forEach((func) => {
				// Log action
				auditCtrl.logAndNotify(
					version._id,
					user,
					"org.app.version.function",
					"delete",
					t("Deleted helper function '%s'", func.name),
					{},
					{
						orgId: org._id,
						appId: app._id,
						versionId: version._id,
						functionId: func._id,
					}
				);
			});

			refreshTypings(user, version);
		} catch (err) {
			await funcCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/func/:funcId
@method     DELETE
@desc       Delete a specific function
@access     private
*/
router.delete(
	"/:funcId",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateFunction,
	authorizeAppAction("app.function.delete"),
	async (req, res) => {
		const session = await funcCtrl.startSession();
		try {
			const { org, user, app, version, func } = req;

			// Delete the function
			await funcCtrl.deleteOneById(func._id, { cacheKey: func._id, session });

			await funcCtrl.commit(session);
			res.json();

			// Deploy function updates to environments if auto-deployment is enabled
			await deployCtrl.updateFunctions(app, version, user, [func], "delete");

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.function",
				"delete",
				t("Deleted helper function '%s'", func.name),
				{},
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					functionId: func._id,
				}
			);

			refreshTypings(user, version);
		} catch (err) {
			await funcCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

export default router;
