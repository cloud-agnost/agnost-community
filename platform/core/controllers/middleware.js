import BaseController from "./base.js";
import { MiddlewareModel } from "../schemas/middleware.js";

class MiddlewareController extends BaseController {
	constructor() {
		super(MiddlewareModel);
	}
}

export default new MiddlewareController();
