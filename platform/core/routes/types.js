import express from "express";
import { authSession } from "../middlewares/authSession.js";
import { checkContentType } from "../middlewares/contentType.js";
import {
	orgRoles,
	appRoles,
	bvlTypes,
	fieldTypes,
	databaseTypes,
	resourceTypes,
	instanceTypes,
	phoneAuthSMSProviders,
	oAuthProviderTypes,
	authUserDataModel,
} from "../config/constants.js";

const router = express.Router({ mergeParams: true });

/*
@route      /all
@method     GET
@desc       Returns all types used in the platform
@access     public
*/
router.get("/all", checkContentType, authSession, (req, res) => {
	res.json({
		orgRoles,
		appRoles,
		bvlTypes,
		fieldTypes,
		databaseTypes,
		resourceTypes,
		instanceTypes,
		phoneAuthSMSProviders,
		oAuthProviderTypes,
		authUserDataModel,
	});
});

/*
@route      /bvl
@method     GET
@desc       Returns the list of basic values list types
@access     public
*/
router.get("/bvl", checkContentType, authSession, (req, res) => {
	res.json(bvlTypes);
});

/*
@route      /field
@method     GET
@desc       Returns the list of database field types
@access     public
*/
router.get("/field", checkContentType, authSession, (req, res) => {
	res.json(fieldTypes);
});

/*
@route      /db
@method     GET
@desc       Returns the list of database types
@access     public
*/
router.get("/db", checkContentType, authSession, (req, res) => {
	res.json(databaseTypes);
});

/*
@route      /resource
@method     GET
@desc       Returns the list of resource types
@access     public
*/
router.get("/resource", checkContentType, authSession, (req, res) => {
	res.json(resourceTypes);
});

/*
@route      /instance
@method     GET
@desc       Returns the list of instance types by provider
@access     public
*/
router.get("/instance", checkContentType, authSession, (req, res) => {
	res.json(instanceTypes);
});

/*
@route      /instance
@method     GET
@desc       Returns the list of phone based authentication SMS providers
@access     public
*/
router.get("/sms-provider", checkContentType, authSession, (req, res) => {
	res.json(phoneAuthSMSProviders);
});

/*
@route      /instance
@method     GET
@desc       Returns the list of phone based authentication SMS providers
@access     public
*/
router.get("/oauth-provider", checkContentType, authSession, (req, res) => {
	res.json(oAuthProviderTypes);
});

export default router;
