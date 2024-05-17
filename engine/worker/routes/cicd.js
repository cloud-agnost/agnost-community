import express from "express";
import { authAccessToken } from "../middlewares/authAccessToken.js";
import { checkContentType } from "../middlewares/contentType.js";
import { CICDManager } from "../handlers/cicd/CICDManager.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/cicd/enable
@method     POST
@desc       Enables the CI/CD for the cluster
@access     public
*/
router.post("/enable", checkContentType, authAccessToken, async (req, res) => {
    try {
        const cicdManager = new CICDManager();
        await cicdManager.enableCICDInfrastructure();
        res.json();
    } catch (error) {
        helper.handleError(req, res, error);
    }
});

/*
@route      /v1/cicd/enable
@method     POST
@desc       Disables the CI/CD for the cluster
@access     public
*/
router.post("/disable", checkContentType, authAccessToken, async (req, res) => {
    try {
        const cicdManager = new CICDManager();
        await cicdManager.disableCICDInfrastructure();
        res.json();
    } catch (error) {
        helper.handleError(req, res, error);
    }
});

/*
@route      /v1/cicd/env
@method     POST
@desc       Create the namespace of the environment
@access     public
*/
router.post("/env", checkContentType, authAccessToken, async (req, res) => {
    try {
        const cicdManager = new CICDManager();
        // The body of the request is and environment object
        const result = await cicdManager.createNamespace(req.body);
        res.status(result.status === "success" ? 200 : 400).json(result);
    } catch (error) {
        helper.handleError(req, res, error);
    }
});

/*
@route      /v1/cicd/env/delete
@method     POST
@desc       Deletes the namespaces of the environments
@access     public
*/
router.post("/env/delete", checkContentType, authAccessToken, async (req, res) => {
    try {
        const cicdManager = new CICDManager();
        // The body of the request is an array of namespace names (environment iids) that will be deleted
        const result = await cicdManager.deleteNamespaces(req.body);
        res.status(result.status === "success" ? 200 : 400).json(result);
    } catch (error) {
        helper.handleError(req, res, error);
    }
});

/*
@route      /v1/cicd/container
@method     POST
@desc       Manages the container deployment, update or deletion
@access     public
*/
router.post("/container", checkContentType, authAccessToken, async (req, res) => {
    try {
        const cicdManager = new CICDManager();
        // The body of the request is container and environment objects, changes and action type
        const result = await cicdManager.manageContainer(req.body);
        res.status(result.status === "success" ? 200 : 400).json(result);
    } catch (error) {
        helper.handleError(req, res, error);
    }
});

/*
@route      /v1/cicd/container/pods
@method     POST
@desc       Returns the pods of the container
@access     public
*/
router.post("/container/pods", checkContentType, authAccessToken, async (req, res) => {
    try {
        const cicdManager = new CICDManager();
        // The body of the request is container and environment objects
        const result = await cicdManager.getContainerPods(req.body);
        res.status(result.status === "success" ? 200 : 400).json(result);
    } catch (error) {
        helper.handleError(req, res, error);
    }
});

/*
@route      /v1/cicd/container/events
@method     POST
@desc       Returns the events of the container
@access     public
*/
router.post("/container/events", checkContentType, authAccessToken, async (req, res) => {
    try {
        const cicdManager = new CICDManager();
        // The body of the request is container and environment objects
        const result = await cicdManager.getContainerEvents(req.body);
        res.status(result.status === "success" ? 200 : 400).json(result);
    } catch (error) {
        helper.handleError(req, res, error);
    }
});

/*
@route      /v1/cicd/container/logs
@method     POST
@desc       Returns the logs of the container
@access     public
*/
router.post("/container/logs", checkContentType, authAccessToken, async (req, res) => {
    try {
        const cicdManager = new CICDManager();
        // The body of the request is container and environment objects
        const result = await cicdManager.getContainerLogs(req.body);
        res.status(result.status === "success" ? 200 : 400).json(result);
    } catch (error) {
        helper.handleError(req, res, error);
    }
});

export default router;
