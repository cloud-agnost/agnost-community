import BaseController from "./base.js";
import { AppStorageModel } from "../schemas/appStorage.js";

class AppStorageController extends BaseController {
	constructor() {
		super(AppStorageModel);
	}
}

export default new AppStorageController();
