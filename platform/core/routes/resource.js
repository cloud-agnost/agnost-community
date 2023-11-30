import express from "express";
import resourceCtrl from "../controllers/resource.js";
import envCtrl from "../controllers/environment.js";
import resLogCtrl from "../controllers/resourceLog.js";
import userCtrl from "../controllers/user.js";
import auditCtrl from "../controllers/audit.js";
import connCtrl from "../controllers/connection.js";
import deployCtrl from "../controllers/deployment.js";
import { authSession } from "../middlewares/authSession.js";
import { authMasterToken } from "../middlewares/authMasterToken.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validateOrg } from "../middlewares/validateOrg.js";
import {
	validateResource,
	validateResourceLog,
} from "../middlewares/validateResource.js";
import { authorizeOrgAction } from "../middlewares/authorizeOrgAction.js";
import { applyRules } from "../schemas/resource.js";
import { applyRules as applyLogRules } from "../schemas/resourceLog.js";
import { validate } from "../middlewares/validate.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/org/:orgId/resource/test
@method     POST
@desc       Tests the resource connection
@access     private
*/
router.post(
	"/test",
	checkContentType,
	authSession,
	validateOrg,
	authorizeOrgAction("org.resource.add"),
	applyRules("test"),
	validate,
	async (req, res) => {
		try {
			let { instance, access } = req.body;
			// Try to connect to the database
			try {
				// Test database connection
				await connCtrl.testConnection(instance, access);
			} catch (err) {
				return res.status(422).json({
					error: t("Connection Error"),
					details: err.message,
					code: ERROR_CODES.notAllowed,
				});
			}

			res.json();
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/resource/iid/:iid
@method     GET
@desc       Get the resource matching the iid
@access     private
*/
router.get(
	"/iid/:iid",
	checkContentType,
	authSession,
	validateOrg,
	authorizeOrgAction("org.resource.view"),
	async (req, res) => {
		try {
			const { org } = req.body;
			const { iid } = req.params;
			const resourceObj = await resourceCtrl.getOneByQuery({
				iid,
				orgId: org._id,
			});
			res.json(helper.decryptResourceData(resourceObj));
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/resource/add
@method     POST
@desc       Add an existing resource. These resources are not managed by the cluster but we just get access to them and use them. 
@access     private
*/
router.post(
	"/add",
	checkContentType,
	authSession,
	validateOrg,
	authorizeOrgAction("org.resource.add"),
	applyRules("add"),
	validate,
	async (req, res) => {
		const session = await resourceCtrl.startSession();
		try {
			const { org, user } = req;
			let {
				appId,
				name,
				type,
				instance,
				allowedRoles,
				access,
				accessReadOnly,
			} = req.body;

			// Admin should always be included in allowedRoles list
			if (!allowedRoles.includes("Admin")) allowedRoles.push("Admin");

			// Try to connect to the resource
			let connResult = null;
			try {
				// Test connection
				connResult = await connCtrl.testConnection(instance, access);
			} catch (err) {
				await resourceCtrl.endSession(session);

				return res.status(422).json({
					error: t("Connection Error - Primary"),
					details: err.message,
					code: ERROR_CODES.notAllowed,
				});
			}

			if (accessReadOnly) {
				for (let i = 0; i < accessReadOnly.length; i++) {
					const connSettings = accessReadOnly[i];
					try {
						// Test connection
						await connCtrl.testConnection(instance, connSettings);
					} catch (err) {
						await resourceCtrl.endSession(session);

						return res.status(422).json({
							error: t("Connection Error - Read-only server %s", i + 1),
							details: `Read-only server #${i + 1}: ${err.message}`,
							code: ERROR_CODES.notAllowed,
						});
					}
				}
			}

			// Encrypt sensitive access data
			access = helper.encyrptSensitiveData(access);
			if (accessReadOnly)
				accessReadOnly = helper.encyrptSensitiveData(accessReadOnly);

			// Create the new organization resource
			let resourceId = helper.generateId();
			let resourceObj = await resourceCtrl.create(
				{
					_id: resourceId,
					orgId: org._id,
					iid: helper.generateSlug("res"),
					appId,
					name,
					type,
					instance,
					managed: false,
					deletable: true,
					allowedRoles,
					config: instance === "RabbitMQ" ? connResult : undefined,
					access,
					accessReadOnly,
					status: "Binding",
					createdBy: user._id,
				},
				{ cacheKey: resourceId, session }
			);

			const logObj = await resLogCtrl.create(
				{
					orgId: org._id,
					resourceId: resourceId,
					action: "bind",
					status: "Binding",
					createdBy: user._id,
				},
				{ session }
			);

			await resourceCtrl.commit(session);
			const decryptedResource = helper.decryptResourceData(resourceObj);
			res.json(decryptedResource);

			// Bind the managed resource
			await resourceCtrl.manageClusterResources([
				{ resource: resourceObj, log: logObj },
			]);

			// Log action
			auditCtrl.logAndNotify(
				org._id,
				user,
				"org.resource",
				"add",
				t("Added new '%s' resource '%s' named '%s'", type, instance, name),
				decryptedResource,
				{ orgId: org._id, appId, resourceId }
			);
		} catch (error) {
			await resourceCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/resource/create
@method     POST
@desc       Creates a new resource that is managed by the cluster. 
@access     private
*/
router.post(
	"/create",
	checkContentType,
	authSession,
	validateOrg,
	authorizeOrgAction("org.resource.create"),
	applyRules("create"),
	validate,
	async (req, res) => {
		const session = await resourceCtrl.startSession();
		try {
			const { org, user } = req;
			let { appId, name, type, instance, allowedRoles, config } = req.body;

			// We create RabbitMQ clusters with delayed-message-exchange add-on
			if (instance !== "RabbitMQ") config.delayedMessages = true;

			// Create the new organization resource. The access settings will be updated later by the engine-worker
			let resourceId = helper.generateId();
			let resourceObj = await resourceCtrl.create(
				{
					_id: resourceId,
					orgId: org._id,
					iid: helper.generateSlug("res"),
					appId,
					name,
					type,
					instance,
					managed: true,
					deletable: true,
					allowedRoles,
					config,
					status: "Creating",
					createdBy: user._id,
				},
				{ cacheKey: resourceId, session }
			);

			const logObj = await resLogCtrl.create(
				{
					orgId: org._id,
					resourceId: resourceId,
					action: "create",
					status: "Creating",
					createdBy: user._id,
				},
				{ session }
			);

			await resourceCtrl.commit(session);
			const decryptedResource = helper.decryptResourceData(resourceObj);
			res.json(decryptedResource);

			// For PostgreSQL the password is created by the operator
			if (instance !== "PostgreSQL")
				resourceObj.config.password = helper.generatePassword(16);

			// For PostgreSQL the username is created by the operator, for Redis we do not need a username
			if (instance !== "PostgreSQL" && instance !== "Redis")
				resourceObj.config.username = helper.generateUsername(16);

			// Create the managed resource
			await resourceCtrl.manageClusterResources([
				{ resource: resourceObj, log: logObj },
			]);

			// Log action
			auditCtrl.logAndNotify(
				org._id,
				user,
				"org.resource",
				"create",
				t("Created new '%s' resource '%s' named '%s'", type, instance, name),
				decryptedResource,
				{ orgId: org._id, appId, resourceId }
			);
		} catch (error) {
			await resourceCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/resource?page=0&size=50&type=engine&instance=Agnost K8s Cluster&search=&sortBy=name&sortDir=asc&appId
@method     GET
@desc       Get organization/app resources
@access     private
*/
router.get(
	"/",
	authSession,
	validateOrg,
	authorizeOrgAction("org.resource.view"),
	applyRules("get-resources"),
	validate,
	async (req, res) => {
		try {
			const { org } = req;
			const { search, type, instance, sortBy, sortDir, status } = req.query;

			let query = { orgId: org._id };

			if (search) query.name = { $regex: search, $options: "i" };

			// Type filter
			if (type) {
				if (Array.isArray(type)) query.type = { $in: type };
				else query.type = type;
			}

			// Instance filter
			if (instance) {
				if (Array.isArray(instance)) query.instance = { $in: instance };
				else query.instance = instance;
			}

			// Status filter
			if (status) {
				if (Array.isArray(status)) query.status = { $in: status };
				else query.status = status;
			}

			let sort = {};
			if (sortBy && sortDir) {
				sort[sortBy] = sortDir;
			} else sort = { createdAt: "desc" };

			let resources = await resourceCtrl.getManyByQuery(query, {
				sort,
			});

			res.json(helper.decryptResourceData(resources));
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/resource/edit-list?search=&sortBy=name&sortDir=asc
@method     GET
@desc       Get organization/app resources
@access     private
*/
router.get(
	"/edit-list",
	authSession,
	validateOrg,
	authorizeOrgAction("org.resource.view"),
	applyRules("get-resources"),
	validate,
	async (req, res) => {
		try {
			const { org } = req;
			const { search, sortBy, sortDir } = req.query;

			let query = { orgId: org._id, deletable: true };
			query.$and = [{ deletable: true }, { instance: { $ne: "API Server" } }];

			if (search) query.name = { $regex: search, $options: "i" };

			let sort = {};
			if (sortBy && sortDir) {
				sort[sortBy] = sortDir;
			} else sort = { createdAt: "desc" };

			let resources = await resourceCtrl.getManyByQuery(query, {
				sort,
			});

			res.json(helper.decryptResourceData(resources));
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/resource/:resourceId
@method     PUT
@desc       Update organization resource info (e.g., allowedRoles). We do not allow update of the name of the resource
@access     private
*/
router.put(
	"/:resourceId",
	checkContentType,
	authSession,
	validateOrg,
	validateResource,
	authorizeOrgAction("org.resource.update"),
	applyRules("update"),
	validate,
	async (req, res) => {
		const session = await resourceCtrl.startSession();
		try {
			const { org, user, resource } = req;
			let { allowedRoles } = req.body;

			// Admin should always be included in allowedRoles list
			if (!allowedRoles.includes("Admin")) allowedRoles.push("Admin");

			let updatedResource = await resourceCtrl.updateOneById(
				resource._id,
				{
					allowedRoles,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: resource._id, session }
			);

			await resourceCtrl.commit(session);
			const decryptedResource = helper.decryptResourceData(updatedResource);
			res.json(decryptedResource);

			// Log action
			auditCtrl.logAndNotify(
				org._id,
				user,
				"org.resource",
				"update",
				t(
					"Updated allowed roles of '%s' resource '%s' named '%s'",
					resource.type,
					resource.instance,
					resource.name
				),
				decryptedResource,
				{
					orgId: org._id,
					appId: updatedResource.appId,
					resourceId: resource._id,
				}
			);
		} catch (error) {
			await resourceCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/resource/:resourceId/access
@method     PUT
@desc       Update resource access settings
@access     private
*/
router.put(
	"/:resourceId/access",
	checkContentType,
	authSession,
	validateOrg,
	validateResource,
	authorizeOrgAction("org.resource.update"),
	applyRules("update-access"),
	validate,
	async (req, res) => {
		const session = await resourceCtrl.startSession();
		try {
			const { org, user, resource } = req;
			let { access, accessReadOnly } = req.body;

			if (resource.managed) {
				await resourceCtrl.endSession(session);

				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"The %s resource named '%s' is a managed resource. You cannot update access settings of a resource that is managed by the Agnost cluster.",
						resource.instance,
						resource.name
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// If the resouce is already under create, update or delete operations, then do not allow the new configuration update
			// unless the previous one is completed
			if (
				["Creating", "Updating", "Deleting", "Binding"].includes(
					resource.status
				)
			) {
				await resourceCtrl.endSession(session);

				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"The %s resource named '%s' is in '%s' status. You need to wait for the completion of the existing operation.",
						resource.instance,
						resource.name,
						resource.status
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Try to connect to the resource
			let connResult = null;
			try {
				// Test connection
				connResult = await connCtrl.testConnection(resource.instance, access);
			} catch (err) {
				await resourceCtrl.endSession(session);

				return res.status(422).json({
					error: t("Connection Error - Primary"),
					details: err.message,
					code: ERROR_CODES.notAllowed,
				});
			}

			if (accessReadOnly) {
				for (let i = 0; i < accessReadOnly.length; i++) {
					const connSettings = accessReadOnly[i];
					try {
						// Test connection
						await connCtrl.testConnection(resource.instance, connSettings);
					} catch (err) {
						await resourceCtrl.endSession(session);

						return res.status(422).json({
							error: t("Connection Error - Read-only server %s", i + 1),
							details: `Read-only server #${i + 1}: ${err.message}`,
							code: ERROR_CODES.notAllowed,
						});
					}
				}
			}

			// Encrypt sensitive access data
			access = helper.encyrptSensitiveData(access);
			if (accessReadOnly)
				accessReadOnly = helper.encyrptSensitiveData(accessReadOnly);

			// Update info whether rabbitmq support delayed messages or not
			let config = resource.config;
			if (resource.instance === "RabbitMQ") {
				config = { ...config, ...connResult };
			}

			const updatedResource = await resourceCtrl.updateOneById(
				resource._id,
				{
					config,
					access,
					accessReadOnly,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: resource._id, session }
			);

			await resourceCtrl.commit(session);

			const decryptedResource = helper.decryptResourceData(updatedResource);
			res.json(decryptedResource);

			// Get all the impacted environments and associated versions so that we can refresh their deployments and API servers
			const environments = await envCtrl.getManyByQuery({
				orgId: org._id,
				"mappings.resource.iid": resource.iid,
			});

			// Refresh the deployment data and respective API servers
			environments.forEach(async (element) => {
				deployCtrl.updateResourceAccessSettings(
					element.appId,
					element.versionId,
					updatedResource,
					user
				);
			});

			// Log action
			auditCtrl.logAndNotify(
				org._id,
				user,
				"org.resource",
				"update",
				t(
					"Updated access settings of '%s' resource named '%s'",
					resource.instance,
					resource.name
				),
				decryptedResource,
				{
					orgId: org._id,
					appId: updatedResource.appId,
					resourceId: resource._id,
				}
			);
		} catch (error) {
			await resourceCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/resource/:resourceId/config
@method     PUT
@desc       Update resource configuration
@access     private
*/
router.put(
	"/:resourceId/config",
	checkContentType,
	authSession,
	validateOrg,
	validateResource,
	authorizeOrgAction("org.resource.update"),
	applyRules("update-config"),
	validate,
	async (req, res) => {
		const session = await resourceCtrl.startSession();
		try {
			const { org, user, resource } = req;
			let { config, updateType } = req.body;

			if (!resource.managed) {
				await resourceCtrl.endSession(session);

				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"The %s resource named '%s' is not a managed resource. You cannot update configuration of a resource that is not managed by the Agnost cluster.",
						resource.instance,
						resource.name
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// If the resouce is already under create, update or delete operations, then do not allow the new configuration update
			// unless the previous one is completed
			if (
				["Creating", "Updating", "Deleting", "Binding"].includes(
					resource.status
				)
			) {
				await resourceCtrl.endSession(session);

				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"The %s resource named '%s' is in '%s' status. You need to wait for the completion of the existing operation.",
						resource.instance,
						resource.name,
						resource.status
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// In case of database resource the size and other parameters (replicas/instances and version) need to be upated separately
			if (resource.type === "database") {
				if (updateType === "size") {
					config = { ...resource.config, size: config.size };
				} else {
					config = { ...config, size: resource.config.size };
				}
			}

			if (resource.instance === "Redis")
				// We cannot change the read-replica configuration of a Redis resource
				config.readReplica = resource.config.readReplica;

			const updatedResource = await resourceCtrl.updateOneById(
				resource._id,
				{
					config,
					status: "Updating",
					updatedBy: user._id,
				},
				{},
				{ cacheKey: resource._id, session }
			);

			const logObj = await resLogCtrl.create(
				{
					orgId: org._id,
					resourceId: resource._id,
					action: "update",
					status: "Updating",
					createdBy: user._id,
				},
				{ session }
			);

			await resourceCtrl.commit(session);

			const decryptedResource = helper.decryptResourceData(updatedResource);
			res.json(decryptedResource);

			// Update the managed resource
			await resourceCtrl.manageClusterResources([
				{ resource: updatedResource, log: logObj },
			]);

			// Log action
			auditCtrl.logAndNotify(
				org._id,
				user,
				"org.resource",
				"update",
				t(
					"Updated configuration of '%s' resource named '%s'",
					resource.instance,
					resource.name
				),
				decryptedResource,
				{
					orgId: org._id,
					appId: updatedResource.appId,
					resourceId: resource._id,
				}
			);
		} catch (error) {
			await resourceCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/resource/:resourceId
@method     DELETE
@desc       Delete organization resource. Organization resouces can only be deleted if they are not used by any version environment.
@access     private
*/
router.delete(
	"/:resourceId",
	checkContentType,
	authSession,
	validateOrg,
	validateResource,
	authorizeOrgAction("org.resource.delete"),
	async (req, res) => {
		const session = await resourceCtrl.startSession();
		try {
			const { org, user, resource } = req;

			if (!resource.deletable || resource.instance === "API Server") {
				await resourceCtrl.endSession(session);

				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"The %s resource named '%s' is either a cluster resource that is created when the cluster is set up or an API server resource of an app version. Cluster resources cannot be deleted unless you delete the cluster. API server resources can only be deleted when their associated version is deleted.",
						resource.instance,
						resource.name
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Check if this resource has been used by any environment
			let environments = await envCtrl.getManyByQuery({
				orgId: org._id,
				"mappings.resource.iid": resource.iid,
			});

			if (environments.length > 0) {
				await resourceCtrl.endSession(session);

				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"The %s resource named '%s' is being used by at least one app version of the organization '%s'. You cannot delete a resource that is used by an app version. First remove resource dependencies in app versions and then delete the resource.",
						resource.instance,
						resource.name,
						org.name
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Delete organization resource
			await resourceCtrl.deleteOneById(resource._id, {
				cacheKey: resource._id,
				session,
			});

			// Delete resource logs
			await resLogCtrl.deleteManyByQuery(
				{
					orgId: org._id,
					resourceId: resource._id,
				},
				{ session }
			);

			await resourceCtrl.commit(session);
			res.json();

			// If this is a managed a deleteable resource then delete it
			if (resource.deletable && resource.managed)
				resourceCtrl.deleteClusterResources([resource]);

			// Log action
			auditCtrl.logAndNotify(
				org._id,
				user,
				"org.resource",
				"delete",
				t("Deleted '%s' resource named '%s'", resource.instance, resource.name),
				{},
				{ orgId: org._id, appId: resource.appId, resourceId: resource._id }
			);
		} catch (error) {
			await resourceCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/resource/:resourceId/dependents
@method     GET
@desc       Get list of environments dependent to the organization resource
@access     private
*/
router.get(
	"/:resourceId/dependents",
	authSession,
	validateOrg,
	validateResource,
	authorizeOrgAction("org.resource.view"),
	async (req, res) => {
		try {
			const { org, resource } = req;

			// Get list of dependent environments
			let environments = await envCtrl.getManyByQuery(
				{
					orgId: org._id,
					"mappings.resource.iid": resource.iid,
				},
				{
					lookup: "appId",
					lookup2: "versionId",
				}
			);

			res.json(environments);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/resource/:resourceId/logs
@method     GET
@desc       Returns resource logs
@access     private
*/
router.get(
	"/:resourceId/logs",
	authSession,
	validateOrg,
	validateResource,
	authorizeOrgAction("org.resource.view"),
	applyRules("view-logs"),
	validate,
	async (req, res) => {
		try {
			const { org, resource } = req;
			const { page, size, status, action, actor, sortBy, sortDir, start, end } =
				req.query;

			let query = {
				orgId: org._id,
				resourceId: resource._id,
			};

			// Status filter
			if (status) {
				if (Array.isArray(status)) query["status"] = { $in: status };
				else query["status"] = status;
			}

			// Action filter
			if (action) {
				if (Array.isArray(action)) query["action"] = { $in: action };
				else query["action"] = action;
			}

			// Actor filter
			if (actor) {
				if (Array.isArray(action)) query["createdBy"] = { $in: actor };
				else query["createdBy"] = actor;
			}

			if (start && !end) query.createdAt = { $gte: start };
			else if (!start && end) query.createdAt = { $lte: end };
			else if (start && end) query.createdAt = { $gte: start, $lte: end };

			let sort = {};
			if (sortBy && sortDir) {
				sort[sortBy] = sortDir;
			} else sort = { createdAt: "desc" };

			let logs = await resLogCtrl.getManyByQuery(query, {
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
@route      /v1/org/:orgId/resource/:resourceId/log:/logId
@method     POST
@desc       Update resource log entry. We do not update resource status through this endpoint, this just udpates the resource log status. 
			The actual resource status is done through the engine-monitor process.
@access     private
*/
router.post(
	"/:resourceId/log/:logId",
	checkContentType,
	authMasterToken,
	validateOrg,
	validateResource,
	validateResourceLog,
	applyLogRules("update"),
	validate,
	async (req, res) => {
		try {
			const { org, resource, log } = req;
			const { status, logs } = req.body;
			let timestamp = Date.now();

			// Get user information
			let user = await userCtrl.getOneById(log.createdBy, {
				cacheKey: log.createdBy,
			});

			const updatedLog = await resLogCtrl.updateOneById(log._id, {
				status: status,
				logs: logs,
				updatedAt: timestamp,
			});

			res.json();

			// Log action
			auditCtrl.logAndNotify(
				org._id,
				user,
				"org.resource.log",
				log.action,
				t(
					status === "OK"
						? "Completed '%s' operation on '%s' resource named '%s' successfully"
						: "Completed '%s' operation on '%s' resource named '%s' with errors",
					log.action,
					resource.instance,
					resource.name
				),
				updatedLog,
				{ orgId: org._id, appId: resource.appId, resourceId: resource._id }
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/resource/:resourceId/update-read-access-settings
@method     POST
@desc       Updates the access settings for read replicas of the resource. 
@access     private
*/
router.post(
	"/:resourceId/update-read-access-settings",
	checkContentType,
	authMasterToken,
	validateOrg,
	validateResource,
	async (req, res) => {
		try {
			const { org, resource } = req;

			// Get user information
			let user = await userCtrl.getOneById(resource.updatedBy, {
				cacheKey: resource.updatedBy,
			});

			const updatedResource = await resourceCtrl.updateOneById(
				resource._id,
				{
					accessReadOnly: req.body,
				},
				{},
				{ cacheKey: resource._id }
			);

			res.json();

			// Get all the impacted environments and associated versions so that we can refresh their deployments and API servers
			const environments = await envCtrl.getManyByQuery({
				orgId: org._id,
				"mappings.resource.iid": resource.iid,
			});

			// Refresh the deployment data and respective API servers
			environments.forEach(async (element) => {
				deployCtrl.updateResourceAccessSettings(
					element.appId,
					element.versionId,
					updatedResource,
					user
				);
			});

			// Log action
			const decryptedResource = helper.decryptResourceData(updatedResource);
			auditCtrl.logAndNotify(
				org._id,
				user,
				"org.resource",
				"update",
				t(
					"Updated read-only replica access settings of '%s' resource named '%s'",
					resource.instance,
					resource.name
				),
				decryptedResource,
				{
					orgId: org._id,
					appId: updatedResource.appId,
					resourceId: resource._id,
				}
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

export default router;
