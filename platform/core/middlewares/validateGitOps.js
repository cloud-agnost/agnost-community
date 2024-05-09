import clsCtrl from "../controllers/cluster.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

export const validateGitOps = async (req, res, next) => {
	try {
		// Get the cluster object
		const cluster = await clsCtrl.getOneByQuery({
			clusterAccesssToken: process.env.CLUSTER_ACCESS_TOKEN,
		});

		if (!cluster.cicdEnabled) {
			return res.status(401).json({
				error: t("Not Allowed"),
				details: t(
					"GitOps has not been enabled in your cluster. Cluster owner first needs to enable GitOps in the cluster to use this feature."
				),
				code: ERROR_CODES.notAllowed,
			});
		}

		// Assign cluster data
		req.cluster = cluster;

		next();
	} catch (err) {
		return handleError(req, res, err);
	}
};
