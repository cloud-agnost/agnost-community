import BaseController from "./base.js";
import { VersionModel } from "../schemas/version.js";
import resourceCtrl from "./resource.js";
import envCtrl from "./environment.js";

class VersionController extends BaseController {
	constructor() {
		super(VersionModel);
	}

	/**
	 * Creates a new version. When creating the version we also create the version environment and associated engine deployment
	 * @param  {Object} session The database session object
	 * @param  {Object} user The user whose creating the version
	 * @param  {Object} org The organization object where the version will be created
	 * @param  {Object} app The app object where the version will be created
	 * @param  {Object} org The version related information such as name, private, readOnly and master flags
	 */
	async createVersion(
		session,
		user,
		org,
		app,
		{ name = "v1.0.0", isPrivate = false, readOnly = true, master = false }
	) {
		// Create the new version
		let versionId = helper.generateId();
		const version = await this.create(
			{
				_id: versionId,
				orgId: org._id,
				appId: app._id,
				iid: helper.generateSlug("ver"),
				name: name,
				private: isPrivate,
				readOnly: readOnly,
				master: master,
				createdBy: user._id,
			},
			{ session, cacheKey: versionId }
		);

		// Create the engine deployment resource of the version
		const envId = helper.generateId();
		const envIid = helper.generateSlug("env");
		const { resource, log } = await resourceCtrl.createEngineDeployment(
			session,
			user,
			org,
			app,
			version,
			envIid
		);

		const env = await envCtrl.create(
			{
				_id: envId,
				orgId: org._id,
				appId: app._id,
				versionId: versionId,
				iid: envIid,
				name: t("Default Environment"),
				autoDeploy: true,
				mappings: [
					{
						design: {
							iid: envIid,
							type: "engine",
							name: t("Engine"),
						},
						resource: {
							id: resource.id,
							name: resource.name,
							type: resource.type,
							instance: resource.instance,
						},
					},
				],
				createdBy: user._id,
			},
			{ session, cacheKey: envId }
		);

		return { version, resource, log, env };
	}
}

export default new VersionController();
