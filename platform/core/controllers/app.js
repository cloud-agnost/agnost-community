import BaseController from "./base.js";
import versionCtrl from "./version.js";
import appInvitationCtrl from "../controllers/appInvitation.js";
import dbCtrl from "../controllers/database.js";
import modelCtrl from "../controllers/model.js";
import envCtrl from "../controllers/environment.js";
import envLogCtrl from "../controllers/environmentLog.js";
import auditCtrl from "../controllers/audit.js";
import resourceCtrl from "../controllers/resource.js";
import resLogCtrl from "../controllers/resourceLog.js";
import epCtrl from "../controllers/endpoint.js";
import mwCtrl from "../controllers/middleware.js";
import queueCtrl from "../controllers/queue.js";
import taskCtrl from "../controllers/task.js";
import storageCtrl from "../controllers/storage.js";
import { AppModel } from "../schemas/app.js";

class AppController extends BaseController {
	constructor() {
		super(AppModel);
	}

	/**
	 * Creates a new app. When creating the app we also create the master version, associated environment and engine
	 * @param  {Object} session The database session object
	 * @param  {Object} user The user whose creating the application
	 * @param  {Object} org The organization object where the app will be created
	 * @param  {Object} org The name of the app
	 */
	async createApp(session, user, org, name) {
		// Create the app
		const appId = helper.generateId();
		const app = await this.create(
			{
				_id: appId,
				orgId: org._id,
				iid: helper.generateSlug("app"),
				ownerUserId: user._id,
				name,
				color: helper.generateColor("light"),
				team: [{ userId: user._id, role: "Admin" }],
				createdBy: user._id,
			},
			{ session, cacheKey: appId }
		);

		// Create the master version of the app
		const result = await versionCtrl.createVersion(session, user, org, app, {
			name: "master",
			isPrivate: false,
			readOnly: true,
			master: true,
		});

		return { app, ...result };
	}

	/**
	 * Delete all application related data
	 * @param  {Object} session The database session object
	 * @param  {Object} org The organization object
	 * @param  {Object} app The app object that will be deleted
	 */
	async deleteApp(session, org, app) {
		await this.deleteOneById(app._id, { session, cacheKey: app._id });
		await appInvitationCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id },
			{ session }
		);
		await versionCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id },
			{ session }
		);
		await dbCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id },
			{ session }
		);
		await modelCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id },
			{ session }
		);
		await envCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id },
			{ session }
		);
		await envLogCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id },
			{ session }
		);
		await auditCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id },
			{ session }
		);
		await resourceCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id },
			{ session }
		);
		await resLogCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id },
			{ session }
		);
		await epCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id },
			{ session }
		);
		await mwCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id },
			{ session }
		);
		await queueCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id },
			{ session }
		);
		await taskCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id },
			{ session }
		);
		await storageCtrl.deleteManyByQuery(
			{ orgId: org._id, appId: app._id },
			{ session }
		);
	}
}

export default new AppController();
