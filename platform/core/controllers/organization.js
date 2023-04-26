import BaseController from "./base.js";
import { OrganizationModel } from "../schemas/organization.js";

class OrganizationController extends BaseController {
	constructor() {
		super(OrganizationModel);
	}
}

export default new OrganizationController();
