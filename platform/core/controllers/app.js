import BaseController from "./base.js";
import { AppModel } from "../schemas/app.js";
import versionCtrl from "./version.js";

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
				name,
				color: helper.generateColor("light"),
				team: [{ userId: user._id, role: "Admin" }],
				createdBy: user._id,
			},
			{ session, cacheKey: appId }
		);

		// Create the master version of the app
		const { version, resource, resLog, env, envLog } =
			await versionCtrl.createVersion(session, user, org, app, {
				name: "master",
				isPrivate: false,
				readOnly: true,
				master: true,
			});

		return { app, version, resource, resLog, env, envLog };
	}
}

export default new AppController();
