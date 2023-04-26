import BaseController from "./base.js";
import { EnvironmentLogModel } from "../schemas/environmentLog.js";

class EnvironmentLogController extends BaseController {
	constructor() {
		super(EnvironmentLogModel);
	}
}

export default new EnvironmentLogController();
