import BaseController from "./base.js";
import { AppModel } from "../schemas/app.js";

class AppController extends BaseController {
	constructor() {
		super(AppModel);
	}
}

export default new AppController();
