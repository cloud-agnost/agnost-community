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

export default router;
