import axios from "axios";
import express from "express";
import nodemailer from "nodemailer";
import userCtrl from "../controllers/user.js";
import clsCtrl from "../controllers/cluster.js";
import resourceCtrl from "../controllers/resource.js";
import cntrCtrl from "../controllers/container.js";
import { authMasterToken } from "../middlewares/authMasterToken.js";
import { authSession } from "../middlewares/authSession.js";
import { handleError } from "../schemas/platformError.js";
import { applyRules } from "../schemas/cluster.js";
import { validate } from "../middlewares/validate.js";
import { validateCluster } from "../middlewares/validateCluster.js";
import { validateClusterIPs } from "../middlewares/validateClusterIPs.js";
import { validateClusterResource } from "../middlewares/validateClusterResource.js";
import { checkContentType } from "../middlewares/contentType.js";
import { clusterComponents } from "../config/constants.js";
import { sendMessage } from "../init/sync.js";
import ERROR_CODES from "../config/errorCodes.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/cluster/setup-status
@method     GET
@desc       Returns true if cluster set-up is complete otherwiser returns false
@access     public
*/
router.get("/setup-status", async (req, res) => {
	try {
		// Get cluster owner
		let user = await userCtrl.getOneByQuery({ isClusterOwner: true });
		res.status(200).json({ status: user ? true : false });
	} catch (error) {
		handleError(req, res, error);
	}
});

/*
@route      /v1/cluster/smtp-status
@method     GET
@desc       Checks whether the cluster can send emails or not
@access     public
*/
router.get("/smtp-status", async (req, res) => {
	try {
		// Get cluster configuration
		let cluster = await clsCtrl.getOneByQuery({
			clusterAccesssToken: process.env.CLUSTER_ACCESS_TOKEN,
		});
		if (cluster?.smtp) {
			res.json({ status: true });
		} else res.json({ status: false });
	} catch (error) {
		handleError(req, res, error);
	}
});

/*
@route      /v1/cluster/info
@method     GET
@desc       Returns information about the cluster itself
@access     public
*/
router.get("/info", authSession, async (req, res) => {
	try {
		const { user } = req;
		if (!user.isClusterOwner) {
			return res.status(401).json({
				error: t("Not Authorized"),
				details: t(
					"You are not authorized to view cluster information. Only the cluster owner can view and manage cluster info."
				),
				code: ERROR_CODES.unauthorized,
			});
		}

		// Get cluster configuration
		let cluster = await clsCtrl.getOneByQuery({
			clusterAccesssToken: process.env.CLUSTER_ACCESS_TOKEN,
		});

		res.json({ ...cluster, smtp: helper.decryptSensitiveData(cluster.smtp) });
	} catch (error) {
		handleError(req, res, error);
	}
});

/*
@route      /v1/cluster/status
@method     GET
@desc       Returns information about the cluster deployments status information
@access     public
*/
router.get("/status", authSession, async (req, res) => {
	try {
		// Get cluster configuration
		let cluster = await clsCtrl.getOneByQuery({
			clusterAccesssToken: process.env.CLUSTER_ACCESS_TOKEN,
		});

		res.json(cluster.clusterResourceStatus);
	} catch (error) {
		handleError(req, res, error);
	}
});

/*
@route      /v1/cluster/release-info
@method     GET
@desc       Returns information about the current release of the cluster and the latest Agnost release
@access     public
*/
router.get("/release-info", authSession, async (req, res) => {
	try {
		// Get cluster configuration
		const cluster = await clsCtrl.getOneByQuery({
			clusterAccesssToken: process.env.CLUSTER_ACCESS_TOKEN,
		});

		if (!cluster.release) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t("Release information not found."),
				code: ERROR_CODES.notFound,
			});
		}

		const latest = await axios.get(
			"https://raw.githubusercontent.com/cloud-agnost/agnost-community/master/releases/latest.json",
			{
				headers: {
					Accept: "application/vnd.github.v3+json",
				},
			}
		);

		const current = await axios.get(
			`https://raw.githubusercontent.com/cloud-agnost/agnost-community/master/releases/${cluster.release}.json`,
			{
				headers: {
					Accept: "application/vnd.github.v3+json",
				},
			}
		);

		res.json({
			current: current.data,
			latest: latest.data,
			cluster: cluster,
		});
	} catch (error) {
		handleError(req, res, error);
	}
});

/*
@route      /v1/cluster/smtp
@method     GET
@desc       Returns the smtp configuration of the cluster object
@access     public
*/
router.get("/smtp", authMasterToken, async (req, res) => {
	try {
		// Get cluster configuration
		let cluster = await clsCtrl.getOneByQuery({
			clusterAccesssToken: process.env.CLUSTER_ACCESS_TOKEN,
		});
		if (cluster?.smtp) {
			res.json(helper.decryptSensitiveData(cluster.smtp));
		} else res.json();
	} catch (error) {
		handleError(req, res, error);
	}
});

/*
@route      /v1/cluster/smtp
@method     PUT
@desc       Updates the smtp configuration of the cluster object
@access     public
*/
router.put(
	"/smtp",
	checkContentType,
	authSession,
	applyRules("update-smtp"),
	validate,
	async (req, res) => {
		try {
			const { user } = req;

			if (!user.isClusterOwner) {
				return res.status(401).json({
					error: t("Not Authorized"),
					details: t(
						"You are not authorized to update cluster information. Only the cluster owner can view and manage cluster info."
					),
					code: ERROR_CODES.unauthorized,
				});
			}

			let transport = nodemailer.createTransport({
				host: req.body.host,
				port: req.body.port,
				secure: req.body.useTLS,
				auth: {
					user: req.body.user,
					pass: req.body.password,
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

			// Update cluster configuration
			let updatedCluster = await clsCtrl.updateOneByQuery(
				{
					clusterAccesssToken: process.env.CLUSTER_ACCESS_TOKEN,
				},
				{ smtp: helper.encyrptSensitiveData(req.body) }
			);

			res.json({ ...updatedCluster, smtp: req.body });
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/cluster/components
@method     GET
@desc       Returns information about the cluster components, core, engine, studio etc.
@access     public
*/
router.get("/components", authSession, async (req, res) => {
	try {
		const { user } = req;
		if (!user.isClusterOwner) {
			return res.status(401).json({
				error: t("Not Authorized"),
				details: t(
					"You are not authorized to view cluster components. Only the cluster owner can manage cluster core components."
				),
				code: ERROR_CODES.unauthorized,
			});
		}

		// Get cluster configuration
		const info = await axios.get(
			helper.getWorkerUrl() + "/v1/resource/cluster-info",
			{
				headers: {
					Authorization: process.env.ACCESS_TOKEN,
					"Content-Type": "application/json",
				},
			}
		);

		res.json(info.data);
	} catch (error) {
		handleError(req, res, error);
	}
});

/*
@route      /v1/cluster/components
@method     PUT
@desc       Updates a specific cluster component and its HPA
@access     public
*/
router.put(
	"/components",
	checkContentType,
	authSession,
	applyRules("update-component"),
	validate,
	async (req, res) => {
		try {
			const { user } = req;
			if (!user.isClusterOwner) {
				return res.status(401).json({
					error: t("Not Authorized"),
					details: t(
						"You are not authorized to manage cluster components. Only the cluster owner can manage cluster core components."
					),
					code: ERROR_CODES.unauthorized,
				});
			}

			const { deploymentName, hpaName } = req.body;
			const deploymentInfo = clusterComponents.find(
				(entry) => entry.deploymentName === deploymentName
			);

			if (deploymentInfo.hpaName !== hpaName) {
				return res.status(401).json({
					error: t("Not Allowed"),
					details: t(
						"The specified HPA name '%s' does not match with its deployment name '%s'.",
						hpaName,
						deploymentName
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			try {
				// Update cluster configuration. We are running this in catch since if engine-worker is upated the called worker can be terminated
				// resulting in socket hang up kind of errors
				await axios.post(
					helper.getWorkerUrl() + "/v1/resource/cluster-info",
					req.body,
					{
						headers: {
							Authorization: process.env.ACCESS_TOKEN,
							"Content-Type": "application/json",
						},
					}
				);
			} catch (err) {}

			res.json();
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/cluster/:componentName/update
@method     PUT
@desc       Updates a specific cluster component namely mongodb, rabbitmq-server, redis-master and minio-storage
@access     public
*/
router.put(
	"/:componentName/update",
	checkContentType,
	authSession,
	validateClusterResource,
	applyRules("update-config"),
	validate,
	async (req, res) => {
		try {
			const { user, resource, resInfo } = req;
			if (!user.isClusterOwner) {
				return res.status(401).json({
					error: t("Not Authorized"),
					details: t(
						"You are not authorized to manage cluster components. Only the cluster owner can manage cluster core components."
					),
					code: ERROR_CODES.unauthorized,
				});
			}

			// In case of database resource the size and other parameters (replicas/instances and version) need to be upated separately
			if (resource.type === "database") {
				if (req.body.updateType === "size") {
					req.body.config = { ...resource.config, size: req.body.config.size };
				} else {
					req.body.config = {
						...req.body.config.config,
						size: resource.config.size,
					};
				}
			}

			if (resource.instance === "Redis") {
				// Cluster redis does not have a read replica
				req.body.config.readReplica = false;
			}

			try {
				// Update cluster configuration. We are running this in catch since if engine-worker is upated the called worker can be terminated
				// resulting in socket hang up kind of errors
				await axios.post(
					helper.getWorkerUrl() + "/v1/resource/cluster-info-other",
					req.body,
					{
						headers: {
							Authorization: process.env.ACCESS_TOKEN,
							"Content-Type": "application/json",
						},
					}
				);
			} catch (err) {}

			res.json({ ...resInfo, config: req.body.config });
		} catch (error) {
			console.log(error);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/cluster/update-release
@method     PUT
@desc       Updates the version of cluster's default deployments to the versions' specified in the release
@access     public
*/
router.put(
	"/update-release",
	checkContentType,
	authSession,
	applyRules("update-version"),
	validate,
	async (req, res) => {
		try {
			const { user } = req;
			if (!user.isClusterOwner) {
				return res.status(401).json({
					error: t("Not Authorized"),
					details: t(
						"You are not authorized to update cluster release number. Only the cluster owner can manage cluster core components."
					),
					code: ERROR_CODES.unauthorized,
				});
			}

			// Get cluster configuration
			const cluster = await clsCtrl.getOneByQuery({
				clusterAccesssToken: process.env.CLUSTER_ACCESS_TOKEN,
			});

			const { release } = req.body;

			// If existing and new release are the same do nothing
			if (cluster.release === release) return res.json(cluster);

			let oldReleaseInfo = null;
			let newReleaseInfo = null;

			try {
				oldReleaseInfo = await axios.get(
					`https://raw.githubusercontent.com/cloud-agnost/agnost-community/master/releases/${cluster.release}.json`,
					{
						headers: {
							Accept: "application/vnd.github.v3+json",
						},
					}
				);
			} catch (err) {
				return res.status(404).json({
					error: t("Not Found"),
					details: t("There is no such Agnost release '%s'.", cluster.release),
					code: ERROR_CODES.notFound,
				});
			}

			try {
				newReleaseInfo = await axios.get(
					`https://raw.githubusercontent.com/cloud-agnost/agnost-community/master/releases/${release}.json`,
					{
						headers: {
							Accept: "application/vnd.github.v3+json",
						},
					}
				);
			} catch (err) {
				return res.status(404).json({
					error: t("Not Found"),
					details: t("There is no such Agnost release '%s'.", release),
					code: ERROR_CODES.notFound,
				});
			}

			// Indetify the deployments whose release number has changed
			let apiServersNeedUpdate = false;
			const requiredUpdates = [];
			for (const [key, value] of Object.entries(oldReleaseInfo.data.modules)) {
				if (value !== newReleaseInfo.data.modules[key]) {
					const entry = {
						deploymentName: `${key}-deployment`,
						tag: newReleaseInfo.data.modules[key],
						image: `gcr.io/agnost-community/${key.replace("-", "/")}:${
							newReleaseInfo.data.modules[key]
						}`,
						apiServer: false,
					};

					if (key === "engine-core") {
						apiServersNeedUpdate = true;
						continue;
					}

					requiredUpdates.push(entry);
				}
			}

			// If api servers need update then fetch all api servers from the database
			if (apiServersNeedUpdate) {
				const newVersion = newReleaseInfo.data.modules["engine-core"];
				const apiServers = await resourceCtrl.getManyByQuery({
					instance: "API Server",
				});

				for (const apiServer of apiServers) {
					requiredUpdates.push({
						deploymentName: apiServer.iid,
						tag: newVersion,
						image: `gcr.io/agnost-community/engine/core:${newVersion}`,
						apiServer: true,
					});
				}
			}

			// If no updates do nothing
			if (requiredUpdates.length === 0) return res.json(cluster);

			// Update cluster default deployment image tags - version change
			await axios.post(
				helper.getWorkerUrl() + "/v1/resource/cluster-versions",
				requiredUpdates,
				{
					headers: {
						Authorization: process.env.ACCESS_TOKEN,
						"Content-Type": "application/json",
					},
				}
			);

			// Update cluster release information
			let updatedCluster = await clsCtrl.updateOneByQuery(
				{
					clusterAccesssToken: process.env.CLUSTER_ACCESS_TOKEN,
				},
				{
					release: release,
					releaseHistory: [...cluster.releaseHistory, { release: release }],
				}
			);

			res.json(updatedCluster);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/cluster/update-status
@method     POST
@desc       Updates the status of cluster's default deployments
@access     public
*/
router.post(
	"/update-status",
	checkContentType,
	authMasterToken,
	async (req, res) => {
		try {
			// Update cluster configuration
			await clsCtrl.updateOneByQuery(
				{
					clusterAccesssToken: process.env.CLUSTER_ACCESS_TOKEN,
				},
				{ clusterResourceStatus: req.body }
			);

			res.json();

			// Send realtime notification message that cluster deployment status has changed
			sendMessage("cluster", {
				action: "update",
				object: "cluster",
				description: t("Status of cluster defaul deployments has changed"),
				timestamp: Date.now(),
				data: req.body,
			});
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/cluster/domain-status
@method     GET
@desc       Returns information whetehr custom domains can be added to the cluster or not
@access     public
*/
router.get(
	"/domain-status",
	authSession,
	validateCluster,
	validateClusterIPs,
	async (req, res) => {
		try {
			res.json();
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/cluster/domains
@method     POST
@desc       Adds a custom domain to the cluster
@access     public
*/
router.post(
	"/domains",
	checkContentType,
	authSession,
	validateCluster,
	validateClusterIPs,
	applyRules("add-domain"),
	validate,
	async (req, res) => {
		try {
			const { user, cluster } = req;
			if (!user.isClusterOwner) {
				return res.status(401).json({
					error: t("Not Authorized"),
					details: t(
						"You are not authorized to add custom domain to the cluster. Only the cluster owner can manage cluster custom domains."
					),
					code: ERROR_CODES.unauthorized,
				});
			}

			const domains = cluster.domains ?? [];
			const { domain } = req.body;

			if (domains.length >= config.get("general.maxClusterCustomDomains")) {
				return res.status(401).json({
					error: t("Not Allowed"),
					details: t(
						"You can add maximum '%s' custom domains to a cluster.",
						config.get("general.maxClusterCustomDomains")
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Get all ingresses that will be impacted
			const apiServers = await resourceCtrl.getManyByQuery({
				instance: "API Server",
			});

			const ingresses = [
				"engine-realtime-ingress",
				"platform-core-ingress",
				"platform-sync-ingress",
				"studio-ingress",
				...apiServers.map((entry) => `${entry.iid}-ingress`),
			];

			// Get all container ingresses that will be impacted
			const containers = await cntrCtrl.getManyByQuery(
				{
					"networking.ingress.enabled": true,
				},
				{ lookup: "environmentId" }
			);

			containers = containers.map((entry) => {
				return {
					containeriid: entry.iid,
					namespace: entry.environmentId.iid,
					containerPort: entry.networking.containerPort,
				};
			});

			// Update ingresses
			await axios.post(
				helper.getWorkerUrl() + "/v1/resource/cluster-domains-add",
				{
					domain,
					ingresses,
					enforceSSLAccess: cluster.enforceSSLAccess ?? false,
					container: false,
					containers,
				},
				{
					headers: {
						Authorization: process.env.ACCESS_TOKEN,
						"Content-Type": "application/json",
					},
				}
			);

			// Update cluster domains information
			let updatedCluster = await clsCtrl.updateOneById(cluster._id, {
				domains: [...domains, domain],
			});

			res.json(updatedCluster);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/cluster/domains
@method     DELETE
@desc       Removes a custom domain from the cluster
@access     public
*/
router.delete(
	"/domains",
	checkContentType,
	authSession,
	validateCluster,
	applyRules("delete-domain"),
	validate,
	async (req, res) => {
		try {
			const { user, cluster } = req;
			if (!user.isClusterOwner) {
				return res.status(401).json({
					error: t("Not Authorized"),
					details: t(
						"You are not authorized to manage custom domains of the cluster. Only the cluster owner can manage cluster custom domains."
					),
					code: ERROR_CODES.unauthorized,
				});
			}

			const domains = cluster.domains ?? [];
			const { domain } = req.body;

			// Get all ingresses that will be impacted
			const apiServers = await resourceCtrl.getManyByQuery({
				instance: "API Server",
			});

			const ingresses = [
				"engine-realtime-ingress",
				"platform-core-ingress",
				"platform-sync-ingress",
				"studio-ingress",
				...apiServers.map((entry) => `${entry.iid}-ingress`),
			];

			// Get all container ingresses that will be impacted
			const containers = await cntrCtrl.getManyByQuery(
				{
					"networking.ingress.enabled": true,
				},
				{ lookup: "environmentId" }
			);

			containers = containers.map((entry) => {
				return { containeriid: entry.iid, namespace: entry.environmentId.iid };
			});

			// Update ingresses
			await axios.post(
				helper.getWorkerUrl() + "/v1/resource/cluster-domains-delete",
				{
					domain,
					ingresses,
					container: false,
					containers,
				},
				{
					headers: {
						Authorization: process.env.ACCESS_TOKEN,
						"Content-Type": "application/json",
					},
				}
			);

			// Update cluster domains information
			const updatedList = domains.filter((entry) => entry !== domain);

			// Update cluster domains information
			let updatedCluster = await clsCtrl.updateOneByQuery(
				{
					clusterAccesssToken: process.env.CLUSTER_ACCESS_TOKEN,
				},
				{
					domains: updatedList,
					// If there are no domains then we need to make sure the cluster is accessible via non-ssl
					enforceSSLAccess:
						updatedList.length === 0 ? false : cluster.enforceSSLAccess,
				}
			);

			res.json(updatedCluster);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/cluster/domains
@method     GET
@desc       Returns the list of cluster domains
@access     public
*/
router.get("/domains", authMasterToken, async (req, res) => {
	try {
		// Get the cluster object
		const cluster = await clsCtrl.getOneByQuery({
			clusterAccesssToken: process.env.CLUSTER_ACCESS_TOKEN,
		});

		if (cluster?.domains) res.json(cluster?.domains);
		else res.json([]);
	} catch (error) {
		handleError(req, res, error);
	}
});

/*
@route      /v1/cluster/domains/enforce-ssl
@method     PUT
@desc       Turns on or off enforce ssl access to the cluster
@access     public
*/
router.put(
	"/domains/enforce-ssl",
	checkContentType,
	authSession,
	validateCluster,
	applyRules("update-enforce-ssl"),
	validate,
	async (req, res) => {
		try {
			const { user, cluster } = req;
			if (!user.isClusterOwner) {
				return res.status(401).json({
					error: t("Not Authorized"),
					details: t(
						"You are not authorized to manage cluster SSL access settings. Only the cluster owner can manage cluster access settings."
					),
					code: ERROR_CODES.unauthorized,
				});
			}

			const { enforceSSLAccess } = req.body;

			if (enforceSSLAccess && cluster.domains.length === 0) {
				return res.status(401).json({
					error: t("Not Allowed"),
					details: t(
						"You can enforce SSL access to your cluster only if you have a least one domain added to the custom domains list."
					),
					code: ERROR_CODES.notAllowed,
				});
			}

			// Get all ingresses that will be impacted
			const apiServers = await resourceCtrl.getManyByQuery({
				instance: "API Server",
			});

			const ingresses = [
				"engine-realtime-ingress",
				"platform-core-ingress",
				"platform-sync-ingress",
				"studio-ingress",
				...apiServers.map((entry) => `${entry.iid}-ingress`),
				...apiServers.map((entry) => `${entry.iid}-container-ingress`),
			];

			// Get all container ingresses that will be impacted
			const containers = await cntrCtrl.getManyByQuery(
				{
					$or: [
						{ "networking.ingress.enabled": true },
						{ "networking.customDomain.enabled": true },
					],
				},
				{ lookup: "environmentId" }
			);

			containers = containers.map((entry) => {
				return {
					containeriid: entry.iid,
					namespace: entry.environmentId.iid,
					ingress: entry.networking.ingress.enabled,
					customDomain: entry.networking.customDomain.enabled,
				};
			});

			// Update ingresses
			await axios.post(
				helper.getWorkerUrl() + "/v1/resource/cluster-enforce-ssl",
				{ enforceSSLAccess, ingresses, containers },
				{
					headers: {
						Authorization: process.env.ACCESS_TOKEN,
						"Content-Type": "application/json",
					},
				}
			);

			// Update cluster SSL access information
			let updatedCluster = await clsCtrl.updateOneById(cluster._id, {
				enforceSSLAccess,
			});

			res.json(updatedCluster);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/cluster/cicd/enable
@method     POST
@desc       Enables the CI/CD pipeline for the cluster
@access     public
*/
router.post(
	"/cicd/enable",
	checkContentType,
	authSession,
	validateCluster,
	async (req, res) => {
		try {
			const { user, cluster } = req;
			if (!user.isClusterOwner) {
				return res.status(401).json({
					error: t("Not Authorized"),
					details: t(
						"You are not authorized to manage CI/CD pipeline for the cluster. Only the cluster owner can enable/disabled cluster CI/CD pipeline infrastructure."
					),
					code: ERROR_CODES.unauthorized,
				});
			}

			// If cicd is already enabled then do nothing
			if (cluster.cicdEnabled) {
				return res.json({
					...cluster,
					smtp: helper.decryptSensitiveData(cluster.smtp),
				});
			}

			await axios.post(
				helper.getWorkerUrl() + "/v1/cicd/enable",
				{},
				{
					headers: {
						Authorization: process.env.ACCESS_TOKEN,
						"Content-Type": "application/json",
					},
				}
			);

			// Update cluster configuration
			let updatedCluster = await clsCtrl.updateOneByQuery(
				{
					clusterAccesssToken: process.env.CLUSTER_ACCESS_TOKEN,
				},
				{ cicdEnabled: true }
			);

			res.json({
				...updatedCluster,
				smtp: helper.decryptSensitiveData(updatedCluster.smtp),
			});
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/cluster/cicd/disable
@method     POST
@desc       Disables the CI/CD pipeline for the cluster
@access     public
*/
router.post(
	"/cicd/disable",
	checkContentType,
	authSession,
	validateCluster,
	async (req, res) => {
		try {
			const { user, cluster } = req;
			if (!user.isClusterOwner) {
				return res.status(401).json({
					error: t("Not Authorized"),
					details: t(
						"You are not authorized to manage CI/CD pipeline for the cluster. Only the cluster owner can enable/disabled cluster CI/CD pipeline infrastructure."
					),
					code: ERROR_CODES.unauthorized,
				});
			}

			// If cicd is already disabled then do nothing
			if (!cluster.cicdEnabled) {
				return res.json({
					...cluster,
					smtp: helper.decryptSensitiveData(cluster.smtp),
				});
			}

			await axios.post(
				helper.getWorkerUrl() + "/v1/cicd/disable",
				{},
				{
					headers: {
						Authorization: process.env.ACCESS_TOKEN,
						"Content-Type": "application/json",
					},
				}
			);

			// Update cluster configuration
			let updatedCluster = await clsCtrl.updateOneByQuery(
				{
					clusterAccesssToken: process.env.CLUSTER_ACCESS_TOKEN,
				},
				{ cicdEnabled: false }
			);

			res.json({
				...updatedCluster,
				smtp: helper.decryptSensitiveData(updatedCluster.smtp),
			});
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

export default router;
