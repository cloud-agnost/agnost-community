import BaseController from "./base.js";
import { ProjectEnvModel } from "../schemas/projectEnv.js";

class ProjectEnvController extends BaseController {
	constructor() {
		super(ProjectEnvModel);
	}
}

export default new ProjectEnvController();
