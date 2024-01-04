import axios from "axios";
import express from "express";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import versionCtrl from "../controllers/version.js";
import envCtrl from "../controllers/environment.js";
import deployCtrl from "../controllers/deployment.js";
import resourceCtrl from "../controllers/resource.js";
import auditCtrl from "../controllers/audit.js";
import modelCtrl from "../controllers/model.js";
import dbCtrl from "../controllers/database.js";
import cacheCtrl from "../controllers/cache.js";
import storageCtrl from "../controllers/storage.js";
import epCtrl from "../controllers/endpoint.js";
import mwCtrl from "../controllers/middleware.js";
import funcCtrl from "../controllers/function.js";
import queueCtrl from "../controllers/queue.js";
import taskCtrl from "../controllers/task.js";
import { authSession } from "../middlewares/authSession.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validateOrg } from "../middlewares/validateOrg.js";
import { validateApp } from "../middlewares/validateApp.js";
import {
	validateVersion,
	validateVersionParam,
	validateVersionLimit,
	validateVersionKey,
	validateVersionPackage,
	validateVersionOauthProvider,
} from "../middlewares/validateVersion.js";
import { authorizeAppAction } from "../middlewares/authorizeAppAction.js";
import { applyRules } from "../schemas/version.js";
import { validate } from "../middlewares/validate.js";
import { handleError } from "../schemas/platformError.js";
import { setKey } from "../init/cache.js";
import {
	authUserDataModel,
	apiServerDefaultPackages,
	dbTypeMappings,
} from "../config/constants.js";
import { getVersionTypings } from "../util/typings.js";
import ERROR_CODES from "../config/errorCodes.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/org/:orgId/app/:appId/version?page=0&size=10&name=&sortBy=email&sortDir=asc&start&end
@method     GET
@desc       Get all app versions that are visible to the user
@access     private
*/
router.get(
	"/",
	authSession,
	validateOrg,
	validateApp,
	authorizeAppAction("app.version.view"),
	applyRules("view"),
	validate,
	async (req, res) => {
		try {
			const { app, appMember } = req;
			const { page, size, name, sortBy, sortDir, start, end } = req.query;

			let query = { appId: app._id };
			if (appMember.role !== "Admin")
				query.$or = [
					{ private: false },
					{ $and: [{ private: true }, { createdBy: req.user._id }] },
				];
			if (name && name !== "null")
				query.name = { $regex: helper.escapeStringRegexp(name), $options: "i" };

			if (start && !end) query.createdAt = { $gte: start };
			else if (!start && end) query.createdAt = { $lte: end };
			else if (start && end) query.createdAt = { $gte: start, $lte: end };

			let sort = {};
			if (sortBy && sortDir) {
				sort[sortBy] = sortDir;
			} else sort = { createdAt: "desc" };

			let versions = await versionCtrl.getManyByQuery(query, {
				sort,
				skip: size * page,
				limit: size,
			});

			res.json(helper.decryptVersionData(versions));
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/mine?page=0&size=10&name=&sortBy=email&sortDir=asc&start&end
@method     GET
@desc       Get the app versions creted by the user
@access     private
*/
router.get(
	"/mine",
	authSession,
	validateOrg,
	validateApp,
	authorizeAppAction("app.version.view"),
	applyRules("view"),
	validate,
	async (req, res) => {
		try {
			const { app } = req;
			const { page, size, name, sortBy, sortDir, start, end } = req.query;

			let query = { appId: app._id, createdBy: req.user._id };
			if (name && name !== "null")
				query.name = { $regex: helper.escapeStringRegexp(name), $options: "i" };

			if (start && !end) query.createdAt = { $gte: start };
			else if (!start && end) query.createdAt = { $lte: end };
			else if (start && end) query.createdAt = { $gte: start, $lte: end };

			let sort = {};
			if (sortBy && sortDir) {
				sort[sortBy] = sortDir;
			} else sort = { createdAt: "desc" };

			let versions = await versionCtrl.getManyByQuery(query, {
				sort,
				skip: size * page,
				limit: size,
			});

			res.json(helper.decryptVersionData(versions));
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version
@method     POST
@desc       Creates a new blank version. By default when we create a new version we also create an associated environment.
@access     private
*/
router.post(
	"/",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	authorizeAppAction("app.version.create"),
	applyRules("create"),
	validate,
	async (req, res) => {
		// Start new database transaction session
		const session = await versionCtrl.startSession();
		try {
			const { org, user, app } = req;
			const { name, readOnly } = req.body;

			// Create the new version and associated environment and api server resource
			const { version, resource, resLog, env, envLog } =
				await versionCtrl.createVersion(session, user, org, app, {
					name,
					isPrivate: req.body.private,
					readOnly,
					master: false,
				});

			// Commit transaction
			await versionCtrl.commit(session);
			const decryptedVersion = helper.decryptVersionData(version);
			res.json({
				version: decryptedVersion,
				resource,
				resLog,
				env,
				envLog,
			});

			// Deploy application version to the environment
			await deployCtrl.deploy(envLog, app, version, env, user);

			// We can update the environment value in cache only after the deployment instructions are successfully sent to the engine cluster
			await setKey(env._id, env, helper.constants["1month"]);

			// We first deploy the app then create the resources. The environment data needs to be cached before the api-server pod starts up.
			// Create the engine deployment (API server), associated HPA, service and ingress rule
			await resourceCtrl.manageClusterResources([{ resource, log: resLog }]);

			// Log action
			auditCtrl.logAndNotify(
				app._id,
				user,
				"org.app.version",
				"create",
				t("Created a new blank app version '%s'", name),
				{ version: decryptedVersion, resource, env },
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (error) {
			await versionCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/copy
@method     POST
@desc       Creates a copy of an existing version.
@access     private
*/
router.post(
	"/copy",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	authorizeAppAction("app.version.create"),
	applyRules("create-copy"),
	validate,
	async (req, res) => {
		// Start new database transaction session
		const session = await versionCtrl.startSession();
		try {
			const { org, user, app } = req;
			const { name, readOnly } = req.body;

			// Create the new version and associated environment and api server resource
			const { version, resource, resLog, env, envLog } =
				await versionCtrl.createVersionCopy(session, user, org, app, {
					name,
					isPrivate: req.body.private,
					readOnly,
					master: false,
					parentVersion: req.parentVersion,
				});

			// Commit transaction
			await versionCtrl.commit(session);
			const decryptedVersion = helper.decryptVersionData(version);
			res.json({
				version: decryptedVersion,
				resource,
				resLog,
				env,
				envLog,
			});

			// Deploy application version to the environment
			await deployCtrl.deploy(envLog, app, version, env, user);

			// We can update the environment value in cache only after the deployment instructions are successfully sent to the engine cluster
			await setKey(env._id, env, helper.constants["1month"]);

			// We first deploy the app then create the resources. The environment data needs to be cached before the api-server pod starts up.
			// Create the engine deployment (API server), associated HPA, service and ingress rule
			await resourceCtrl.manageClusterResources([{ resource, log: resLog }]);

			// Log action
			auditCtrl.logAndNotify(
				app._id,
				user,
				"org.app.version",
				"create",
				t(
					"Created a new app version '%s' copied from version '%s'",
					name,
					req.parentVersion.name
				),
				{ version: decryptedVersion, resource, env },
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (error) {
			await versionCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId
@method     GET
@desc       Returns a specific version
@access     private
*/
router.get(
	"/:versionId",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.view"),
	async (req, res) => {
		try {
			const { version } = req;

			res.json(helper.decryptVersionData(version));
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/dashboard
@method     GET
@desc       Get the app versions summarized dashboard data
@access     private
*/
router.get(
	"/:versionId/dashboard",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.view"),
	async (req, res) => {
		try {
			const { version } = req;

			const dbs = await dbCtrl.getManyByQuery(
				{ versionId: version._id },
				{ projection: { _id: 1 } }
			);

			const caches = await cacheCtrl.getManyByQuery(
				{ versionId: version._id },
				{ projection: { _id: 1 } }
			);

			const storages = await storageCtrl.getManyByQuery(
				{ versionId: version._id },
				{ projection: { _id: 1 } }
			);

			const eps = await epCtrl.getManyByQuery(
				{ versionId: version._id },
				{ projection: { _id: 1 } }
			);

			const mws = await mwCtrl.getManyByQuery(
				{ versionId: version._id },
				{ projection: { _id: 1 } }
			);

			const funcs = await funcCtrl.getManyByQuery(
				{ versionId: version._id },
				{ projection: { _id: 1 } }
			);

			const queues = await queueCtrl.getManyByQuery(
				{ versionId: version._id },
				{ projection: { _id: 1 } }
			);

			const tasks = await taskCtrl.getManyByQuery(
				{ versionId: version._id },
				{ projection: { _id: 1 } }
			);

			res.json({
				database: dbs.length,
				cache: caches.length,
				storage: storages.length,
				endpoint: eps.length,
				middleware: mws.length,
				function: funcs.length,
				queue: queues.length,
				task: tasks.length,
			});
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId
@method     PUT
@desc       Update the version information name, private, readOnly and default endpoint limits
@access     private
*/
router.put(
	"/:versionId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.update"),
	applyRules("update"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version } = req;
			const { name, readOnly, defaultEndpointLimits } = req.body;
			const defaultLimits = defaultEndpointLimits || [];

			if (version.master && req.body.private) {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"Master app version '%s' cannot be marked as private.",
						version.name
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			let updatedVersion = await versionCtrl.updateOneById(
				version._id,
				{
					name,
					private: req.body.private,
					readOnly,
					defaultEndpointLimits: defaultLimits,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: version._id }
			);

			const decryptedVersion = helper.decryptVersionData(updatedVersion);
			res.json(decryptedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(
				app,
				updatedVersion,
				user,
				"update-version"
			);

			// Log action
			auditCtrl.logAndNotify(
				app._id,
				user,
				"org.app.version",
				"update",
				t("Updated app version '%s' properties", name),
				decryptedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId
@method     DELETE
@desc       Delete the version
@access     private
*/
router.delete(
	"/:versionId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.delete"),
	async (req, res) => {
		const session = await versionCtrl.startSession();
		try {
			const { org, user, app, version, appMember } = req;

			if (version.master) {
				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"Master app version '%s' cannot be deleted.",
						version.name
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			if (
				version.createdBy.toString() !== req.user._id.toString() &&
				appMember.role !== "Admin"
			) {
				return res.status(401).json({
					error: t("Not Authorized"),
					details: t(
						"You are not authorized to delete version '%s'. Only the creator of the version or app team members with 'Admin' role can delete it.",
						version.name
					),
					code: ERROR_CODES.unauthorized,
				});
			}

			// First get all app resources, environments and versions
			const resources = await resourceCtrl.getManyByQuery({
				orgId: org._id,
				appId: app._id,
				versionId: version._id,
			});

			const envs = await envCtrl.getManyByQuery({
				orgId: org._id,
				appId: app._id,
				versionId: version._id,
			});

			// Delete all version related data
			await versionCtrl.deleteVersion(session, org, app, version);
			// Commit the database transaction
			await versionCtrl.commit(session);

			// Iterate through all environments and delete them
			for (let i = 0; i < envs.length; i++) {
				const env = envs[i];
				deployCtrl.delete(app, version, env, user);
			}

			// Iterate through all resources and delete them if they are managed or if the resource is the API server of the version
			const managedResources = resources.filter(
				(entry) => entry.managed === true && entry.deletable === true
			);

			// Delete managed organization resources
			resourceCtrl.deleteClusterResources(managedResources);

			res.json();

			// Log action
			auditCtrl.logAndNotify(
				app._id,
				user,
				"org.app.version",
				"delete",
				t("Deleted app version '%s'", version.name),
				{},
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			await versionCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/log-buckets?type=endpoint&start&end
@method     GET
@desc       Returns log buckets information
@access     private
*/
router.get(
	"/:versionId/log-buckets",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.view"),
	applyRules("log-buckets"),
	validate,
	async (req, res) => {
		try {
			const { version } = req;
			const { type, start, end, buckets } = req.query;

			if (start >= end) {
				return res.status(422).json({
					error: t("Invalid Time Range"),
					details: t(
						"The start timestamp '%s' cannot be equal or later than the end timestamp '%s'.",
						start.toISOString(),
						end.toISOString()
					),
					code: ERROR_CODES.invalidTimeRange,
				});
			}

			if (end - start < config.get("general.minLogBucketDurationMs")) {
				return res.status(422).json({
					error: t("Invalid Bucket Size"),
					details: t(
						"The duration between end and start timestamps cannot be less than '%s' milliseconds",
						config.get("general.minLogBucketDurationMs")
					),
					code: ERROR_CODES.invalidBucketSize,
				});
			}

			// Get the environment of the version
			const envObj = await envCtrl.getOneByQuery({ versionId: version._id });

			// Calculate the number of buckets
			const numBuckets = buckets ?? config.get("general.defaultBucketCount");

			// Calculate the interval duration for each bucket. Interval duration should be the multiples of 1 second (1000)
			const bucketDuration = (end.valueOf() + 1 - start.valueOf()) / numBuckets;
			const intervalDuration =
				bucketDuration > 1000
					? Math.round(bucketDuration / 1000) * 1000
					: Math.round(Math.floor(bucketDuration) / 10) * 10;

			// Aggregation pipeline stages
			const pipeline = [
				{
					$match: {
						timestamp: {
							$gte: start,
							$lte: end,
						},
					},
				},
				{
					$project: {
						status: 1,
						bucketIndex: {
							$floor: {
								$divide: [
									{
										$subtract: ["$timestamp", start],
									},
									intervalDuration,
								],
							},
						},
					},
				},
				{
					$group: {
						_id: {
							bucketIndex: "$bucketIndex",
							status: "$status",
						},
						count: { $sum: 1 },
					},
				},
				{
					$group: {
						_id: "$_id.bucketIndex",
						statusCounts: {
							$push: {
								status: "$_id.status",
								count: "$count",
							},
						},
					},
				},
				{
					$sort: {
						_id: 1,
					},
				},
			];

			const mongoClient = mongoose.connection.client;
			const db = mongoClient.db(envObj.iid);
			const collectionName = type === "task" ? "cronjob_logs" : `${type}_logs`;

			// Execute the aggregation pipeline
			const result = await db
				.collection(collectionName)
				.aggregate(pipeline)
				.toArray();

			let totalHits = 0;
			// Create the entries for each bucket, since the above query does not return all the bucket data
			const allBuckets = Array.from({ length: numBuckets }, (element, i) => {
				const resultBucket = result.find((entry) => entry._id === i);
				const countInfo = { success: 0, error: 0 };
				if (resultBucket?.statusCounts) {
					if (type === "queue" || type === "task") {
						let errorCount = resultBucket.statusCounts.find(
							(entry) => entry.status === "error"
						);
						if (errorCount) countInfo.error = errorCount.count;

						let successCount = resultBucket.statusCounts.find(
							(entry) => entry.status === "success"
						);
						if (successCount) countInfo.success = successCount.count;
					} else {
						let errorEntries = resultBucket.statusCounts.filter(
							(entry) => entry.status !== 200
						);
						if (errorEntries)
							countInfo.error = errorEntries.reduce(
								(accumulator, currentValue) => accumulator + currentValue.count,
								0
							);

						let successCount = resultBucket.statusCounts.find(
							(entry) => entry.status === 200
						);
						if (successCount) countInfo.success = successCount.count;
					}
				}

				totalHits += countInfo.success + countInfo.error;
				return {
					bucket: i + 1,
					start: new Date(start.valueOf() + i * intervalDuration),
					end:
						i === numBuckets - 1
							? end
							: new Date(start.valueOf() + (i + 1) * intervalDuration - 1),
					...countInfo,
				};
			});

			res.json({ totalHits, buckets: allBuckets });
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/logs?page=0&size=10&name=&sortBy=email&sortDir=asc&start&end
@method     GET
@desc       Get version specific logs
@access     private
*/
router.get(
	"/:versionId/logs",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.view"),
	applyRules("view-logs"),
	validate,
	async (req, res) => {
		try {
			const { version } = req;
			const { page, size, type, sortBy, sortDir, start, end } = req.query;
			const query = {};

			if (start && !end) query.timestamp = { $gte: start };
			else if (!start && end) query.timestamp = { $lte: end };
			else if (start && end) query.timestamp = { $gte: start, $lte: end };

			let sort = {};
			if (sortBy && sortDir) {
				sort[sortBy] = sortDir === "asc" ? 1 : -1;
			} else sort = { timestamp: -1 };

			// Get the environment of the version
			const envObj = await envCtrl.getOneByQuery({ versionId: version._id });

			const mongoClient = mongoose.connection.client;
			const db = mongoClient.db(envObj.iid);
			const collectionName = type === "task" ? "cronjob_logs" : `${type}_logs`;

			// Execute the aggregation pipeline
			const logs = await db
				.collection(collectionName)
				.find(query, {
					sort,
					skip: size * page,
					limit: size,
				})
				.toArray();

			res.json(logs);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/params
@method     POST
@desc       Creates a new paramerter
@access     private
*/
router.post(
	"/:versionId/params",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.param.create"),
	applyRules("create-param"),
	validate,
	async (req, res) => {
		try {
			const { org, app, user, version } = req;
			const { name, value } = req.body;

			let updatedVersion = await versionCtrl.pushObjectById(
				version._id,
				"params",
				{
					name,
					value: helper.getTypedValue(value),
					createdBy: user._id,
				},
				{ updatedBy: user._id },
				{ cacheKey: version._id }
			);

			const decryptedVersion = helper.decryptVersionData(updatedVersion);
			res.json(decryptedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(
				app,
				updatedVersion,
				user,
				"add-parameter"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.params",
				"create",
				t("Added a new parameter '%s'", name, app.name),
				decryptedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/params/:paramId
@method     PUT
@desc       Update value of parameter
@access     private
*/
router.put(
	"/:versionId/params/:paramId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateVersionParam,
	authorizeAppAction("app.version.param.update"),
	applyRules("update-param"),
	validate,
	async (req, res) => {
		try {
			const { org, app, user, param, version } = req;
			const { name, value } = req.body;

			let updatedVersion = await versionCtrl.updateOneByQuery(
				{ _id: version._id, "params._id": param._id },
				{
					"params.$.name": name,
					"params.$.value": helper.getTypedValue(value),
					"params.$.updatedAt": Date.now(),
					"params.$.updatedBy": user._id,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: version._id }
			);

			const decryptedVersion = helper.decryptVersionData(updatedVersion);
			res.json(decryptedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(
				app,
				updatedVersion,
				user,
				"update-parameter"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.params",
				"update",
				t("Updated parameter '%s'", name),
				decryptedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/params/:paramId
@method     DELETE
@desc       Delete parameter
@access     private
*/
router.delete(
	"/:versionId/params/:paramId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateVersionParam,
	authorizeAppAction("app.version.param.delete"),
	async (req, res) => {
		try {
			const { org, app, user, param, version } = req;

			let updatedVersion = await versionCtrl.pullObjectById(
				version._id,
				"params",
				param._id,
				{ updatedBy: user._id },
				{ cacheKey: version._id }
			);

			const decryptedVersion = helper.decryptVersionData(updatedVersion);
			res.json(decryptedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(
				app,
				updatedVersion,
				user,
				"delete-parameter"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.params",
				"delete",
				t("Deleted parameter '%s'", param.name),
				decryptedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/params
@method     DELETE
@desc       Delete multiple parameters
@access     private
*/
router.delete(
	"/:versionId/params",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.param.delete"),
	applyRules("delete-multi-params"),
	validate,
	async (req, res) => {
		try {
			const { paramIds } = req.body;
			const { org, app, user, version } = req;

			let updatedVersion = await versionCtrl.pullObjectByQuery(
				version._id,
				"params",
				{ _id: { $in: paramIds } },
				{ updatedBy: user._id },
				{ cacheKey: version._id }
			);

			const decryptedVersion = helper.decryptVersionData(updatedVersion);
			res.json(decryptedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(
				app,
				updatedVersion,
				user,
				"delete-parameter"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.params",
				"delete",
				t("Deleted '%s' app parameter(s)", paramIds.length),
				decryptedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/limits
@method     POST
@desc       Create a new rate limiter.
@access     private
*/
router.post(
	"/:versionId/limits",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.limit.create"),
	applyRules("create-limit"),
	validate,
	async (req, res) => {
		try {
			const { org, app, user, version } = req;
			const { name, rate, duration, errorMessage } = req.body;

			let updatedVersion = await versionCtrl.pushObjectById(
				version._id,
				"limits",
				{
					iid: helper.generateSlug("lmt"),
					name,
					rate,
					duration,
					errorMessage,
					createdBy: user._id,
				},
				{ updatedBy: user._id },
				{ cacheKey: version._id }
			);

			const decryptedVersion = helper.decryptVersionData(updatedVersion);
			res.json(decryptedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(
				app,
				updatedVersion,
				user,
				"add-limit"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.limits",
				"create",
				t(
					"Added a new rate limiter '%s', max '%s' requests per '%s' seconds",
					name,
					rate,
					duration
				),
				decryptedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/limits/:limitId
@method     PUT
@desc       Update rate limiter
@access     private
*/
router.put(
	"/:versionId/limits/:limitId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateVersionLimit,
	authorizeAppAction("app.version.limit.update"),
	applyRules("update-limit"),
	validate,
	async (req, res) => {
		try {
			const { org, app, user, limit, version } = req;
			const { name, rate, duration, errorMessage } = req.body;

			let updatedVersion = await versionCtrl.updateOneByQuery(
				{ _id: version._id, "limits._id": limit._id },
				{
					"limits.$.name": name,
					"limits.$.rate": rate,
					"limits.$.duration": duration,
					"limits.$.errorMessage": errorMessage,
					"limits.$.updatedAt": Date.now(),
					"limits.$.updatedBy": user._id,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: version._id }
			);

			const decryptedVersion = helper.decryptVersionData(updatedVersion);
			res.json(decryptedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(
				app,
				updatedVersion,
				user,
				"update-limit"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.limits",
				"update",
				t("Updated rate limiter '%s'", name),
				decryptedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/limits/:limitId
@method     DELETE
@desc       Delete rate limiter
@access     private
*/
router.delete(
	"/:versionId/limits/:limitId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateVersionLimit,
	authorizeAppAction("app.version.limit.delete"),
	async (req, res) => {
		const session = await versionCtrl.startSession();
		try {
			const { org, app, user, limit, version } = req;

			// If the deleted rate limiter is used in default endpoint limits or realtime limiters then we also need to udpate them in any case
			const defaultEndpointLimits = version.defaultEndpointLimits.filter(
				(entry) => entry !== limit.iid
			);
			const realtimeLimits = version.realtime.rateLimits.filter(
				(entry) => entry !== limit.iid
			);

			let updatedVersion = await versionCtrl.pullObjectById(
				version._id,
				"limits",
				limit._id,
				{
					updatedBy: user._id,
					defaultEndpointLimits,
					"realtime.rateLimits": realtimeLimits,
				},
				{ cacheKey: version._id, session }
			);

			// Update also all the endpoints that use the deleted rate limiter object
			await epCtrl.removeRateLimiters(session, version, [limit], user);

			// Commit updates
			await versionCtrl.commit(session);
			const decryptedVersion = helper.decryptVersionData(updatedVersion);
			res.json(decryptedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(
				app,
				updatedVersion,
				user,
				"delete-limit"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.limits",
				"delete",
				t("Deleted rate limiter '%s'", limit.name),
				decryptedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			versionCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/limits
@method     DELETE
@desc       Delete multiple rate limiters
@access     private
*/
router.delete(
	"/:versionId/limits",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.limit.delete"),
	applyRules("delete-multi-limits"),
	validate,
	async (req, res) => {
		const session = await versionCtrl.startSession();
		try {
			const { limitIds } = req.body;
			const { org, app, user, version } = req;

			// If the deleted rate limiters are used in default endpoint limits or realtime limiters then we also need to udpate them in any case
			const limits = version.limits.filter((entry) =>
				limitIds.includes(entry._id.toString())
			);

			const defaultEndpointLimits = version.defaultEndpointLimits.filter(
				(entry) => {
					let limitObj = limits.find((item) => item.iid === entry);
					return limitObj ? false : true;
				}
			);
			const realtimeLimits = version.realtime.rateLimits.filter((entry) => {
				let limitObj = limits.find((item) => item.iid === entry);
				return limitObj ? false : true;
			});

			// Update also all the endpoints that use the deleted rate limiter objects
			await epCtrl.removeRateLimiters(session, version, limits, user);

			let updatedVersion = await versionCtrl.pullObjectByQuery(
				version._id,
				"limits",
				{ _id: { $in: limitIds } },
				{
					updatedBy: user._id,
					defaultEndpointLimits,
					"realtime.rateLimits": realtimeLimits,
				},
				{ cacheKey: version._id, session }
			);

			// Commit updates
			await versionCtrl.commit(session);
			const decryptedVersion = helper.decryptVersionData(updatedVersion);
			res.json(decryptedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(
				app,
				updatedVersion,
				user,
				"delete-limit"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.limits",
				"delete",
				t("Deleted '%s' rate limiter(s)", limitIds.length),
				decryptedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			versionCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/realtime
@method     PUT
@desc       Update the realtime settings of the version
@access     private
*/
router.put(
	"/:versionId/realtime",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.update"),
	applyRules("update-realtime"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version } = req;
			const { enabled, apiKeyRequired, sessionRequired, rateLimits } = req.body;
			const realtimeLimits = rateLimits || [];

			let updatedVersion = await versionCtrl.updateOneById(
				version._id,
				{
					"realtime.enabled": enabled,
					"realtime.apiKeyRequired": apiKeyRequired,
					"realtime.sessionRequired": sessionRequired,
					"realtime.rateLimits": realtimeLimits,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: version._id }
			);

			const decryptedVersion = helper.decryptVersionData(updatedVersion);
			res.json(decryptedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(
				app,
				updatedVersion,
				user,
				"update-realtime"
			);

			// Log action
			auditCtrl.logAndNotify(
				app._id,
				user,
				"org.app.version",
				"update",
				t("Updated app version '%s' realtime properties", version.name),
				decryptedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/keys
@method     POST
@desc       Create a new API key
@access     private
*/
router.post(
	"/:versionId/keys",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.key.create"),
	applyRules("create-key"),
	validate,
	async (req, res) => {
		try {
			const { org, app, user, version } = req;
			const {
				name,
				expiryDate,
				allowRealtime,
				type,
				allowedEndpoints,
				excludedEndpoints,
				domainAuthorization,
				authorizedDomains,
				IPAuthorization,
				authorizedIPs,
			} = req.body;

			let updatedVersion = await versionCtrl.pushObjectById(
				version._id,
				"apiKeys",
				{
					name,
					key: helper.generateSlug("ak", 36),
					expiryDate,
					allowRealtime,
					type,
					allowedEndpoints,
					excludedEndpoints,
					domainAuthorization,
					authorizedDomains,
					IPAuthorization,
					authorizedIPs,
					createdBy: user._id,
				},
				{ updatedBy: user._id },
				{ cacheKey: version._id }
			);

			const decryptedVersion = helper.decryptVersionData(updatedVersion);
			res.json(decryptedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(app, updatedVersion, user, "add-key");

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.keys",
				"create",
				t("Added a new API key '%s'", name),
				decryptedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/keys/:keyId
@method     PUT
@desc       Update an API key
@access     private
*/
router.put(
	"/:versionId/keys/:keyId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateVersionKey,
	authorizeAppAction("app.version.key.update"),
	applyRules("update-key"),
	validate,
	async (req, res) => {
		try {
			const { org, app, user, key, version } = req;
			const {
				name,
				expiryDate,
				allowRealtime,
				type,
				allowedEndpoints,
				excludedEndpoints,
				domainAuthorization,
				authorizedDomains,
				IPAuthorization,
				authorizedIPs,
			} = req.body;

			let updatedVersion = await versionCtrl.updateOneByQuery(
				{ _id: version._id, "apiKeys._id": key._id },
				{
					"apiKeys.$.name": name,
					"apiKeys.$.expiryDate": expiryDate,
					"apiKeys.$.allowRealtime": allowRealtime,
					"apiKeys.$.type": type,
					"apiKeys.$.allowedEndpoints": allowedEndpoints,
					"apiKeys.$.excludedEndpoints": excludedEndpoints,
					"apiKeys.$.domainAuthorization": domainAuthorization,
					"apiKeys.$.authorizedDomains": authorizedDomains,
					"apiKeys.$.IPAuthorization": IPAuthorization,
					"apiKeys.$.authorizedIPs": authorizedIPs,
					"apiKeys.$.updatedAt": Date.now(),
					"apiKeys.$.updatedBy": user._id,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: version._id }
			);

			const decryptedVersion = helper.decryptVersionData(updatedVersion);
			res.json(decryptedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(
				app,
				updatedVersion,
				user,
				"update-key"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.keys",
				"update",
				t("Updated API key '%s'", name),
				decryptedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/keys/:keyId
@method     DELETE
@desc       Delete API key
@access     private
*/
router.delete(
	"/:versionId/keys/:keyId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateVersionKey,
	authorizeAppAction("app.version.key.delete"),
	async (req, res) => {
		try {
			const { org, app, user, key, version } = req;

			let updatedVersion = await versionCtrl.pullObjectById(
				version._id,
				"apiKeys",
				key._id,
				{ updatedBy: user._id },
				{ cacheKey: version._id }
			);

			const decryptedVersion = helper.decryptVersionData(updatedVersion);
			res.json(decryptedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(
				app,
				updatedVersion,
				user,
				"delete-key"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.keys",
				"delete",
				t("Deleted API key '%s'", key.name),
				decryptedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/keys
@method     DELETE
@desc       Delete multiple API keys
@access     private
*/
router.delete(
	"/:versionId/keys",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.key.delete"),
	applyRules("delete-multi-keys"),
	validate,
	async (req, res) => {
		try {
			const { keyIds } = req.body;
			const { org, app, user, version } = req;

			let updatedVersion = await versionCtrl.pullObjectByQuery(
				version._id,
				"apiKeys",
				{ _id: { $in: keyIds } },
				{ updatedBy: user._id },
				{ cacheKey: version._id }
			);

			const decryptedVersion = helper.decryptVersionData(updatedVersion);
			res.json(decryptedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(
				app,
				updatedVersion,
				user,
				"delete-key"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.keys",
				"delete",
				t("Deleted '%s' API key(s)", keyIds.length),
				decryptedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/search?keyword
@method     GET
@desc       Searches the design elements of the version
@access     private
*/
router.get(
	"/:versionId/search",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.view"),
	applyRules("entity-search"),
	validate,
	async (req, res) => {
		try {
			const { keyword } = req.query;

			const conn = mongoose.connection;

			const dataCursor = await conn.db.collection("search_view").find(
				{
					versionId: helper.objectId(req.version._id),
					name: { $regex: helper.escapeStringRegexp(keyword), $options: "i" },
				},
				{
					sort: { name: 1 },
					skip: 0,
					limit: config.get("general.maxSearchResults"),
				}
			);

			const findResult = await dataCursor.toArray();
			await dataCursor.close();
			res.json(findResult);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/npm-search?package=&page=&size=
@method     GET
@desc       Searches the NPM packages
@access     private
*/
router.get(
	"/:versionId/npm-search",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.update"),
	applyRules("npm-search"),
	validate,
	async (req, res) => {
		try {
			const { page, size, sortBy } = req.query;
			const url = `https://registry.npmjs.org/-/v1/search?text=${
				req.query.package
			}&size=${size}&from=${page * size}&sort=${sortBy}`;

			const response = await axios.get(url);
			res.json(
				response.data.objects.map((entry) => {
					return {
						package: entry.package.name,
						version: entry.package.version,
						description: entry.package.description,
					};
				})
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/packages
@method     GET
@desc       Gets the list of NPM packages of the version
@access     private
*/
router.get(
	"/:versionId/packages",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.view"),
	async (req, res) => {
		try {
			const { version } = req;
			const packages = { ...apiServerDefaultPackages };
			const installedPackages = version.npmPackages;

			for (const pkg of installedPackages) {
				if (packages[pkg.name]) continue;
				else packages[pkg.name] = pkg.version;
			}

			res.json(packages);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/typings
@method     GET
@desc       Prepares Typescript Type definitions specific to the app version
@access     private
*/
router.get(
	"/:versionId/typings",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.view"),
	async (req, res) => {
		try {
			const { version } = req;
			const typings = await getVersionTypings(version);

			res.json(typings);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/packages
@method     POST
@desc       Add a new NPM package
@access     private
*/
router.post(
	"/:versionId/packages",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.package.create"),
	applyRules("add-npm-package"),
	validate,
	async (req, res) => {
		try {
			const { org, app, user, version } = req;
			const { name, description } = req.body;

			let updatedVersion = await versionCtrl.pushObjectById(
				version._id,
				"npmPackages",
				{
					name,
					version: req.body.version,
					description,
					createdBy: user._id,
				},
				{ updatedBy: user._id },
				{ cacheKey: version._id }
			);

			const decryptedVersion = helper.decryptVersionData(updatedVersion);
			res.json(decryptedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(
				app,
				updatedVersion,
				user,
				"add-package"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.packages",
				"create",
				t("Added a new NPM package '%s@%s'", name, req.body.version),
				decryptedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/packages/:packageId
@method     PUT
@desc       Update NPM package version
@access     private
*/
router.put(
	"/:versionId/packages/:packageId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateVersionPackage,
	authorizeAppAction("app.version.package.update"),
	applyRules("update-npm-package"),
	validate,
	async (req, res) => {
		try {
			const { org, app, user, key, version, npmPackage } = req;

			let updatedVersion = await versionCtrl.updateOneByQuery(
				{ _id: version._id, "npmPackages._id": key._id },
				{
					"npmPackages.$.version": req.body.version,
					"npmPackages.$.updatedAt": Date.now(),
					"npmPackages.$.updatedBy": user._id,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: version._id }
			);

			const decryptedVersion = helper.decryptVersionData(updatedVersion);
			res.json(decryptedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(
				app,
				updatedVersion,
				user,
				"update-package"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.packages",
				"update",
				t(
					"Updated version of NPM package '%s' from '%s' to '%s'",
					npmPackage.name,
					npmPackage.version,
					req.body.version
				),
				decryptedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/packages/:packageId
@method     DELETE
@desc       Remove NPM package
@access     private
*/
router.delete(
	"/:versionId/packages/:packageId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateVersionPackage,
	authorizeAppAction("app.version.package.delete"),
	async (req, res) => {
		try {
			const { org, app, user, npmPackage, version } = req;

			let updatedVersion = await versionCtrl.pullObjectById(
				version._id,
				"npmPackages",
				npmPackage._id,
				{ updatedBy: user._id },
				{ cacheKey: version._id }
			);

			const decryptedVersion = helper.decryptVersionData(updatedVersion);
			res.json(decryptedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(
				app,
				updatedVersion,
				user,
				"remove-package"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.packages",
				"delete",
				t("Removed NPM package '%s'", npmPackage.name),
				decryptedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/packages
@method     DELETE
@desc       Remove multiple NPM packages
@access     private
*/
router.delete(
	"/:versionId/packages",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.package.delete"),
	applyRules("remove-multi-packages"),
	validate,
	async (req, res) => {
		try {
			const { packageIds } = req.body;
			const { org, app, user, version } = req;

			let updatedVersion = await versionCtrl.pullObjectByQuery(
				version._id,
				"npmPackages",
				{ _id: { $in: packageIds } },
				{ updatedBy: user._id },
				{ cacheKey: version._id }
			);

			const decryptedVersion = helper.decryptVersionData(updatedVersion);
			res.json(decryptedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(
				app,
				updatedVersion,
				user,
				"remove-package"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.packages",
				"delete",
				t("Removed '%s' NPM package(s)", packageIds.length),
				decryptedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/auth/save-model
@method     POST
@desc       Saves the user data model database and model info
@access     private
*/
router.post(
	"/:versionId/auth/save-model",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.auth.update"),
	applyRules("save-model"),
	validate,
	async (req, res) => {
		try {
			const { org, app, user, version, database, model } = req;

			// Check if the required fields are present in the user data model
			const missingFields = [];
			const conflictingFields = [];
			for (const entry of authUserDataModel) {
				// Check if entry exists in user data model
				const fields = req.model.fields;
				let fieldExists = false;
				for (const field of fields) {
					if (field.name === entry.name) {
						if (field.type === entry.type) {
							fieldExists = true;
							break;
						} else {
							fieldExists = true;
							conflictingFields.push({ ...entry, existingType: field.type });
							break;
						}
					}
				}

				if (!fieldExists) missingFields.push(entry);
			}

			if (missingFields.length > 0 || conflictingFields.length > 0) {
				return res.status(422).json({
					error: t("Invalid User Data Model"),
					details: t(
						"User data model '%s' in database '%s' is not a valid model to store authentication user data. There are either missing or conflicing fields that need to be fixed.",
						database.name,
						model.name
					),
					code: ERROR_CODES.invalidUserDataModel,
					missingFields,
					conflictingFields,
				});
			}

			let updatedVersion = await versionCtrl.updateOneById(
				version._id,
				{
					"authentication.userDataModel.database": database.iid,
					"authentication.userDataModel.model": model.iid,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: version._id }
			);

			const decryptedVersion = helper.decryptVersionData(updatedVersion);
			res.json(decryptedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(
				app,
				updatedVersion,
				user,
				"save-userdata-model"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version",
				"update",
				t(
					"Set authentication user data model to '%s.%s'",
					database.name,
					model.name
				),
				decryptedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/auth/add-fields
@method     POST
@desc       Adds the missing user data model fields required for authentication
@access     private
*/
router.post(
	"/:versionId/auth/add-fields",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.auth.update"),
	applyRules("add-fields"),
	validate,
	async (req, res) => {
		// Start new database transaction session
		const session = await versionCtrl.startSession();
		try {
			const { org, app, user, version, database, model } = req;

			// Check if the required fields are present in the user data model
			const missingFields = [];
			const conflictingFields = [];
			for (const entry of authUserDataModel) {
				// Check if entry exists in user data model
				const fields = req.model.fields;
				let fieldExists = false;
				for (const field of fields) {
					if (field.name === entry.name) {
						if (field.type === entry.type) {
							fieldExists = true;
							break;
						} else {
							fieldExists = true;
							conflictingFields.push({ ...entry, existingType: field.type });
							break;
						}
					}
				}

				if (!fieldExists)
					missingFields.push({
						...entry,
						dbType: dbTypeMappings[database.type][entry.type],
					});
			}

			if (conflictingFields.length > 0) {
				await versionCtrl.endSession(session);
				return res.status(422).json({
					error: t("Invalid User Data Model"),
					details: t(
						"User data model '%s' in database '%s' is not a valid model to store authentication user data. There are conflicing fields that need to be fixed.",
						database.name,
						model.name
					),
					code: ERROR_CODES.invalidUserDataModel,
					conflictingFields,
				});
			}

			// Prepare the data for the fields to add
			const fieldsToAdd = modelCtrl.prepareAuthUserDataModelMissingFields(
				model,
				missingFields,
				user
			);

			const updatedModel = await modelCtrl.pushObjectById(
				model._id,
				"fields",
				fieldsToAdd,
				{ updatedBy: user._id },
				{ cacheKey: model._id, session }
			);

			let updatedVersion = await versionCtrl.updateOneById(
				version._id,
				{
					"authentication.userDataModel.database": database.iid,
					"authentication.userDataModel.model": model.iid,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: version._id, session }
			);

			// Commit transaction
			await versionCtrl.commit(session);

			const decryptedVersion = helper.decryptVersionData(updatedVersion);
			res.json(decryptedVersion);

			// Deploy database updates to environments if auto-deployment is enabled
			await deployCtrl.updateDatabase(app, version, user, database, "update");

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.db.model",
				"update",
				t(
					"Added missing fields to authentication user data model '%s.%s'",
					database.name,
					model.name
				),
				updatedModel,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					dbId: database._id,
					modelId: model._id,
				}
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version",
				"update",
				t(
					"Set authentication user data model to '%s.%s'",
					database.name,
					model.name
				),
				decryptedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			await versionCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/auth/save-redirect
@method     POST
@desc       Sets the default redirect URLs
@access     private
*/
router.post(
	"/:versionId/auth/save-redirect",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.auth.update"),
	applyRules("save-redirect-urls"),
	validate,
	async (req, res) => {
		try {
			const { redirectURLs } = req.body;
			const { org, app, user, version } = req;

			let updatedVersion = await versionCtrl.updateOneById(
				version._id,
				{
					"authentication.redirectURLs": redirectURLs,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: version._id }
			);

			const decryptedVersion = helper.decryptVersionData(updatedVersion);
			res.json(decryptedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(
				app,
				updatedVersion,
				user,
				"set-redirect-urls"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version",
				"update",
				t("Set default redirect URLs to '%s'", redirectURLs.join(", ")),
				decryptedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/auth/save-email
@method     POST
@desc       Saves the email authentication settings
@access     private
*/
router.post(
	"/:versionId/auth/save-email",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.auth.update"),
	applyRules("save-email-config"),
	validate,
	async (req, res) => {
		try {
			const { org, app, user, version } = req;

			// If email confirmation is required then we need to check the STP connection
			if (req.body.confirmEmail) {
				const { host, port, useTLS, user, password } = req.body.customSMTP;
				let transport = nodemailer.createTransport({
					host: host,
					port: port,
					secure: useTLS,
					auth: {
						user: user,
						pass: password,
					},
					pool: false,
				});

				try {
					await transport.verify();
				} catch (err) {
					return res.status(400).json({
						error: t("Connection Error"),
						details: t("Cannot connect to the SMTP server. %s", err.message),
						code: ERROR_CODES.connectionError,
					});
				}
			}

			// If we have the password then encrypt it
			if (req.body.customSMTP?.password) {
				req.body.customSMTP.password = helper.encryptText(
					req.body.customSMTP.password
				);
			}

			let updatedVersion = await versionCtrl.updateOneById(
				version._id,
				{
					"authentication.email": req.body,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: version._id }
			);

			const decryptedVersion = helper.decryptVersionData(updatedVersion);
			res.json(decryptedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(
				app,
				updatedVersion,
				user,
				"save-email-auth"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version",
				"update",
				t("Saved email based authentication settings"),
				decryptedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/auth/save-phone
@method     POST
@desc       Saves the phone authentication settings
@access     private
*/
router.post(
	"/:versionId/auth/save-phone",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.auth.update"),
	applyRules("save-phone-config"),
	validate,
	async (req, res) => {
		try {
			const { org, app, user, version } = req;

			// If we have the SMS provider configuration
			if (req.body.providerConfig)
				req.body.providerConfig = helper.encyrptSensitiveData(
					req.body.providerConfig
				);

			let updatedVersion = await versionCtrl.updateOneById(
				version._id,
				{
					"authentication.phone": req.body,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: version._id }
			);

			const decryptedVersion = helper.decryptVersionData(updatedVersion);
			res.json(decryptedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(
				app,
				updatedVersion,
				user,
				"save-phone-auth"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version",
				"update",
				t("Saved phone based authentication settings"),
				decryptedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/auth/providers
@method     POST
@desc       Create a new oAuth provider entry.
@access     private
*/
router.post(
	"/:versionId/auth/providers",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.auth.update"),
	applyRules("create-oauth-provider"),
	validate,
	async (req, res) => {
		try {
			const { org, app, user, version } = req;

			req.body.config = helper.encyrptSensitiveData(req.body.config);

			let updatedVersion = await versionCtrl.pushObjectById(
				version._id,
				"authentication.providers",
				{
					...req.body,
					createdBy: user._id,
				},
				{ updatedBy: user._id },
				{ cacheKey: version._id }
			);

			const decryptedVersion = helper.decryptVersionData(updatedVersion);
			res.json(decryptedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(
				app,
				updatedVersion,
				user,
				"add-oauth-provider"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version",
				"update",
				t("Configured '%s' oAuth settings", req.body.provider),
				decryptedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/auth/providers/:providerId
@method     PUT
@desc       Updates an existing oAuth provider setting.
@access     private
*/
router.put(
	"/:versionId/auth/providers/:providerId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateVersionOauthProvider,
	authorizeAppAction("app.version.auth.update"),
	applyRules("update-oauth-provider"),
	validate,
	async (req, res) => {
		try {
			const { org, app, user, oauthProvider, version } = req;

			req.body = helper.encyrptSensitiveData(req.body);

			const updateObj = {};
			for (let key in req.body) {
				updateObj[`authentication.providers.$.config.${key}`] = req.body[key];
			}

			let updatedVersion = await versionCtrl.updateOneByQuery(
				{ _id: version._id, "authentication.providers._id": oauthProvider._id },
				{
					...updateObj,
					"authentication.providers.$.updatedAt": Date.now(),
					"authentication.providers.$.updatedBy": user._id,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: version._id }
			);

			const decryptedVersion = helper.decryptVersionData(updatedVersion);
			res.json(decryptedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(
				app,
				updatedVersion,
				user,
				"update-oauth-provider"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version",
				"update",
				t("Updated '%s' oAuth settings", oauthProvider.provider),
				decryptedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/auth/providers/:providerId
@method     DELETE
@desc       Delete a specific oAuth provider configuration
@access     private
*/
router.delete(
	"/:versionId/auth/providers/:providerId",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateVersionOauthProvider,
	authorizeAppAction("app.version.auth.update"),
	async (req, res) => {
		try {
			const { org, app, user, oauthProvider, version } = req;

			let updatedVersion = await versionCtrl.pullObjectById(
				version._id,
				"authentication.providers",
				oauthProvider._id,
				{ updatedBy: user._id },
				{ cacheKey: version._id }
			);

			const decryptedVersion = helper.decryptVersionData(updatedVersion);
			res.json(decryptedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(
				app,
				updatedVersion,
				user,
				"delete-oauth-provider"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version",
				"update",
				t("Deleted '%s' oAuth settings", oauthProvider.provider),
				decryptedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/auth/messages
@method     POST
@desc       Sets the authentication message template
@access     private
*/
router.post(
	"/:versionId/auth/messages",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.auth.update"),
	applyRules("set-message-template"),
	validate,
	async (req, res) => {
		try {
			const { org, app, user, version } = req;
			const { type } = req.body;

			// If SMS code message template remove uncessary input
			if (type === "verify_sms_code") {
				delete req.body.fromEmail;
				delete req.body.fromName;
				delete req.body.subject;
			}

			let templates = version.authentication.messages ?? [];
			const templateEntry = templates.find((entry) => entry.type === type);
			if (templateEntry) {
				templates = templates.map((entry) => {
					if (entry.type === type)
						return {
							...entry,
							...req.body,
							updatedBy: user._id,
							updatedAt: Date.now(),
						};
					else return entry;
				});
			} else {
				templates.push({
					...req.body,
					createdBy: user._id,
				});
			}

			let updatedVersion = await versionCtrl.updateOneById(
				version._id,
				{
					"authentication.messages": templates,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: version._id }
			);

			const decryptedVersion = helper.decryptVersionData(updatedVersion);
			res.json(decryptedVersion);

			// Deploy version updates to environments if auto-deployment is enabled
			await deployCtrl.updateVersionInfo(
				app,
				updatedVersion,
				user,
				"set-auth-message"
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version",
				"update",
				t("Updated the authentication message template '%s'", type),
				decryptedVersion,
				{ orgId: org._id, appId: app._id, versionId: version._id }
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

export default router;
