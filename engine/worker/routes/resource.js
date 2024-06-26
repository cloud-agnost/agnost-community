import express from "express";
import { authAccessToken } from "../middlewares/authAccessToken.js";
import { checkContentType } from "../middlewares/contentType.js";
import { manageResource } from "../init/queue.js";
import { ResourceManager } from "../handlers/resources/resourceManager.js";
import {
    addClusterCustomDomain,
    deleteClusterCustomDomains,
    updateEnforceSSLAccessSettings,
} from "../handlers/cicd/CICDManager.js";

const router = express.Router({ mergeParams: true });

/*
@route      /resource/manage
@method     POST
@desc       Creates a new resource in Agnost cluster
@access     public
*/
router.post("/manage", checkContentType, authAccessToken, async (req, res) => {
    try {
        if (req.body && Array.isArray(req.body)) {
            for (let i = 0; i < req.body.length; i++) {
                const resource = req.body[i];
                manageResource(resource);
            }
        }
        res.json();
    } catch (error) {
        helper.handleError(req, res, error);
    }
});

/*
@route      /resource/cluster-info
@method     GET
@desc       Get information about the currently running cluster resources
@access     public
*/
router.get("/cluster-info", authAccessToken, async (req, res) => {
    try {
        let manager = new ResourceManager(null);
        const clusterInfo = await manager.getClusterInfo();

        res.json(clusterInfo);
    } catch (error) {
        helper.handleError(req, res, error);
    }
});

/*
@route      /resource/cluster-info
@method     POST
@desc       Updates the cluster component settings (configured replicas, HPA min-max replicas)
@access     public
*/
router.post("/cluster-info", checkContentType, authAccessToken, async (req, res) => {
    try {
        const { deploymentName, hpaName, replicas, minReplicas, maxReplicas } = req.body;
        let manager = new ResourceManager(null);
        await manager.updateDeployment(deploymentName, replicas);
        await manager.updateHPA(hpaName, minReplicas, maxReplicas);

        res.json();
    } catch (error) {
        helper.handleError(req, res, error);
    }
});

/*
@route      /resource/cluster-info-other
@method     POST
@desc       Updates the other cluster component settings (mpongodb, redis, minio, rabbitmq)
@access     public
*/
router.post("/cluster-info-other", checkContentType, authAccessToken, async (req, res) => {
    try {
        const { name, instance, config } = req.body;
        let manager = new ResourceManager(null);
        await manager.updateClusterOtherResource(name, instance, config);

        res.json();
    } catch (error) {
        helper.handleError(req, res, error);
    }
});

/*
@route      /resource/cluster-versions
@method     POST
@desc       Updates the version of cluster's default deployments and if specified the API server versions
@access     public
*/
router.post("/cluster-versions", checkContentType, authAccessToken, async (req, res) => {
    try {
        const updates = req.body;
        let manager = new ResourceManager(null);
        for (const update of updates) {
            if (!update.apiServer) await manager.updateDeployment(update.deploymentName, null, update.image);
            else await manager.updateKnativeServiceImage(update.deploymentName, update.image);
        }

        res.json();
    } catch (error) {
        helper.handleError(req, res, error);
    }
});

/*
@route      /resource/apiserver/:envId
@method     GET
@desc       Get information about the version's API server
@access     public
*/
router.get("/apiserver/:envId", authAccessToken, async (req, res) => {
    try {
        const { envId } = req.params;
        let manager = new ResourceManager(null);
        const apiServerInfo = await manager.getAPIServerInfo(envId);

        res.json(apiServerInfo);
    } catch (error) {
        helper.handleError(req, res, error);
    }
});

/*
@route      /resource/cluster-ip
@method     GET
@desc       Returns the cluster IP addresses
@access     public
*/
router.get("/cluster-ip", authAccessToken, async (req, res) => {
    try {
        let manager = new ResourceManager(null);
        const ips = await manager.getClusterIPAddresses();

        res.json(ips);
    } catch (error) {
        helper.handleError(req, res, error);
    }
});

/*
@route      /resource/cluster-domains-add
@method     POST
@desc       Adds a new cluster custom domain
@access     public
*/
router.post("/cluster-domains-add", checkContentType, authAccessToken, async (req, res) => {
    try {
        const { domain, ingresses, enforceSSLAccess, container, containeriid, containers } = req.body;
        let manager = new ResourceManager(null);
        await manager.initializeCertificateIssuer();
        const secretName = helper.getCertSecretName();
        for (const ingress of ingresses) {
            await manager.addClusterCustomDomain(
                ingress,
                domain,
                secretName,
                enforceSSLAccess,
                container,
                containeriid
            );
        }

        if (containers?.length > 0) {
            for (const entry of containers) {
                await addClusterCustomDomain(
                    entry.containeriid,
                    entry.namespace,
                    domain,
                    entry.containerPort,
                    enforceSSLAccess
                );
            }
        }

        res.json();
    } catch (error) {
        helper.handleError(req, res, error);
    }
});

/*
@route      /resource/cluster-domains-delete
@method     POST
@desc       Deletes a cluster custom domain
@access     public
*/
router.post("/cluster-domains-delete", checkContentType, authAccessToken, async (req, res) => {
    try {
        const { domain, ingresses, containers } = req.body;
        const domains = Array.isArray(domain) ? domain : [domain];

        let manager = new ResourceManager(null);
        for (const ingress of ingresses) {
            await manager.deleteClusterCustomDomains(ingress, domains);
        }

        if (containers?.length > 0) {
            for (const entry of containers) {
                await deleteClusterCustomDomains(entry.containeriid, entry.namespace, domains);
            }
        }

        res.json();
    } catch (error) {
        helper.handleError(req, res, error);
    }
});

/*
@route      /resource/cluster-enforce-ssl
@method     POST
@desc       Turns on or off enforce-ssl access to the cluster
@access     public
*/
router.post("/cluster-enforce-ssl", checkContentType, authAccessToken, async (req, res) => {
    try {
        const { enforceSSLAccess, ingresses, containers } = req.body;
        let manager = new ResourceManager(null);
        await manager.initializeCertificateIssuer();
        for (const ingress of ingresses) {
            await manager.updateEnforceSSLAccessSettings(ingress, enforceSSLAccess);
        }

        if (containers?.length > 0) {
            for (const entry of containers) {
                if (entry.ingress)
                    await updateEnforceSSLAccessSettings(
                        `${entry.containeriid}-cluster`,
                        entry.namespace,
                        enforceSSLAccess
                    );

                if (entry.customDomain)
                    await updateEnforceSSLAccessSettings(
                        `${entry.containeriid}-domain`,
                        entry.namespace,
                        enforceSSLAccess
                    );
            }
        }

        res.json();
    } catch (error) {
        helper.handleError(req, res, error);
    }
});

/*
@route      /resource/mysql-operator-restart
@method     POST
@desc       Restarts the mysql-operator
@access     public
*/
router.post("/mysql-operator-restart", checkContentType, authAccessToken, async (req, res) => {
    try {
        res.json();

        let manager = new ResourceManager(null);
        await manager.restartMySQLOperator();
    } catch (error) {
        helper.handleError(req, res, error);
    }
});

export default router;
