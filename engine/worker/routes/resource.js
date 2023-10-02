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

export default router;
