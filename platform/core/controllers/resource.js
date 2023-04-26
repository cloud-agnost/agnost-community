import BaseController from "./base.js";
import { ResourceModel } from "../schemas/resource.js";

class ResourceController extends BaseController {
	constructor() {
		super(ResourceModel);
	}
}

export default new ResourceController();
