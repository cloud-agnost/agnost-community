import express from "express";
import resourceCtrl from "../controllers/resource.js";
import resLogCtrl from "../controllers/resourceLog.js";
import cntrCtrl from "../controllers/container.js";
import { authMasterToken } from "../middlewares/authMasterToken.js";
import { checkContentType } from "../middlewares/contentType.js";
import { handleError } from "../schemas/platformError.js";
import { sendMessage } from "../init/sync.js";

const router = express.Router({ mergeParams: true });

/*
@route      /v1/telemetry/update-log
@method     POST
@desc       Updates the latest resource log of a resource
@access     public
*/
router.post(
	"/update-log",
	checkContentType,
	authMasterToken,
	async (req, res) => {
		try {
			const { resource, status } = req.body;
			// Get the latest log entry and update it
			await resLogCtrl.updateOneByQuery(
				{
					resourceId: resource._id,
					orgId: resource.orgId,
					status: status.status,
				},
				{ logs: status.logs, updatedAt: Date.now() },
				{},
				{ sort: { createdAt: -1 } }
			);
			res.json();
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/telemetry/update-status
@method     POST
@desc       Updates the status of the resource and adds a new resource log entry
@access     public
*/
router.post(
	"/update-status",
	checkContentType,
	authMasterToken,
	async (req, res) => {
		// Start new database transaction session
		const session = await resourceCtrl.startSession();
		try {
			const { resource, status } = req.body;
			let timestamp = Date.now();

			let updatedResource = await resourceCtrl.updateOneById(
				resource._id,
				{
					status: status.status,
					updatedAt: timestamp,
					availableReplicas: status.availableReplicas,
					unavailableReplicas: status.unavailableReplicas,
				},
				{},
				{ cacheKey: resource._id, session }
			);

			await resLogCtrl.create(
				{
					orgId: resource.orgId,
					appId: resource.appId,
					versionId: resource.versionId,
					resourceId: resource._id,
					action: "check",
					status: status.status,
					logs: status.logs,
				},
				{ session }
			);

			// Commit transaction
			await resourceCtrl.commit(session);
			res.json();

			// Send realtime message about the status change of the resource
			sendMessage(resource._id, {
				actor: null,
				action: "telemetry",
				object: "org.resource",
				description: t("Resource status updated to '%s'", status.status),
				timestamp: Date.now(),
				data: helper.decryptResourceData(updatedResource),
				identifiers: {
					orgId: resource.orgId,
					resourceId: resource._id,
				},
			});
		} catch (error) {
			await resourceCtrl.rollback(session);
			handleError(req, res, error);
		}
	}
);

/*
@route      /v1/telemetry/update-container-status
@method     POST
@desc       Updates the status of the container
@access     public
*/
router.post(
	"/update-container-status",
	checkContentType,
	authMasterToken,
	async (req, res) => {
		try {
			const { container, status } = req.body;
			let updatedContainer = await cntrCtrl.updateOneById(
				container._id,
				{
					status: status,
				},
				{},
				{ cacheKey: container._id }
			);

			res.json();

			// Send realtime message about the status change of the container
			sendMessage(container._id, {
				actor: null,
				action: "telemetry",
				object: "org.project.environment.container",
				description: t("Container status updated to '%s'", status.status),
				timestamp: Date.now(),
				data: updatedContainer,
				identifiers: {
					orgId: updatedContainer.orgId,
					projectId: updatedContainer.projectId,
					environmentId: updatedContainer.environmentId,
					containerId: updatedContainer._id,
				},
			});

			console.log("***here", container.iid);
		} catch (error) {
			handleError(req, res, error);
		}
	}
);

export default router;
