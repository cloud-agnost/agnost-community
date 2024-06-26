import BaseController from "./base.js";
import appCtrl from "../controllers/app.js";
import appInvitationCtrl from "../controllers/appInvitation.js";
import versionCtrl from "../controllers/version.js";
import dbCtrl from "../controllers/database.js";
import modelCtrl from "../controllers/model.js";
import envCtrl from "../controllers/environment.js";
import envLogCtrl from "../controllers/environmentLog.js";
import auditCtrl from "../controllers/audit.js";
import resourceCtrl from "../controllers/resource.js";
import resLogCtrl from "../controllers/resourceLog.js";
import orgMemberCtrl from "../controllers/organizationMember.js";
import orgInvitationCtrl from "../controllers/orgInvitation.js";
import epCtrl from "../controllers/endpoint.js";
import mwCtrl from "../controllers/middleware.js";
import queueCtrl from "../controllers/queue.js";
import taskCtrl from "../controllers/task.js";
import storageCtrl from "../controllers/storage.js";
import funcCtrl from "../controllers/function.js";
import cacheCtrl from "../controllers/cache.js";
import dmnCtrl from "../controllers/domain.js";
import vBackupCtrl from "../controllers/versionBackup.js";
import prjCtrl from "../controllers/project.js";
import prjEnvCtrl from "../controllers/projectEnv.js";
import prjInvitationCtrl from "../controllers/projectInvitation.js";
import cntrCtrl from "../controllers/container.js";

import { OrganizationModel } from "../schemas/organization.js";

class OrganizationController extends BaseController {
	constructor() {
		super(OrganizationModel);
	}

	/**
	 * Delete all organization related data
	 * @param  {Object} session The database session object
	 * @param  {Object} org The organization object that will be deleted
	 */
	async deleteOrganization(session, org) {
		await this.deleteOneById(org._id, { session, cacheKey: org._id });
		await appCtrl.deleteManyByQuery({ orgId: org._id }, { session });
		await appInvitationCtrl.deleteManyByQuery({ orgId: org._id }, { session });
		await versionCtrl.deleteManyByQuery({ orgId: org._id }, { session });
		await dbCtrl.deleteManyByQuery({ orgId: org._id }, { session });
		await modelCtrl.deleteManyByQuery({ orgId: org._id }, { session });
		await envCtrl.deleteManyByQuery({ orgId: org._id }, { session });
		await envLogCtrl.deleteManyByQuery({ orgId: org._id }, { session });
		await auditCtrl.deleteManyByQuery({ orgId: org._id }, { session });
		await resourceCtrl.deleteManyByQuery({ orgId: org._id }, { session });
		await resLogCtrl.deleteManyByQuery({ orgId: org._id }, { session });
		await orgMemberCtrl.deleteManyByQuery({ orgId: org._id }, { session });
		await orgInvitationCtrl.deleteManyByQuery({ orgId: org._id }, { session });
		await epCtrl.deleteManyByQuery({ orgId: org._id }, { session });
		await mwCtrl.deleteManyByQuery({ orgId: org._id }, { session });
		await queueCtrl.deleteManyByQuery({ orgId: org._id }, { session });
		await taskCtrl.deleteManyByQuery({ orgId: org._id }, { session });
		await storageCtrl.deleteManyByQuery({ orgId: org._id }, { session });
		await funcCtrl.deleteManyByQuery({ orgId: org._id }, { session });
		await cacheCtrl.deleteManyByQuery({ orgId: org._id }, { session });
		await dmnCtrl.deleteManyByQuery({ orgId: org._id }, { session });
		await vBackupCtrl.deleteManyByQuery({ orgId: org._id }, { session });
		await prjCtrl.deleteManyByQuery({ orgId: org._id }, { session });
		await prjEnvCtrl.deleteManyByQuery({ orgId: org._id }, { session });
		await prjInvitationCtrl.deleteManyByQuery({ orgId: org._id }, { session });
		await cntrCtrl.deleteManyByQuery({ orgId: org._id }, { session });
	}
}

export default new OrganizationController();
