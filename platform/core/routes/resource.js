import express from "express";
import resourceCtrl from "../controllers/resource.js";
import envCtrl from "../controllers/environment.js";
import resLogCtrl from "../controllers/resourceLog.js";
import userCtrl from "../controllers/user.js";
import appCtrl from "../controllers/app.js";
import auditCtrl from "../controllers/audit.js";
import connCtrl from "../controllers/connection.js";
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
@route      /v1/org/:orgId/resource
@method     POST
@desc       Create a new organization resource
@access     private
*/
router.post(
	"/",
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
			let {
				appId,
				name,
				type,
				instance,
				managed,
				allowedRoles,
				config,
				access,
				accessReadOnly,
			} = req.body;

			// Check validity of the application
			if (appId) {
				let app = await appCtrl.getOneById(appId, { cacheKey: appId });

				if (!app) {
					await resourceCtrl.endSession(session);
					return res.status(404).json({
						error: t("Not Found"),
						details: t(
							"No such application with the provided id '%s' exists.",
							appId
						),
						code: ERROR_CODES.notFound,
					});
				}

				if (app.orgId.toString() !== org._id.toString()) {
					return res.status(401).json({
						error: t("Not Authorized"),
						details: t(
							"Organization does not have an app with the provided id '%s'",
							appId
						),
						code: ERROR_CODES.unauthorized,
					});
				}
			}

			// Admin should always be included in allowedRoles list
			if (!allowedRoles.includes("Admin")) allowedRoles.push("Admin");

			// If this is not a managed resource and we try to add a database connection then try to connect to the database
			if (!managed) {
				if (type === "database") {
					try {
						// Test database connection
						await connCtrl.testDBConnection(instance, access);
						if (accessReadOnly)
							await connCtrl.testDBConnection(instance, accessReadOnly);
					} catch (err) {
						await resourceCtrl.endSession(session);

						return res.status(422).json({
							error: t("Connection Error"),
							details: err.message,
							code: ERROR_CODES.notAllowed,
						});
					}
				} else if (type === "engine") {
					try {
						// Test engine connection
						await connCtrl.testEngineConnection(access);
					} catch (err) {
						await resourceCtrl.endSession(session);

						return res.status(422).json({
							error: t("Connection Error"),
							details: err.message,
							code: ERROR_CODES.notAllowed,
						});
					}
				}
			}

			// Encrypt sensitive access data
			access = connCtrl.encyrptSensitiveData(type, instance, access);
			if (accessReadOnly)
				accessReadOnly = connCtrl.encyrptSensitiveData(
					type,
					instance,
					accessReadOnly
				);

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
					managed,
					allowedRoles,
					config,
					access,
					accessReadOnly,
					telemetry: {
						status: managed ? "Creating" : "OK",
					},
					createdBy: user._id,
				},
				{ cacheKey: resourceId, session }
			);

			// If this is a managed resource then we need to create a new log entry
			if (managed) {
				let log = await resLogCtrl.create(
					{
						orgId: org._id,
						resourceId: resourceId,
						action: "create",
						status: "Creating",
						createdBy: user._id,
					},
					{ session }
				);
			}

			await resourceCtrl.commit(session);
			// Delete the sensitive data
			delete resourceObj.config;
			delete resourceObj.access;
			delete resourceObj.accessReadOnly;
			res.json(resourceObj);

			// Log action
			auditCtrl.logAndNotify(
				org._id,
				user,
				"org.resource",
				"create",
				t(
					managed
						? "Started creating new '%s' resource '%s' named '%s'"
						: "Added new '%s' resource '%s' named '%s'",
					type,
					instance,
					name
				),
				resourceObj,
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
	checkContentType,
	authSession,
	validateOrg,
	authorizeOrgAction("org.resource.view"),
	applyRules("get-resources"),
	validate,
	async (req, res) => {
		try {
			const { org } = req;
			const { page, size, search, type, instance, sortBy, sortDir, appId } =
				req.query;

			let query = { orgId: org._id };

			// App filter
			if (appId) query.appId = appId;

			// Search resource
			if (search && search !== "null")
				query.name = { $regex: search, $options: "i" };

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

			let sort = {};
			if (sortBy && sortDir) {
				sort[sortBy] = sortDir;
			} else sort = { createdAt: "desc" };

			let resources = await resourceCtrl.getManyByQuery(query, {
				sort,
				skip: size * page,
				limit: size,
			});

			res.json(
				resources.map((entry) => {
					// Delete the sensitive data
					delete entry.config;
					delete entry.access;
					delete entry.accessReadOnly;
					return entry;
				})
			);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/resource/:resourceId
@method     PUT
@desc       Update organization resource info (e.g., name and allowedRoles)
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
			let { name, allowedRoles } = req.body;

			// Admin should always be included in allowedRoles list
			if (!allowedRoles.includes("Admin")) allowedRoles.push("Admin");

			let updatedResource = await resourceCtrl.updateOneById(
				resource._id,
				{
					name,
					allowedRoles,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: resource._id, session }
			);

			await resourceCtrl.commit(session);
			// Delete the sensitive data
			delete updatedResource.config;
			delete updatedResource.access;
			delete updatedResource.accessReadOnly;
			res.json(updatedResource);

			// Log action
			auditCtrl.logAndNotify(
				org._id,
				user,
				"org.resource",
				"update",
				t(
					"Updated '%s' resource '%s' named '%s'",
					resource.type,
					resource.instance,
					name
				),
				updatedResource,
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
@desc       Update managed resource configuration
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

			if (!resource.managed) {
				await resourceCtrl.endSession(session);

				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"You can update the configuration parameters of a managed resource. The resource '%s' named '%s' is not a managed resource. You can only update access settings of an unmanaged resource.",
						resource.instance,
						resource.name
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// If the resouce is already under create, update or delete operations, then do not allow the new configuration update
			// unless the previous one is completed
			if (
				["Creating", "Updating", "Deleting"].includes(resource.telemetry.status)
			) {
				await resourceCtrl.endSession(session);

				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"The %s resource '%s' named '%s' is in '%s' status. You need to wait for the completion of the existing operation.",
						resource.instance,
						resource.name,
						resource.telemetry.status
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			let updatedResource = await resourceCtrl.updateOneById(
				resource._id,
				{
					config: req.body,
					telemetry: {
						status: "Updating",
						logs: "",
						updatedAt: Date.now(),
					},
					updatedBy: user._id,
				},
				{},
				{ cacheKey: resource._id, session }
			);

			// We also need to check here if the configuration parameters of the managed resource has changed or not
			let log = await resLogCtrl.create(
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
			// Delete the sensitive data
			delete updatedResource.config;
			delete updatedResource.access;
			delete updatedResource.accessReadOnly;
			res.json(updatedResource);

			// Log action
			auditCtrl.logAndNotify(
				org._id,
				user,
				"org.resource",
				"update",
				t(
					"Started updating '%s' resource named '%s'",
					resource.instance,
					resource.name
				),
				updatedResource,
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
@desc       Update resource access settings (for managed resources access settings needs to be configured at respective cloud service provider)
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
			let { access, accessReadonly } = req.body;

			// If the resouce is already under create, update or delete operations, then do not allow the new configuration update
			// unless the previous one is completed
			if (
				["Creating", "Updating", "Deleting"].includes(resource.telemetry.status)
			) {
				await resourceCtrl.endSession(session);

				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"The %s resource named '%s' is in '%s' status. You need to wait for the completion of the existing operation.",
						resource.instance,
						resource.name,
						resource.telemetry.status
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// If we try to configure access settings of a database connection then try to connect to the database
			if (type === "database") {
				try {
					// Test database connection
					await connCtrl.testDBConnection(instance, access);
					if (accessReadonly)
						await connCtrl.testDBConnection(instance, accessReadonly);
				} catch (err) {
					await resourceCtrl.endSession(session);

					return res.status(422).json({
						error: t("Connection Error"),
						details: err.message,
						code: ERROR_CODES.notAllowed,
					});
				}
			} else if (type === "engine") {
				try {
					// Test engine connection
					await connCtrl.testEngineConnection(access);
				} catch (err) {
					await resourceCtrl.endSession(session);

					return res.status(422).json({
						error: t("Connection Error"),
						details: err.message,
						code: ERROR_CODES.notAllowed,
					});
				}
			}

			// Encrypt sensitive access data
			access = connCtrl.encyrptSensitiveData(
				resource.type,
				resource.instance,
				access
			);

			if (accessReadonly)
				accessReadonly = connCtrl.encyrptSensitiveData(
					resource.type,
					resource.instance,
					accessReadonly
				);

			let updatedResource = await resourceCtrl.updateOneById(
				resource._id,
				{
					access,
					accessReadonly,
					updatedBy: user._id,
				},
				{},
				{ cacheKey: resource._id, session }
			);

			await resourceCtrl.commit(session);
			// Delete the sensitive data
			delete updatedResource.config;
			delete updatedResource.access;
			delete updatedResource.accessReadOnly;
			res.json(updatedResource);

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
				updatedResource,
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
@desc       Delete organization resource. Organization resouces can only be deleted if they are not used by any environment and are marked as deletable.
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

			if (resource.deletable === false) {
				await resourceCtrl.endSession(session);

				return res.status(422).json({
					error: t("Not Allowed"),
					details: t("Default Engine Cluster resource cannot be deleted."),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Check if this resource has been used by any environment
			let environments = await envCtrl.getManyByQuery({
				orgId: org._id,
				"mappings.resource.id": resource._id,
			});

			if (environments.length > 0) {
				await resourceCtrl.endSession(session);

				return res.status(422).json({
					error: t("Not Allowed"),
					details: t(
						"The %s resource named '%s' is being used by at least one environment of the organization '%s'. You cannot delete a resource that is used by an environment. First remove resource dependencies in environments and then delete the resource.",
						resource.instance,
						resource.name,
						org.name
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			if (resource.managed) {
				// Update resource data
				let updatedResource = await resourceCtrl.updateOneById(
					resource._id,
					{
						"telemetry.status": "Deleting",
						"telemetry.logs": "",
						"telemetry.updatedAt": Date.now(),
						updatedBy: user._id,
					},
					{},
					{ cacheKey: resource._id, session }
				);

				// Create resource logs entry, which will be updated when the operation is completed
				let log = await resLogCtrl.create(
					{
						orgId: org._id,
						resourceId: resource._id,
						action: "delete",
						status: "Deleting",
						createdBy: user._id,
					},
					{ session }
				);

				await resourceCtrl.commit(session);
				// Delete the sensitive data
				delete updatedResource.config;
				delete updatedResource.access;
				delete updatedResource.accessReadOnly;
				res.json(updatedResource);

				// Log action
				auditCtrl.logAndNotify(
					org._id,
					user,
					"org.resource",
					"delete",
					t(
						"Started deleting '%s' resource named '%s'",
						resource.instance,
						resource.name
					),
					updatedResource,
					{
						orgId: org._id,
						appId: updatedResource.appId,
						resourceId: resource._id,
					}
				);
			} else {
				await resourceCtrl.deleteOneById(resource._id, {
					cacheKey: resource._id,
					session,
				});

				await resourceCtrl.commit(session);
				res.json();

				// Log action
				auditCtrl.logAndNotify(
					org._id,
					user,
					"org.resource",
					"delete",
					t(
						"Deleted '%s' resource named '%s'",
						resource.instance,
						resource.name
					),
					{},
					{ orgId: org._id, appId: resource.appId, resourceId: resource._id }
				);
			}
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
	checkContentType,
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
					"mappings.resource.id": resource.id,
				},
				{
					lookup: "appId",
					projection: "+name",
				}
			);

			res.json(environments);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/org/:orgId/resource/:resourceId/log:/logId
@method     PUT
@desc       Update resource telemetry (e.g., status and status message) and resource log entry
@access     private
*/
router.put(
	"/:resourceId/log/:logId",
	checkContentType,
	authMasterToken,
	validateOrg,
	validateResource,
	validateResourceLog,
	applyLogRules("update"),
	validate,
	async (req, res) => {
		const session = await resourceCtrl.startSession();
		try {
			const { org, resource, log } = req;
			const { status, logs } = req.body;
			let timestamp = Date.now();

			// Get user information
			let user = await userCtrl.getOneById(log.createdBy, {
				cacheKey: log.createdBy,
			});

			// If the resource is successfully deleted then delete it and its logs from the database
			if (log.action === "delete" && status === "OK") {
				// Delete resource
				await resourceCtrl.deleteOneById(resource._id, {
					cacheKey: resource._id,
					session,
				});

				// Delete resource logs
				await resLogCtrl.deleteManyByQuery({
					orgId: org._id,
					resourceId: resource._id,
				});

				await resourceCtrl.commit(session);
				res.json();
			} else {
				/* If we have the resource access information then we should also update the access settings of the resource object
				 *
				 *
				 */
				let updatedResource = await resourceCtrl.updateOneById(
					resource._id,
					{
						"telemetry.status": status,
						"telemetry.logs": logs,
						"telemetry.updatedAt": timestamp,
						updatedBy: user._id,
					},
					{},
					{ cacheKey: resource._id, session }
				);

				await resLogCtrl.updateOneById(
					log._id,
					{
						status: status,
						logs: logs,
						updatedAt: timestamp,
					},
					{},
					{ session }
				);

				await resourceCtrl.commit(session);
				// Delete the sensitive data
				delete updatedResource.config;
				delete updatedResource.access;
				delete updatedResource.accessReadOnly;
				res.json(updatedResource);
			}

			// Log action
			auditCtrl.logAndNotify(
				org._id,
				user,
				"org.resource",
				log.action,
				t(
					status === "OK"
						? "Completed '%s' operation on '%s' resource named '%s' successfully"
						: "Completed '%s' operation on '%s' resource named '%s' with errors",
					log.action,
					resource.instance,
					resource.name
				),
				updatedResource,
				{ orgId: org._id, appId: resource.appId, resourceId: resource._id }
			);
		} catch (error) {
			await resourceCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

export default router;
