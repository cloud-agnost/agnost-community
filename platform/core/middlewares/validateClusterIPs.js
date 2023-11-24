import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

export const validateClusterIPs = async (req, res, next) => {
	try {
		const clusterIPs = await helper.getClusterIPs();
		for (let i = 0; i < clusterIPs.length; i++) {
			// Means that there is at least one IP address that is not private
			if (helper.isPrivateIP(clusterIPs[i]) === false) {
				return next();
			}
		}

		return res.status(401).json({
			error: t("Not Allowed"),
			details: t(
				"Your cluster IP addresses '%s' are private IP addresses which are not routable on the internet. You cannot use private IP addresses to access the platform.",
				clusterIPs.join(", ")
			),
			code: ERROR_CODES.notAllowed,
		});
	} catch (err) {
		return handleError(req, res, err);
	}
};
