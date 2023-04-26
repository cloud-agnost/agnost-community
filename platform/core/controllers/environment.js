import BaseController from "./base.js";
import { EnvironmentModel } from "../schemas/environment.js";

class EnvironmentController extends BaseController {
	constructor() {
		super(EnvironmentModel);
	}
}

export default new EnvironmentController();
