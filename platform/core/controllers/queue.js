import BaseController from "./base.js";
import { QueueModel } from "../schemas/queue.js";

class QueueController extends BaseController {
	constructor() {
		super(QueueModel);
	}
}

export default new QueueController();
