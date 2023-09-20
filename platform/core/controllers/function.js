import BaseController from "./base.js";
import { FunctionModel } from "../schemas/function.js";

class FunctionController extends BaseController {
	constructor() {
		super(FunctionModel);
	}
}

export default new FunctionController();
