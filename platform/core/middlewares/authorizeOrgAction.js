import appCtrl from "../controllers/app.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

export const orgAuthorization = {
	Admin: {
		org: {
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
				add: true,
				create: true,
				update: true,
				delete: true,
			},
		},
	},
	Member: {
		org: {
			update: false,
			delete: false,
			transfer: false,
			viewLogs: true,
			invite: {
				view: true,
				create: false,
				update: false,
				resend: false,
				delete: false,
			},
			member: {
				view: true,
				update: false,
				delete: false,
			},
			app: {
				view: true,
				viewAll: true,
				create: false,
				update: false,
			},
			resource: {
				view: true,
				add: false,
				create: false,
				update: false,
				delete: false,
			},
		},
	},
	"Resource Manager": {
		org: {
			update: false,
			delete: false,
			transfer: false,
			viewLogs: true,
			invite: {
				view: true,
				create: false,
				update: false,
				resend: false,
				delete: false,
			},
			member: {
				view: true,
				update: false,
				delete: false,
			},
			app: {
				view: true,
				viewAll: true,
				create: false,
				update: false,
			},
			resource: {
				view: true,
				add: true,
				create: true,
				update: true,
				delete: true,
			},
		},
	},
	Viewer: {
		org: {
			update: false,
			delete: false,
			transfer: false,
			viewLogs: true,
			invite: {
				view: true,
				create: false,
				update: false,
				resend: false,
				delete: false,
			},
			member: {
				view: true,
				update: false,
				delete: false,
			},
			app: {
				view: true,
				viewAll: true,
				create: false,
				update: false,
			},
			resource: {
				view: true,
				add: false,
				create: false,
				update: false,
				delete: false,
			},
		},
	},
};

// Middleare to create the error message for failed request input validations
export const authorizeOrgAction = (action = null) => {
	return async (req, res, next) => {
		try {
			let entity = orgAuthorization[req.orgMember.role];
			if (action && entity) {
				let items = action.split(".");
				for (let i = 0; i < items.length - 1; i++) {
					entity = entity[items[i]];
					if (!entity) break;
				}

				if (entity && entity[items[items.length - 1]]) return next();
			}

			// Chece if it is an app level resource action or not
			if (
				[
					"org.resource.add",
					"org.resource.create",
					"org.resource.update",
					"org.resource.delete",
				].includes(action)
			) {
				// If this is the person who created the resource then allow the action
				if (req.resource?.createdBy.toString() === req.user._id.toString())
					return next();

				// Check if this is app level resource
				const appId = req.body.appId || req.resource?.appId?.toString();
				if (appId && helper.isValidId(appId)) {
					const app = await appCtrl.getOneById(appId, { cacheKey: appId });
					if (app && app.orgId.toString() !== req.org._id.toString()) {
						req.app = app;
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

							// Assign app membership data
							req.appMember = appMember;
						}

						if (req.appMember?.role === "Admin") return next();
					}
				}
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
