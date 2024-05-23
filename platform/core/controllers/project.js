import axios from "axios";
import BaseController from "./base.js";
import prjEnvCtrl from "./projectEnv.js";
import auditCtrl from "../controllers/audit.js";
import prjInvitationCtrl from "../controllers/projectInvitation.js";
import cntrCtrl from "../controllers/container.js";
import { ProjectModel } from "../schemas/project.js";

class ProjectController extends BaseController {
	constructor() {
		super(ProjectModel);
	}

	/**
	 * Creates a new project. When creating the project we also create the development environment
	 * @param  {Object} session The database session object
	 * @param  {Object} user The user whose creating the application
	 * @param  {Object} org The organization object where the app will be created
	 * @param  {Object} org The name of the app
	 */
	async createProject(session, user, org, name, envName = "default") {
		// Create the app
		const projectId = helper.generateId();
		const project = await this.create(
			{
				_id: projectId,
				orgId: org._id,
				iid: helper.generateSlug("prj"),
				ownerUserId: user._id,
				name,
				color: helper.generateColor("light"),
				team: [{ userId: user._id, role: "Admin" }],
				createdBy: user._id,
			},
			{ session, cacheKey: projectId }
		);

		// Create the default environment of the project
		const environmentId = helper.generateId();
		const environment = await prjEnvCtrl.create(
			{
				_id: environmentId,
				orgId: org._id,
				projectId: project._id,
				iid: helper.generateSlug("env"),
				name: envName,
				private: false,
				readOnly: true,
				createdBy: user._id,
			},
			{ session, cacheKey: environmentId }
		);

		// Create the Kubernetes namespace of the environment
		await axios.post(helper.getWorkerUrl() + "/v1/cicd/env", environment, {
			headers: {
				Authorization: process.env.ACCESS_TOKEN,
				"Content-Type": "application/json",
			},
		});

		return { project, environment };
	}

	/**
	 * Delete all project related data
	 * @param  {Object} session The database session object
	 * @param  {Object} org The organization object
	 * @param  {Object} project The project object that will be deleted
	 */
	async deleteProject(session, org, project) {
		await this.deleteOneById(project._id, { session, cacheKey: project._id });
		await prjInvitationCtrl.deleteManyByQuery(
			{ orgId: org._id, projectId: project._id },
			{ session }
		);
		await prjEnvCtrl.deleteManyByQuery(
			{ orgId: org._id, projectId: project._id },
			{ session }
		);
		await cntrCtrl.deleteManyByQuery(
			{ orgId: org._id, projectId: project._id },
			{ session }
		);
		await auditCtrl.deleteManyByQuery(
			{ orgId: org._id, projectId: project._id },
			{ session }
		);
	}
}

export default new ProjectController();
