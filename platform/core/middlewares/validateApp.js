import appCtrl from "../controllers/app.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

export const validateApp = async (req, res, next) => {
	try {
		const { appId } = req.params;

		// Get the app object
		let app = await appCtrl.getOneById(appId, { cacheKey: appId });

		if (!app) {
			return res.status(404).json({
				error: t("Not Found"),
				details: t(
					"No such application with the provided id '%s' exists.",
					appId
				),
				code: ERROR_CODES.notFound,
			});
		}

		if (app.orgId.toString() !== req.org._id.toString()) {
			return res.status(401).json({
				error: t("Not Authorized"),
				details: t(
					"Organization does not have an app with the provided id '%s'",
					appId
				),
				code: ERROR_CODES.unauthorized,
			});
		}

		// If we have the user information, in case of endpoints called by the master token we do not have user info
		if (req.user) {
			// If the user is cluster owner then by default he has 'Admin' privileges to the app
			if (req.user.isClusterOwner) {
				// Assign app membership data
				req.appMember = {
					userId: req.user._id,
					role: "Admin",
					joinDate: req.user.createdAt,
				};
			} else {
				// Check if the user is a member of the app or not
				let appMember = app.team.find(
					(entry) => entry.userId.toString() === req.user._id.toString()
				);

				if (!appMember) {
					return res.status(401).json({
						error: t("Not Authorized"),
						details: t(
							"You are not a member of the application '%s'",
							app.name
						),
						code: ERROR_CODES.unauthorized,
					});
				}

				// Assign app membership data
				req.appMember = appMember;
			}
		}

		// Assign app data
		req.app = app;

		next();
	} catch (err) {
		return handleError(req, res, err);
	}
};
