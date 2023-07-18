import express from "express";
import { authAccessToken } from "../middlewares/authAccessToken.js";
import { checkContentType } from "../middlewares/contentType.js";
import {
	deployVersion,
	redeployVersion,
	deleteEnvironment,
	updateEnvironment,
	updateDatabase,
	updateEndpoints,
	updateMiddlewares,
	updateQueues,
	updateTasks,
	deployTasks,
	redeployTasks,
	deleteTasks,
	updateResourceAccess,
	manageEngineWorkers,
	updateStorages,
} from "../init/queue.js";

const router = express.Router({ mergeParams: true });

/*
@route      /env/deploy
@method     POST
@desc       Deploy version to the environment
@access     public
*/
router.post("/deploy", checkContentType, authAccessToken, async (req, res) => {
	try {
		const { timestamp, action, callback, actor, app, env, tasks } = req.body;
		// Cache items and manage databases
		deployVersion(req.body);
		// Deploy tasks
		deployTasks({
			timestamp,
			action,
			callback,
			actor,
			app,
			env,
			tasks,
		});
		res.json();
	} catch (error) {
		helper.handleError(req, res, error);
	}
});

/*
@route      /env/redeploy
@method     POST
@desc       Redeploy version to the environment
@access     public
*/
router.post(
	"/redeploy",
	checkContentType,
	authAccessToken,
	async (req, res) => {
		try {
			const { timestamp, action, callback, actor, app, env, tasks } = req.body;
			// Cache items and manage databases
			redeployVersion(req.body);
			// Redeploy tasks
			redeployTasks({
				timestamp,
				action,
				callback,
				actor,
				app,
				env,
				tasks,
			});
			res.json();
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /env/delete
@method     POST
@desc       Delete the environment
@access     public
*/
router.post("/delete", checkContentType, authAccessToken, async (req, res) => {
	try {
		const { timestamp, action, callback, actor, app, env, tasks } = req.body;
		// Clear cache items and manage databases
		deleteEnvironment(req.body);
		// Delete all task schedules
		deleteTasks({
			timestamp,
			action,
			callback,
			actor,
			app,
			env,
			tasks,
		});
		res.json();
	} catch (error) {
		helper.handleError(req, res, error);
	}
});

/*
@route      /env/update
@method     POST
@desc       Updates the environment data including version data
@access     public
*/
router.post("/update", checkContentType, authAccessToken, async (req, res) => {
	try {
		updateEnvironment(req.body);
		res.json();
	} catch (error) {
		helper.handleError(req, res, error);
	}
});

/*
@route      /env/update-database
@method     POST
@desc       Updates the database and environment data
@access     public
*/
router.post(
	"/update-database",
	checkContentType,
	authAccessToken,
	async (req, res) => {
		try {
			updateDatabase(req.body);
			res.json();
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /env/update-resource-access
@method     POST
@desc       Updates the resource access settings
@access     public
*/
router.post(
	"/update-resource-access",
	checkContentType,
	authAccessToken,
	async (req, res) => {
		try {
			// Remove the database connection from
			const { updatedResource } = req.body;
			// If database access settings has changed then we need to update connection pools in each engine worker
			if (updatedResource.type === "database") manageEngineWorkers(req.body);
			updateResourceAccess(req.body);
			res.json();
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /env/update-endpoints
@method     POST
@desc       Updates the endpoints and environment data
@access     public
*/
router.post(
	"/update-endpoints",
	checkContentType,
	authAccessToken,
	async (req, res) => {
		try {
			updateEndpoints(req.body);
			res.json();
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /env/update-middlewares
@method     POST
@desc       Updates the middlewares and environment data
@access     public
*/
router.post(
	"/update-middlewares",
	checkContentType,
	authAccessToken,
	async (req, res) => {
		try {
			updateMiddlewares(req.body);
			res.json();
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /env/update-queues
@method     POST
@desc       Updates the queues and environment data
@access     public
*/
router.post(
	"/update-queues",
	checkContentType,
	authAccessToken,
	async (req, res) => {
		try {
			updateQueues(req.body);
			res.json();
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /env/update-tasks
@method     POST
@desc       Updates the tasks and environment data
@access     public
*/
router.post(
	"/update-tasks",
	checkContentType,
	authAccessToken,
	async (req, res) => {
		try {
			const { timestamp, action, subAction, callback, actor, app, env, tasks } =
				req.body;
			updateTasks(req.body);
			if (subAction === "add") {
				// Deploy tasks
				deployTasks({
					timestamp,
					action,
					callback,
					actor,
					app,
					env,
					tasks,
				});
			} else if (subAction === "update") {
				// Redeploy tasks
				redeployTasks({
					timestamp,
					action,
					callback,
					actor,
					app,
					env,
					tasks,
				});
			} else if (subAction === "delete") {
				// Delete tasks
				deleteTasks({
					timestamp,
					action,
					callback,
					actor,
					app,
					env,
					tasks,
				});
			}
			res.json();
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

/*
@route      /env/update-storages
@method     POST
@desc       Updates the storages and environment data
@access     public
*/
router.post(
	"/update-storages",
	checkContentType,
	authAccessToken,
	async (req, res) => {
		try {
			updateStorages(req.body);
			res.json();
		} catch (error) {
			helper.handleError(req, res, error);
		}
	}
);

export default router;
