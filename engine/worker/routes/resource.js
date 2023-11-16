import express from "express";
import { authAccessToken } from "../middlewares/authAccessToken.js";
import { checkContentType } from "../middlewares/contentType.js";
import { manageResource } from "../init/queue.js";
import { ResourceManager } from "../handlers/resources/resourceManager.js";

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
        res.json();

        const { deploymentName, hpaName, replicas, minReplicas, maxReplicas } = req.body;
        let manager = new ResourceManager(null);
        await manager.updateDeployment(deploymentName, replicas);
        await manager.updateHPA(hpaName, minReplicas, maxReplicas);
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
        console.log("***here", req.body);
        res.json();

        const updates = req.body;
        let manager = new ResourceManager(null);
        for (const update of updates) {
            if (!update.apiServer) await manager.updateDeployment(update.deploymentName, null, update.image);
            else await manager.updateKnativeServiceImage(update.deploymentName, update.image);
        }
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

export default router;
