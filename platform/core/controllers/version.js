import BaseController from "./base.js";
import { VersionModel } from "../schemas/version.js";

class VersionController extends BaseController {
	constructor() {
		super(VersionModel);
	}
}

export default new VersionController();
