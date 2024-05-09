import axios from "axios";
import express from "express";
import auditCtrl from "../controllers/audit.js";
import cntrCtrl from "../controllers/container.js";
import { authSession } from "../middlewares/authSession.js";
import { checkContentType } from "../middlewares/contentType.js";
import { validateOrg } from "../middlewares/validateOrg.js";
import { validateProject } from "../middlewares/validateProject.js";
import { validateProjectEnvironment } from "../middlewares/validateProjectEnvironment.js";
import { authorizeProjectAction } from "../middlewares/authorizeProjectAction.js";
import { validateGitOps } from "../middlewares/validateGitOps.js";
import { applyRules } from "../schemas/container.js";
import { validate } from "../middlewares/validate.js";
import { handleError } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/org/:orgId/project/:projectId/env/:envId/containers
@method     GET
@desc       Get all containers of a project environment
@access     private
*/
router.get(
	"/",
	authSession,
	validateGitOps,
	validateOrg,
	validateProject,
	validateProjectEnvironment,
	authorizeProjectAction("project.container.view"),
	async (req, res) => {
		try {
			const { environment } = req;
			const { search, sortBy, sortDir } = req.query;

			let query = { envId: environment._id };
			if (search) {
				query.name = {
					$regex: helper.escapeStringRegexp(search),
					$options: "i",
				};
			}

			let sort = {};
			if (sortBy && sortDir) {
				sort[sortBy] = sortDir;
			} else sort = { createdAt: "desc" };

			let containers = await cntrCtrl.getManyByQuery(query, {
				sort,
			});

			res.json(containers);
		} catch (err) {
			handleError(req, res, err);
		}
	}
);

/*
@route      /v1/org/:orgId/project/:projectId/env/:envId/containers
@method     POST
@desc       Creates a new container in project environment
@access     private
*/
router.get(
	"/",
	checkContentType,
	authSession,
	validateGitOps,
	validateOrg,
	validateProject,
	validateProjectEnvironment,
	authorizeProjectAction("project.container.create"),
	applyRules("create"),
	validate,
	async (req, res) => {
		const session = await cntrCtrl.startSession();

		try {
			const { environment } = req;
			const { name, type } = req.body;

			// Commit the database transaction
			await cntrCtrl.commit(session);

			return res.json(containers);

			// Log action
			auditCtrl.logAndNotify(
				environment._id,
				user,
				"org.project.environment.container",
				"create",
				t("Created new '%s' named '%s'", type, name),
				container,
				{
					orgId: org._id,
					projectId: project._id,
					environmentId: environment._id,
					containerId: container._id,
				}
			);
		} catch (err) {
			await cntrCtrl.rollback(session);
			handleError(req, res, err);
		}
	}
);

export default router;
