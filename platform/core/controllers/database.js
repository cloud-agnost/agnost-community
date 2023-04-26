import BaseController from "./base.js";
import { DatabaseModel } from "../schemas/database.js";

class DatabaseController extends BaseController {
	constructor() {
		super(DatabaseModel);
	}
}

export default new DatabaseController();
