import express from "express";
import userCtrl from "../controllers/user.js";
import clsCtrl from "../controllers/cluster.js";
import { authMasterToken } from "../middlewares/authMasterToken.js";
import { checkContentType } from "../middlewares/contentType.js";
import { handleError } from "../schemas/platformError.js";

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
@route      /v1/cluster/smtp
@method     GET
@desc       Returns the smtp configuration of the cluster object
@access     public
*/
router.get("/smtp", checkContentType, authMasterToken, async (req, res) => {
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

export default router;
