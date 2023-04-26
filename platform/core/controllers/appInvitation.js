import BaseController from "./base.js";
import { AppInvitationModel } from "../schemas/appInvitation.js";

class AppInvitationController extends BaseController {
	constructor() {
		super(AppInvitationModel);
	}
}

export default new AppInvitationController();
