import axios from "axios";
import express from "express";
import deployCtrl from "../controllers/deployment.js";
import envCtrl from "../controllers/environment.js";
import auditCtrl from "../controllers/audit.js";
import taskCtrl from "../controllers/task.js";
import { authSession } from "../middlewares/authSession.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validateOrg } from "../middlewares/validateOrg.js";
import { validateApp } from "../middlewares/validateApp.js";
import { validateVersion } from "../middlewares/validateVersion.js";
import { validateTask } from "../middlewares/validateTask.js";
import { authorizeAppAction } from "../middlewares/authorizeAppAction.js";
import { applyRules } from "../schemas/task.js";
import { validate } from "../middlewares/validate.js";
import { defaultTaskCode } from "../config/constants.js";
import { handleError } from "../schemas/platformError.js";
import { refreshTypings } from "../util/typings.js";
const router = express.Router({ mergeParams: true });

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/task?page=0&size=10&search=&sortBy=email&sortDir=asc&start&end
@method     GET
@desc       Get tasks of the app version. This does not return the logic (e.g., code or flow) of the tasks
@access     private
*/
router.get(
	"/",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.task.view"),
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

			let eps = await taskCtrl.getManyByQuery(query, {
				sort,
				skip: size * page,
				limit: size,
				// projection: "-logic",
			});

			res.json(eps);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/task/:taskId
@method     GET
@desc       Get a specific task, which also returns the logic (e.g., code or flow)
@access     private
*/
router.get(
	"/:taskId",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateTask,
	authorizeAppAction("app.task.view"),
	async (req, res) => {
		try {
			const { task } = req;
			res.json(task);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/task
@method     POST
@desc       Creates a new task
@access     private
*/
router.post(
	"/",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.task.create"),
	applyRules("create"),
	validate,
	async (req, res) => {
		const session = await taskCtrl.startSession();
		try {
			const { org, user, app, version, resource } = req;
			const { name, cronExpression, logExecution, enabled } = req.body;

			// Create the task
			let taskId = helper.generateId();
			let taskiid = helper.generateSlug("crj");

			let task = await taskCtrl.create(
				{
					_id: taskId,
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					iid: taskiid,
					name,
					cronExpression,
					logExecution,
					enabled,
					type: "code",
					logic: defaultTaskCode,
					createdBy: user._id,
				},
				{ cacheKey: taskId, session }
			);

			// Add mapping to the environment
			const env = await envCtrl.getOneByQuery({
				orgId: org._id,
				appId: app._id,
				versionId: version._id,
			});

			const updatedEnv = await envCtrl.pushObjectById(
				env._id,
				"mappings",
				{
					design: {
						iid: taskiid,
						type: "scheduler",
						name: name,
					},
					resource: {
						iid: resource.iid,
						name: resource.name,
						type: resource.type,
						instance: resource.instance,
					},
				},
				{ updatedBy: user._id },
				{ cacheKey: env._id, session }
			);

			await taskCtrl.commit(session);
			res.json(task);

			// Deploy task updates to environments if auto-deployment is enabled
			await deployCtrl.updateTasks(app, version, user, [task], "add");

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.task",
				"create",
				t("Created a new cron job '%s'", name),
				task,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					taskId: task._id,
				}
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.environment",
				"update",
				t("Added the cron job '%s' resource mapping to the environment", name),
				updatedEnv,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					envId: env._id,
				}
			);

			refreshTypings(user, version);
		} catch (err) {
			await taskCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/task/:taskId
@method     PUT
@desc      	Updates task properties
@access     private
*/
router.put(
	"/:taskId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateTask,
	authorizeAppAction("app.task.update"),
	applyRules("update"),
	validate,
	async (req, res) => {
		const session = await taskCtrl.startSession();
		try {
			const { org, user, app, version, task } = req;
			const { name, cronExpression, logExecution, enabled } = req.body;

			let updatedTask = await taskCtrl.updateOneById(
				task._id,
				{
					name,
					cronExpression,
					logExecution,
					enabled,
					updatedBy: user._id,
				},
				{},
				{
					cacheKey: task._id,
					session,
				}
			);

			if (task.name !== name) {
				// Update the resouce mapping name info in environments if there is any
				let env = await envCtrl.getOneByQuery(
					{
						orgId: org._id,
						appId: app._id,
						versionId: version._id,
					},
					{ session }
				);

				await envCtrl.updateOneByQuery(
					{
						_id: env._id,
						"mappings.design.iid": task.iid,
					},
					{ "mappings.$.design.name": name },
					{},
					{ cacheKey: env._id, session }
				);
			}

			await taskCtrl.commit(session);
			res.json(updatedTask);

			// Deploy task updates to environments if auto-deployment is enabled
			await deployCtrl.updateTasks(app, version, user, [updatedTask], "update");

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.task",
				"update",
				t("Updated the properties of cron job '%s'", updatedTask.name),
				updatedTask,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					taskId: task._id,
				}
			);

			refreshTypings(user, version);
		} catch (err) {
			await taskCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/task/:taskId/logic
@method     PUT
@desc       Saves the logic (e.g., code) of the task
@access     private
*/
router.put(
	"/:taskId/logic",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateTask,
	authorizeAppAction("app.task.update"),
	applyRules("save-logic"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version, task } = req;
			const { logic } = req.body;

			// Update the endpoing logic/code
			const updatedTask = await taskCtrl.updateOneById(
				task._id,
				{ logic, updatedBy: user._id },
				{},
				{ cacheKey: task._id }
			);

			res.json(updatedTask);

			// Deploy task updates to environments if auto-deployment is enabled
			await deployCtrl.updateTasks(app, version, user, [updatedTask], "update");

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.task",
				"update",
				t("Updated the handler of cron job '%s'", updatedTask.name),
				updatedTask,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					taskId: task._id,
				}
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/task/:taskId/test
@method     POST
@desc       Triggers the testing of the task
@access     private
*/
router.post(
	"/:taskId/test",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateTask,
	authorizeAppAction("app.task.update"),
	applyRules("test-logic"),
	validate,
	async (req, res) => {
		try {
			const { org, app, version, task } = req;
			const { debugChannel } = req.body;

			// Get the environment
			const env = await envCtrl.getOneByQuery({
				orgId: org._id,
				appId: app._id,
				versionId: version._id,
			});

			// Make api call to environment API server to trigger testing of the message queue
			await axios.post(
				`http://${env.iid}.${process.env.NAMESPACE}.svc.cluster.local/agnost/test/task`,
				{ taskiid: task.iid, debugChannel },
				{
					headers: {
						Authorization: process.env.ACCESS_TOKEN,
						"Content-Type": "application/json",
					},
				}
			);

			res.json();
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/task/delete-multi
@method     DELETE
@desc       Deletes multiple tasks
@access     private
*/
router.delete(
	"/delete-multi",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.task.delete"),
	applyRules("delete-multi"),
	validate,
	async (req, res) => {
		const session = await taskCtrl.startSession();
		try {
			const { org, user, app, version } = req;
			const { taskIds } = req.body;

			// Get the list of tasks that will be deleted
			let tasks = await taskCtrl.getManyByQuery({
				_id: { $in: taskIds },
				versionId: version._id,
			});

			if (tasks.length === 0) return res.json();

			// Delete the tasks
			let ids = tasks.map((entry) => entry._id);
			let iids = tasks.map((entry) => entry.iid);
			await taskCtrl.deleteManyByQuery(
				{ _id: { $in: ids } },
				{ cacheKey: ids, session }
			);

			// Get the environment
			let env = await envCtrl.getOneByQuery({
				orgId: org._id,
				appId: app._id,
				versionId: version._id,
			});

			// Remove the resource mapping from the environment
			await envCtrl.pullObjectByQuery(
				env._id,
				"mappings",
				{ "design.iid": { $in: iids } },
				{ updatedBy: user._id },
				{ cacheKey: env._id, session }
			);

			await taskCtrl.commit(session);
			res.json();

			// Deploy task updates to environments if auto-deployment is enabled
			await deployCtrl.updateTasks(app, version, user, tasks, "delete");

			tasks.forEach((task) => {
				// Log action
				auditCtrl.logAndNotify(
					version._id,
					user,
					"org.app.version.task",
					"delete",
					t("Deleted cron job '%s'", task.name),
					{},
					{
						orgId: org._id,
						appId: app._id,
						versionId: version._id,
						taskId: task._id,
					}
				);
			});

			refreshTypings(user, version);
		} catch (err) {
			await taskCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/task/:taskId
@method     DELETE
@desc       Delete a specific task
@access     private
*/
router.delete(
	"/:taskId",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateTask,
	authorizeAppAction("app.task.delete"),
	async (req, res) => {
		const session = await taskCtrl.startSession();
		try {
			const { org, user, app, version, task } = req;

			// Delete the task
			await taskCtrl.deleteOneById(task._id, {
				cacheKey: task._id,
				session,
			});

			// Get the environment
			let env = await envCtrl.getOneByQuery({
				orgId: org._id,
				appId: app._id,
				versionId: version._id,
			});

			// Remove the resource mapping from the environment
			await envCtrl.pullObjectByQuery(
				env._id,
				"mappings",
				{ "design.iid": task.iid },
				{ updatedBy: user._id },
				{ cacheKey: env._id, session }
			);

			await taskCtrl.commit(session);
			res.json();

			// Deploy task updates to environments if auto-deployment is enabled
			await deployCtrl.updateTasks(app, version, user, [task], "delete");

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.task",
				"delete",
				t("Deleted cron job '%s'", task.name),
				{},
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					taskId: task._id,
				}
			);

			refreshTypings(user, version);
		} catch (err) {
			await taskCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

export default router;
