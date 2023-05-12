import BaseController from "./base.js";
import { EndpointModel } from "../schemas/endpoint.js";

class EndpointController extends BaseController {
	constructor() {
		super(EndpointModel);
	}
}

export default new EndpointController();
