import express from "express";
import { authAccessToken } from "../middlewares/authAccessToken.js";
import { checkContentType } from "../middlewares/contentType.js";
import { applyRules } from "../validation/domain.js";
import { validate } from "../middlewares/validate.js";
import { ResourceManager } from "../handlers/resources/resourceManager.js";

const router = express.Router({ mergeParams: true });

/*
@route      /domain
@method     POST
@desc       Creates an ingress for the custom domain
@access     public
*/
router.post("/", checkContentType, authAccessToken, applyRules("create"), validate, async (req, res) => {
    try {
        const { name, domain, service, port } = req.body;
        let manager = new ResourceManager(null);
        await manager.createCustomDomainIngress(name, domain, service, port);

        res.json();
    } catch (error) {
        helper.handleError(req, res, error);
    }
});

/*
@route      /domain
@method     DELETE
@desc       Deletes the ingress for the custom domain
@access     public
*/
router.posdeletet("/", checkContentType, authAccessToken, applyRules("delete"), validate, async (req, res) => {
    try {
        const { name } = req.body;
        let manager = new ResourceManager(null);
        await manager.deleteCustomDomainIngress(name);

        res.json();
    } catch (error) {
        helper.handleError(req, res, error);
    }
});
