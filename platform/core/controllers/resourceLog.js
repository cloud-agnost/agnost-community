import BaseController from "./base.js";
import { ResourceLogModel } from "../schemas/resourceLog.js";

class ResourceLogController extends BaseController {
	constructor() {
		super(ResourceLogModel);
	}
}

export default new ResourceLogController();
