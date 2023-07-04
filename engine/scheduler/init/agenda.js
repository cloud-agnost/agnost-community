import { Agenda } from "agenda";
import { getDBClient } from "./db.js";
import { getKey } from "./cache.js";
import { submitTask } from "./queue.js";

// Agenda job scheduler instance
var agendaInstance = null;

export const startAgenda = async () => {
	// Please note we are using mongodb version 4.16.0 since the version of Agenda does not support mongodb driver 5.1.0
	const dbClient = getDBClient();
	const agendaConfig = config.get("agenda");

	agendaInstance = new Agenda({
		mongo: dbClient.db(agendaConfig.DBName),
	});

	// Clear the lockedAt and lastFinishedAt fields since if they are present sometimes Agenda doest no start the cron scheduler
	await dbClient
		.db(agendaConfig.DBName)
		.collection("agendaJobs")
		.updateMany({}, { $unset: { lockedAt: "", lastFinishedAt: "" } });

	// Set agenda instance properties
	agendaInstance
		.processEvery(agendaConfig.processEvery)
		.maxConcurrency(agendaConfig.maxConcurrency)
		.defaultConcurrency(agendaConfig.defaultConcurrency)
		.lockLimit(agendaConfig.lockLimit)
		.defaultLockLimit(agendaConfig.defaultLockLimit)
		.defaultLockLifetime(agendaConfig.defaultLockLifetime);

	await agendaInstance.start();

	// Load all agenda jobs and restart them
	let skipCount = 0;
	let batchSize = agendaConfig.loadBatchSize;
	let jobs = await agendaInstance.jobs(
		{},
		{},
		batchSize,
		skipCount * batchSize
	);

	while (jobs.length > 0) {
		skipCount++;

		for (let i = 0; i < jobs.length; i++) {
			const job = jobs[i];
			// Define the task and its handler function
			await agendaInstance.define(job.attrs.name, taskProcessor);
			// Schedule the task
			await agendaInstance.every(
				job.attrs.repeatInterval,
				job.attrs.name,
				job.attrs.data,
				{
					// Setting this true will skip the immediate run. The first run will occur only in configured interval.
					skipImmediate: true,
				}
			);
		}

		// Load the next batch of jobs
		jobs = await agendaInstance.jobs({}, {}, batchSize, skipCount * batchSize);
	}

	logger.info("Started cron job scheduler");
};

export const stopAgenda = async () => {
	if (agendaInstance) {
		await agendaInstance.stop();
		logger.info("Stopped cron job scheduler");
	}
};

/**
 * When the cron job is triggered, this function submits a message to the queue for processing
 * @param  {object} job Agenda job object
 */
const taskProcessor = async (job) => {
	const dbClient = getDBClient();
	// Data holds information about the
	const { envId, taskId, taskName } = job.attrs.data;

	try {
		let trackingId = helper.generateId();
		let message = {
			taskId,
			envId,
			taskName,
			trackingId,
		};

		// Use the environment database
		let db = dbClient.db(envId);
		let taskInfo = {
			trackingId: trackingId,
			taskId: taskId,
			taskName: taskName,
			triggeredAt: new Date(),
			status: "pending",
		};

		// Create tracking entry in cluster environment database
		await db.collection("cronjobs").insertOne(taskInfo);
		// Submit task to the message queue
		submitTask(message);
	} catch (error) {
		logger.error(
			t(
				"Cannot submit task (%s) for processing at environment (%s)",
				taskId,
				envId
			),
			{
				details: {
					envId,
					taskId,
					orgId: task?.orgId,
					appId: task?.appId,
					versionId: task?.versionId,
					name: error.name,
					message: error.message,
					stack: error.stack,
				},
			}
		);
	}
};

export async function deployTask(env, task) {
	if (!agendaInstance) return;

	// Cancel any existing task with the same key
	await agendaInstance.cancel({ name: `${env.iid}.${task.iid}` });

	// Define the task and its handler function
	agendaInstance.define(`${env.iid}.${task.iid}`, taskProcessor);
	// Schedule the task
	agendaInstance.every(
		task.cronExpression,
		`${env.iid}.${task.iid}`,
		{
			envId: env.iid,
			taskId: task.iid,
			taskName: task.name,
		},
		{
			// Setting this true will skip the immediate run. The first run will occur only in configured interval.
			skipImmediate: true,
		}
	);
}

export async function undeployTask(envId, taskId) {
	if (!agendaInstance) return;

	// Cancel any existing task with the same key
	await agendaInstance.cancel({ name: `${envId}.${taskId}` });
}

export async function undeployTasks(envId) {
	if (!agendaInstance) return;

	// Cancel any existing task of the environment
	await agendaInstance.cancel({ name: { $regex: envId } });
}
