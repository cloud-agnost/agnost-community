import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

export const appAuthorization = {
	Admin: {
		app: {
			view: true,
			update: true,
			delete: true,
			transfer: true,
			viewLogs: true,
			invite: {
				view: true,
				create: true,
				update: true,
				resend: true,
				delete: true,
			},
			team: {
				view: true,
				update: true,
				delete: true,
			},
			version: {
				view: true,
				create: true,
				update: true,
				delete: true,
				param: {
					create: true,
					update: true,
					delete: true,
				},
				limit: {
					create: true,
					update: true,
					delete: true,
				},
				key: {
					create: true,
					update: true,
					delete: true,
				},
				package: {
					create: true,
					update: true,
					delete: true,
				},
				auth: {
					update: true,
				},
			},
			db: {
				view: true,
				create: true,
				update: true,
				delete: true,
			},
			model: {
				view: true,
				create: true,
				update: true,
				delete: true,
			},
			resource: {
				view: true,
				create: true,
				update: true,
				delete: true,
			},
			env: {
				view: true,
				update: true,
				deploy: true,
			},
			endpoint: {
				view: true,
				create: true,
				update: true,
				delete: true,
			},
			middleware: {
				view: true,
				create: true,
				update: true,
				delete: true,
			},
			queue: {
				view: true,
				create: true,
				update: true,
				delete: true,
			},
			task: {
				view: true,
				create: true,
				update: true,
				delete: true,
			},
			storage: {
				view: true,
				create: true,
				update: true,
				delete: true,
			},
		},
	},
};

// Middleare to create the error message for failed request input validations
export const authorizeAppAction = (action = null) => {
	return async (req, res, next) => {
		try {
			let entity = appAuthorization[req.appMember.role];
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
					"You are not authorized to perform '%s' action on app '%s'",
					action,
					req.app.name
				),
				code: ERROR_CODES.unauthorized,
			});
		} catch (err) {
			return handleError(req, res, err);
		}
	};
};
