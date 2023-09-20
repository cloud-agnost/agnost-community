import BaseController from "./base.js";
import { CacheModel } from "../schemas/cache.js";

class CacheController extends BaseController {
	constructor() {
		super(CacheModel);
	}
}

export default new CacheController();
