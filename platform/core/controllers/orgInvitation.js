import BaseController from "./base.js";
import { OrgInvitationModel } from "../schemas/orgInvitation.js";

class OrgInvitationController extends BaseController {
	constructor() {
		super(OrgInvitationModel);
	}
}

export default new OrgInvitationController();
