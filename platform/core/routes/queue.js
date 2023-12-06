import axios from "axios";
import express from "express";
import deployCtrl from "../controllers/deployment.js";
import envCtrl from "../controllers/environment.js";
import auditCtrl from "../controllers/audit.js";
import queueCtrl from "../controllers/queue.js";
import { authSession } from "../middlewares/authSession.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validateOrg } from "../middlewares/validateOrg.js";
import { validateApp } from "../middlewares/validateApp.js";
import { validateVersion } from "../middlewares/validateVersion.js";
import { validateQueue } from "../middlewares/validateQueue.js";
import { authorizeAppAction } from "../middlewares/authorizeAppAction.js";
import { applyRules } from "../schemas/queue.js";
import { validate } from "../middlewares/validate.js";
import { defaultQueueCode } from "../config/constants.js";
import { handleError } from "../schemas/platformError.js";
import { refreshTypings } from "../util/typings.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/queue?page=0&size=10&search=&sortBy=email&sortDir=asc&start&end
@method     GET
@desc       Get queues of the app version. This does not return the logic (e.g., code or flow) of the queues
@access     private
*/
router.get(
	"/",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.queue.view"),
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

			let eps = await queueCtrl.getManyByQuery(query, {
				sort,
				skip: size * page,
				limit: size,
				projection: "-logic",
			});

			res.json(eps);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/queue/:queueId
@method     GET
@desc       Get a specific queue, which also returns the logic (e.g., code or flow)
@access     private
*/
router.get(
	"/:queueId",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateQueue,
	authorizeAppAction("app.queue.view"),
	async (req, res) => {
		try {
			const { queue } = req;
			res.json(queue);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/queue
@method     POST
@desc       Creates a new queue
@access     private
*/
router.post(
	"/",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.queue.create"),
	applyRules("create"),
	validate,
	async (req, res) => {
		const session = await queueCtrl.startSession();
		try {
			const { org, user, app, version, resource } = req;
			const { name, delay, logExecution } = req.body;

			// Create the queue
			let queueId = helper.generateId();
			let queueiid = helper.generateSlug("que");

			let queue = await queueCtrl.create(
				{
					_id: queueId,
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					iid: queueiid,
					name,
					delay: delay === 0 ? undefined : delay,
					logExecution,
					type: "code",
					logic: defaultQueueCode,
					createdBy: user._id,
				},
				{ cacheKey: queueId, session }
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
						iid: queueiid,
						type: "queue",
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

			await queueCtrl.commit(session);
			res.json(queue);

			// Deploy queue updates to environments if auto-deployment is enabled
			await deployCtrl.updateQueues(app, version, user, [queue], "add");

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.queue",
				"create",
				t("Created a new queue '%s'", name),
				queue,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					queueId: queue._id,
				}
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.environment",
				"update",
				t(
					"Added the message queue '%s' resource mapping to the environment",
					name
				),
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
			await queueCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/queue/:queueId
@method     PUT
@desc      	Updates queue properties
@access     private
*/
router.put(
	"/:queueId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateQueue,
	authorizeAppAction("app.queue.update"),
	applyRules("update"),
	validate,
	async (req, res) => {
		const session = await queueCtrl.startSession();
		try {
			const { org, user, app, version, queue } = req;
			const { name, delay, logExecution } = req.body;

			let set = {
				name,
				delay,
				logExecution,
				updatedBy: user._id,
			};

			let unset = {};
			if (delay === undefined || delay === 0) {
				delete set.delay;
				unset.delay = "";
			}

			let updatedQueue = await queueCtrl.updateOneById(queue._id, set, unset, {
				cacheKey: queue._id,
				session,
			});

			if (queue.name !== name) {
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
						"mappings.design.iid": queue.iid,
					},
					{ "mappings.$.design.name": name },
					{},
					{ cacheKey: env._id, session }
				);
			}

			await queueCtrl.commit(session);
			res.json(updatedQueue);

			// Deploy queue updates to environments if auto-deployment is enabled
			await deployCtrl.updateQueues(
				app,
				version,
				user,
				[updatedQueue],
				"update"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.queue",
				"update",
				t("Updated the properties of queue '%s'", updatedQueue.name),
				updatedQueue,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					queueId: queue._id,
				}
			);

			refreshTypings(user, version);
		} catch (err) {
			await queueCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/queue/:queueId/logic
@method     PUT
@desc       Saves the logic (e.g., code) of the queue
@access     private
*/
router.put(
	"/:queueId/logic",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateQueue,
	authorizeAppAction("app.queue.update"),
	applyRules("save-logic"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version, queue } = req;
			const { logic } = req.body;

			// Update the endpoint logic/code
			const updatedQueue = await queueCtrl.updateOneById(
				queue._id,
				{ logic, updatedBy: user._id },
				{},
				{ cacheKey: queue._id }
			);

			res.json(updatedQueue);

			// Deploy queue updates to environments if auto-deployment is enabled
			await deployCtrl.updateQueues(
				app,
				version,
				user,
				[updatedQueue],
				"update"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.queue",
				"update",
				t("Updated the handler of queue '%s'", updatedQueue.name),
				updatedQueue,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					queueId: queue._id,
				}
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/queue/:queueId/test
@method     POST
@desc       Triggers the testing of the queue
@access     private
*/
router.post(
	"/:queueId/test",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateQueue,
	authorizeAppAction("app.queue.update"),
	applyRules("test-logic"),
	validate,
	async (req, res) => {
		try {
			const { org, app, version, queue } = req;
			const { payload, debugChannel } = req.body;

			// Get the environment
			const env = await envCtrl.getOneByQuery({
				orgId: org._id,
				appId: app._id,
				versionId: version._id,
			});

			// Make api call to environment API server to trigger testing of the message queue
			await axios.post(
				//`http://${env.iid}.${process.env.NAMESPACE}.svc.cluster.local/test/queue`,
				"http://env-l05et1xpq7lw-service:4000/test/queue",
				{ queueiid: queue.iid, delay: 0, payload, debugChannel },
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
@route      /v1/org/:orgId/app/:appId/version/:versionId/queue/delete-multi
@method     DELETE
@desc       Deletes multiple queues
@access     private
*/
router.delete(
	"/delete-multi",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.queue.delete"),
	applyRules("delete-multi"),
	validate,
	async (req, res) => {
		const session = await queueCtrl.startSession();
		try {
			const { org, user, app, version } = req;
			const { queueIds } = req.body;

			// Get the list of queues that will be deleted
			let queues = await queueCtrl.getManyByQuery({
				_id: { $in: queueIds },
				versionId: version._id,
			});

			if (queues.length === 0) return res.json();

			// Delete the queues
			let ids = queues.map((entry) => entry._id);
			let iids = queues.map((entry) => entry.iid);
			await queueCtrl.deleteManyByQuery(
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

			await queueCtrl.commit(session);
			res.json();

			// Deploy queue updates to environments if auto-deployment is enabled
			await deployCtrl.updateQueues(app, version, user, queues, "delete");

			queues.forEach((queue) => {
				// Log action
				auditCtrl.logAndNotify(
					version._id,
					user,
					"org.app.version.queue",
					"delete",
					t("Deleted queue '%s'", queue.name),
					{},
					{
						orgId: org._id,
						appId: app._id,
						versionId: version._id,
						queueId: queue._id,
					}
				);
			});

			refreshTypings(user, version);
		} catch (err) {
			await queueCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/queue/:queueId
@method     DELETE
@desc       Delete a specific queue
@access     private
*/
router.delete(
	"/:queueId",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateQueue,
	authorizeAppAction("app.queue.delete"),
	async (req, res) => {
		const session = await queueCtrl.startSession();
		try {
			const { org, user, app, version, queue } = req;

			// Delete the queue
			await queueCtrl.deleteOneById(queue._id, {
				cacheKey: queue._id,
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
				{ "design.iid": queue.iid },
				{ updatedBy: user._id },
				{ cacheKey: env._id, session }
			);

			await queueCtrl.commit(session);
			res.json();

			// Deploy queue updates to environments if auto-deployment is enabled
			await deployCtrl.updateQueues(app, version, user, [queue], "delete");

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.queue",
				"delete",
				t("Deleted queue '%s'", queue.name),
				{},
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					queueId: queue._id,
				}
			);

			refreshTypings(user, version);
		} catch (err) {
			await queueCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

export default router;
