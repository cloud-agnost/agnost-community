import BaseController from "./base.js";
import { TaskModel } from "../schemas/task.js";

class TaskController extends BaseController {
	constructor() {
		super(TaskModel);
	}
}

export default new TaskController();
