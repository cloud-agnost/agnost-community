import onHeaders from "on-headers";
import versionCtrl from "../controllers/version.js";

// This middleware is called after the response headers are set
export const touchVersion = async (req, res, next) => {
	try {
		onHeaders(res, function onHeaders() {
			// Only touch version if we have version and user info and if the method is not GET
			if (req.version && req.user && req.method !== "GET") {
				// Update the updated by field of the version
				versionCtrl.updateOneById(
					req.version._id,
					{ updatedBy: req.user._id },
					{},
					{ cacheKey: req.version._id }
				);
			}
		});

		next();
	} catch (err) {}
};
