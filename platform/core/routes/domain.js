import axios from "axios";
import express from "express";
import auditCtrl from "../controllers/audit.js";
import dmnCtrl from "../controllers/domain.js";
import envCtrl from "../controllers/environment.js";
import { authSession } from "../middlewares/authSession.js";
import { authMasterToken } from "../middlewares/authMasterToken.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validateCluster } from "../middlewares/validateCluster.js";
import { validateClusterIPs } from "../middlewares/validateClusterIPs.js";
import { validateOrg } from "../middlewares/validateOrg.js";
import { validateApp } from "../middlewares/validateApp.js";
import { validateVersion } from "../middlewares/validateVersion.js";
import { validateDomain } from "../middlewares/validateDomain.js";
import { authorizeAppAction } from "../middlewares/authorizeAppAction.js";
import { applyRules } from "../schemas/domain.js";
import { validate } from "../middlewares/validate.js";
import { handleError } from "../schemas/platformError.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/domain?page=0&size=10&search=&sortBy=email&sortDir=asc&start&end
@method     GET
@desc       Get custom domains of the app version.
@access     private
*/
router.get(
	"/",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.domain.view"),
	applyRules("view"),
	validate,
	async (req, res) => {
		try {
			const { version } = req;
			const { page, size, search, sortBy, sortDir, start, end } = req.query;

			let query = { versionId: version._id };
			if (search) {
				query.domain = { $regex: search, $options: "i" };
			}
			if (start && !end) query.createdAt = { $gte: start };
			else if (!start && end) query.createdAt = { $lte: end };
			else if (start && end) query.createdAt = { $gte: start, $lte: end };

			let sort = {};
			if (sortBy && sortDir) {
				sort[sortBy] = sortDir;
			} else sort = { createdAt: "desc" };

			let domains = await dmnCtrl.getManyByQuery(query, {
				sort,
				skip: size * page,
				limit: size,
			});

			res.json(domains);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/domain
@method     POST
@desc       Creates a new custom domain for the app version
@access     private
*/
router.post(
	"/",
	checkContentType,
	authSession,
	validateCluster,
	validateClusterIPs,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.domain.create"),
	applyRules("create"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version, cluster } = req;
			const { domain } = req.body;

			// Create the domain entry
			let domainId = helper.generateId();
			let domainiid = helper.generateSlug("dmn");

			// Get the environment of the app version
			const env = await envCtrl.getOneByQuery({ versionId: version._id });
			// Update ingresses
			await axios.post(
				config.get("general.workerUrl") + "/v1/resource/cluster-domains-add",
				{
					domain,
					ingresses: [`${env.iid}-container-ingress`],
					enforceSSLAccess: cluster.enforceSSLAccess ?? false,
					container: true,
					containeriid: env.iid,
				},
				{
					headers: {
						Authorization: process.env.ACCESS_TOKEN,
						"Content-Type": "application/json",
					},
				}
			);

			let domainObj = await dmnCtrl.create(
				{
					_id: domainId,
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					iid: domainiid,
					domain,
					createdBy: user._id,
				},
				{ cacheKey: domainId }
			);

			res.json(domainObj);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.domain",
				"create",
				t("Added a new custom domain '%s'", domain),
				domainObj,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					domainId: domainObj._id,
				}
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/domain/sse
@method     POST
@desc       Creates a new custom domain for the app version (called from the server side library)
@access     private
*/
router.post(
	"/sse",
	checkContentType,
	authMasterToken,
	validateCluster,
	validateClusterIPs,
	validateOrg,
	validateApp,
	validateVersion,
	applyRules("create"),
	validate,
	async (req, res) => {
		try {
			const { org, app, version, cluster } = req;
			const { domain } = req.body;

			// Create the domain entry
			let domainId = helper.generateId();
			let domainiid = helper.generateSlug("dmn");

			// Get the environment of the app version
			const env = await envCtrl.getOneByQuery({ versionId: version._id });
			// Update ingresses
			await axios.post(
				config.get("general.workerUrl") + "/v1/resource/cluster-domains-add",
				{
					domain,
					ingresses: [`${env.iid}-container-ingress`],
					enforceSSLAccess: cluster.enforceSSLAccess ?? false,
					container: true,
					containeriid: env.iid,
				},
				{
					headers: {
						Authorization: process.env.ACCESS_TOKEN,
						"Content-Type": "application/json",
					},
				}
			);

			let domainObj = await dmnCtrl.create(
				{
					_id: domainId,
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					iid: domainiid,
					domain,
					createdBy: user._id,
				},
				{ cacheKey: domainId }
			);

			res.json({ domain: domain, id: domainObj._id });

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				{},
				"org.app.version.domain",
				"create",
				t("Added a new custom domain '%s'", domain),
				domainObj,
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					domainId: domainObj._id,
				}
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/domain/delete-multi
@method     DELETE
@desc       Deletes multiple custom domains
@access     private
*/
router.delete(
	"/delete-multi",
	checkContentType,
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	authorizeAppAction("app.version.domain.delete"),
	applyRules("delete-multi"),
	validate,
	async (req, res) => {
		try {
			const { org, user, app, version } = req;
			const { domainIds } = req.body;

			// Get the list of domains that will be deleted
			let domains = await dmnCtrl.getManyByQuery({
				_id: { $in: domainIds },
				versionId: version._id,
			});

			if (domains.length === 0) return res.json();

			// Get the environment of the app version
			const env = await envCtrl.getOneByQuery({ versionId: version._id });
			// Update ingresses
			await axios.post(
				config.get("general.workerUrl") + "/v1/resource/cluster-domains-delete",
				{
					domain: domains.map((entry) => entry.domain),
					ingresses: [`${env.iid}-container-ingress`],
					container: true,
					containeriid: env.iid,
				},
				{
					headers: {
						Authorization: process.env.ACCESS_TOKEN,
						"Content-Type": "application/json",
					},
				}
			);

			// Delete the domains
			let ids = domains.map((entry) => entry._id);
			await dmnCtrl.deleteManyByQuery({ _id: { $in: ids } }, { cacheKey: ids });

			res.json();

			domains.forEach((entry) => {
				// Log action
				auditCtrl.logAndNotify(
					version._id,
					user,
					"org.app.version.domain",
					"delete",
					t("Removed custom domain '%s'", entry.domain),
					{},
					{
						orgId: org._id,
						appId: app._id,
						versionId: version._id,
						domainId: entry._id,
					}
				);
			});
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/domain/:domainId
@method     DELETE
@desc       Removes a specific domain
@access     private
*/
router.delete(
	"/:domainId",
	authSession,
	validateOrg,
	validateApp,
	validateVersion,
	validateDomain,
	authorizeAppAction("app.version.domain.delete"),
	async (req, res) => {
		try {
			const { org, user, app, version, domain } = req;

			// Get the environment of the app version
			const env = await envCtrl.getOneByQuery({ versionId: version._id });
			// Update ingresses
			await axios.post(
				config.get("general.workerUrl") + "/v1/resource/cluster-domains-delete",
				{
					domain: domain.domain,
					ingresses: [`${env.iid}-container-ingress`],
					container: true,
					containeriid: env.iid,
				},
				{
					headers: {
						Authorization: process.env.ACCESS_TOKEN,
						"Content-Type": "application/json",
					},
				}
			);

			// Delete the domain
			await dmnCtrl.deleteOneById(domain._id, {
				cacheKey: domain._id,
			});

			res.json();

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.domain",
				"delete",
				t("Removed custom domain '%s'", domain.domain),
				{},
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					domainId: domain._id,
				}
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/domain/:domainId/sse
@method     DELETE
@desc       Removes a specific domain (called from the server side library)
@access     private
*/
router.delete(
	"/:domainId/sse",
	authMasterToken,
	validateOrg,
	validateApp,
	validateVersion,
	validateDomain,
	async (req, res) => {
		try {
			const { org, app, version, domain } = req;

			// Get the environment of the app version
			const env = await envCtrl.getOneByQuery({ versionId: version._id });
			// Update ingresses
			await axios.post(
				config.get("general.workerUrl") + "/v1/resource/cluster-domains-delete",
				{
					domain: domain.domain,
					ingresses: [`${env.iid}-container-ingress`],
					container: true,
					containeriid: env.iid,
				},
				{
					headers: {
						Authorization: process.env.ACCESS_TOKEN,
						"Content-Type": "application/json",
					},
				}
			);

			// Delete the domain
			await dmnCtrl.deleteOneById(domain._id, {
				cacheKey: domain._id,
			});

			res.json();

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				{},
				"org.app.version.domain",
				"delete",
				t("Removed custom domain '%s'", domain.domain),
				{},
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					domainId: domain._id,
				}
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/app/:appId/version/:versionId/domain/delete/sse
@method     POST
@desc       Removes a domain specified by its URL (called from the server side library)
@access     private
*/
router.post(
	"/delete/sse",
	authMasterToken,
	validateOrg,
	validateApp,
	validateVersion,
	applyRules("delete-sse"),
	validate,
	async (req, res) => {
		try {
			const { org, app, version, domain } = req;

			// Get the environment of the app version
			const env = await envCtrl.getOneByQuery({ versionId: version._id });
			// Update ingresses
			await axios.post(
				config.get("general.workerUrl") + "/v1/resource/cluster-domains-delete",
				{
					domain: domain.domain,
					ingresses: [`${env.iid}-container-ingress`],
					container: true,
					containeriid: env.iid,
				},
				{
					headers: {
						Authorization: process.env.ACCESS_TOKEN,
						"Content-Type": "application/json",
					},
				}
			);

			// Delete the domain
			await dmnCtrl.deleteOneById(domain._id, {
				cacheKey: domain._id,
			});

			res.json();

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				{},
				"org.app.version.domain",
				"delete",
				t("Removed custom domain '%s'", domain.domain),
				{},
				{
					orgId: org._id,
					appId: app._id,
					versionId: version._id,
					domainId: domain._id,
				}
			);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

export default router;
