import BaseController from "./base.js";
import { ClusterModel } from "../schemas/cluster.js";

class ClusterController extends BaseController {
	constructor() {
		super(ClusterModel);
	}
}

export default new ClusterController();
