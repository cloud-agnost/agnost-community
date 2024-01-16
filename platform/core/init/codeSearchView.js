import mongoose from "mongoose";

export async function initializeCodeSearchView() {
	const hasView = await hasCodeSearchView();
	if (hasView) return;
	await createCodeSearchView();
	logger.info(`Created the code search view @${process.env.CLUSTER_DB_URI}`);
}

async function hasCodeSearchView() {
	const conn = mongoose.connection;
	// Get the list of collections
	const collections = await conn.db.listCollections().toArray();

	// check whether the search_view is already create or not
	return collections.map((coll) => coll.name).includes("code_search_view");
}

/**
 * Creates a MongoDB view to consolidate all searchable object information. This view is used in Agnost Studio to quickly find design elemetns by their name
 */
async function createCodeSearchView() {
	const conn = mongoose.connection;

	await conn.db.createCollection("code_search_view", {
		viewOn: "versions",
		pipeline: [
			{ $match: { _id: "none" } },
			{
				$unionWith: {
					coll: "endpoints",
					pipeline: [
						{
							$project: {
								_id: 1,
								versionId: "$versionId",
								name: "$name",
								code: "$logic",
								type: { $literal: "endpoint" },
								"meta.method": "$method",
								"meta.path": "$path",
							},
						},
					],
				},
			},
			{
				$unionWith: {
					coll: "middlewares",
					pipeline: [
						{
							$project: {
								_id: 1,
								versionId: "$versionId",
								name: "$name",
								code: "$logic",
								type: { $literal: "middleware" },
							},
						},
					],
				},
			},
			{
				$unionWith: {
					coll: "functions",
					pipeline: [
						{
							$project: {
								_id: 1,
								versionId: "$versionId",
								name: "$name",
								code: "$logic",
								type: { $literal: "function" },
							},
						},
					],
				},
			},
			{
				$unionWith: {
					coll: "queues",
					pipeline: [
						{
							$project: {
								_id: 1,
								versionId: "$versionId",
								name: "$name",
								code: "$logic",
								type: { $literal: "queue" },
							},
						},
					],
				},
			},
			{
				$unionWith: {
					coll: "tasks",
					pipeline: [
						{
							$project: {
								_id: 1,
								versionId: "$versionId",
								name: "$name",
								code: "$logic",
								type: { $literal: "task" },
							},
						},
					],
				},
			},
		],
	});
}
