import express from "express";
import { authSession } from "../middlewares/authSession.js";
import {
	orgRoles,
	orgRoleDesc,
	appRoles,
	appRoleDesc,
	projectRoles,
	projectRoleDesc,
	fieldTypes,
	databaseTypes,
	resourceTypes,
	instanceTypes,
	phoneAuthSMSProviders,
	oAuthProviderTypes,
	authUserDataModel,
	resourceVersions,
	ftsIndexLanguages,
} from "../config/constants.js";

const router = express.Router({ mergeParams: true });

/*
@route      /all
@method     GET
@desc       Returns all types used in the platform
@access     public
*/
router.get("/all", authSession, (req, res) => {
	res.json({
		orgRoles,
		orgRoleDesc,
		appRoles,
		appRoleDesc,
		projectRoles,
		projectRoleDesc,
		fieldTypes,
		databaseTypes,
		resourceTypes,
		instanceTypes,
		phoneAuthSMSProviders,
		oAuthProviderTypes,
		authUserDataModel,
		resourceVersions,
		ftsIndexLanguages,
	});
});

/*
@route      /field
@method     GET
@desc       Returns the list of database field types
@access     public
*/
router.get("/field", authSession, (req, res) => {
	res.json(fieldTypes);
});

/*
@route      /db
@method     GET
@desc       Returns the list of database types
@access     public
*/
router.get("/db", authSession, (req, res) => {
	res.json(databaseTypes);
});

/*
@route      /resource
@method     GET
@desc       Returns the list of resource types
@access     public
*/
router.get("/resource", authSession, (req, res) => {
	res.json(resourceTypes);
});

/*
@route      /instance
@method     GET
@desc       Returns the list of instance types by provider
@access     public
*/
router.get("/instance", authSession, (req, res) => {
	res.json(instanceTypes);
});

/*
@route      /instance
@method     GET
@desc       Returns the list of phone based authentication SMS providers
@access     public
*/
router.get("/sms-provider", authSession, (req, res) => {
	res.json(phoneAuthSMSProviders);
});

/*
@route      /instance
@method     GET
@desc       Returns the list of phone based authentication SMS providers
@access     public
*/
router.get("/oauth-provider", authSession, (req, res) => {
	res.json(oAuthProviderTypes);
});

export default router;
