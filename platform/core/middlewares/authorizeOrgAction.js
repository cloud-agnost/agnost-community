import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

export const orgAuthorization = {
	Admin: {
		org: {
			update: true,
			transfer: true,
			viewLogs: true,
			invite: {
				view: true,
				create: true,
				update: true,
				resend: true,
				delete: true,
			},
			member: {
				view: true,
				update: true,
				delete: true,
			},
			app: {
				view: true,
				viewAll: true,
				create: true,
				update: true,
			},
			resource: {
				view: true,
				create: true,
				update: true,
				delete: true,
			},
		},
	},
};

// Middleare to create the error message for failed request input validations
export const authorizeOrgAction = (action = null) => {
	return async (req, res, next) => {
		try {
			let entity = orgAuthorization[req.orgMembrer.role];
			if (action && entity) {
				let items = action.split(".");
				for (let i = 0; i < items.length - 1; i++) {
					entity = entity[items[i]];
					if (!entity) break;
				}

				if (entity && entity[items[items.length - 1]]) return next();
			}

			return res.status(401).json({
				error: t("Not Authorized"),
				details: t(
					"You are not authorized to perform '%s' action on an organization '%s'",
					action,
					req.org.name
				),
				code: ERROR_CODES.unauthorized,
			});
		} catch (err) {
			return handleError(req, res, err);
		}
	};
};
