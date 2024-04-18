import BaseController from "./base.js";
import { VersionBackupModel } from "../schemas/versionBackup.js";

class VersionBakupController extends BaseController {
	constructor() {
		super(VersionBackupModel);
	}
}

export default new VersionBakupController();
