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
				domain: {
					view: true,
					create: true,
					delete: true,
				},
			},
			db: {
				view: true,
				create: true,
				update: true,
				delete: true,
				viewData: true,
				manageData: true,
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
				viewData: true,
				manageData: false,
			},
			function: {
				view: true,
				create: true,
				update: true,
				delete: true,
			},
			cache: {
				view: true,
				create: true,
				update: true,
				delete: true,
				viewData: true,
				manageData: true,
			},
		},
	},
	Developer: {
		app: {
			view: true,
			update: false,
			delete: false,
			transfer: false,
			viewLogs: false,
			invite: {
				view: false,
				create: false,
				update: false,
				resend: false,
				delete: false,
			},
			team: {
				view: true,
				update: false,
				delete: false,
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
				domain: {
					view: true,
					create: true,
					delete: true,
				},
			},
			db: {
				view: true,
				create: true,
				update: true,
				delete: true,
				viewData: true,
				manageData: true,
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
				viewData: true,
				manageData: true,
			},
			function: {
				view: true,
				create: true,
				update: true,
				delete: true,
			},
			cache: {
				view: true,
				create: true,
				update: true,
				delete: true,
				viewData: true,
				manageData: true,
			},
		},
	},
	Viewer: {
		app: {
			view: true,
			update: false,
			delete: false,
			transfer: false,
			viewLogs: false,
			invite: {
				view: false,
				create: false,
				update: false,
				resend: false,
				delete: false,
			},
			team: {
				view: true,
				update: false,
				delete: false,
			},
			version: {
				view: true,
				create: false,
				update: false,
				delete: false,
				param: {
					create: false,
					update: false,
					delete: false,
				},
				limit: {
					create: false,
					update: false,
					delete: false,
				},
				key: {
					create: false,
					update: false,
					delete: false,
				},
				package: {
					create: false,
					update: false,
					delete: false,
				},
				auth: {
					update: false,
				},
				domain: {
					view: true,
					create: false,
					delete: false,
				},
			},
			db: {
				view: true,
				create: false,
				update: false,
				delete: false,
				viewData: false,
				manageData: false,
			},
			model: {
				view: true,
				create: false,
				update: false,
				delete: false,
			},
			resource: {
				view: true,
				create: false,
				update: false,
				delete: false,
			},
			env: {
				view: true,
				update: false,
				deploy: false,
			},
			endpoint: {
				view: true,
				create: false,
				update: false,
				delete: false,
			},
			middleware: {
				view: true,
				create: false,
				update: false,
				delete: false,
			},
			queue: {
				view: true,
				create: false,
				update: false,
				delete: false,
			},
			task: {
				view: true,
				create: false,
				update: false,
				delete: false,
			},
			storage: {
				view: true,
				create: false,
				update: false,
				delete: false,
				viewData: false,
				manageData: false,
			},
			function: {
				view: true,
				create: false,
				update: false,
				delete: false,
			},
			cache: {
				view: true,
				create: false,
				update: false,
				delete: false,
				viewData: false,
				manageData: false,
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
