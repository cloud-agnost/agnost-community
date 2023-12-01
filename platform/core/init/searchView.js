import mongoose from "mongoose";

export async function initializeSearchView() {
	const hasView = await hasSearchView();
	if (hasView) return;
	await createSearchView();
	logger.info(`Created the search view @${process.env.CLUSTER_DB_URI}`);
}

async function hasSearchView() {
	const conn = mongoose.connection;
	// Get the list of collections
	const collections = await conn.db.listCollections().toArray();

	// check whether the search_view is already create or not
	return collections.map((coll) => coll.name).includes("search_view");
}

/**
 * Creates a MongoDB view to consolidate all searchable object information. This view is used in Agnost Studio to quickly find design elemetns by their name
 */
async function createSearchView() {
	const conn = mongoose.connection;

	await conn.db.createCollection("search_view", {
		viewOn: "versions",
		pipeline: [
			{ $match: { _id: "none" } },
			{
				$unionWith: {
					coll: "databases",
					pipeline: [
						{
							$project: {
								_id: 1,
								versionId: "$versionId",
								name: "$name",
								type: { $literal: "database" },
								"meta.dbType": "$type",
							},
						},
					],
				},
			},
			{
				$unionWith: {
					coll: "storages",
					pipeline: [
						{
							$project: {
								_id: 1,
								versionId: "$versionId",
								name: "$name",
								type: { $literal: "storage" },
							},
						},
					],
				},
			},
			{
				$unionWith: {
					coll: "endpoints",
					pipeline: [
						{
							$project: {
								_id: 1,
								versionId: "$versionId",
								name: "$name",
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
								type: { $literal: "middleware" },
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
								type: { $literal: "task" },
							},
						},
					],
				},
			},
			{
				$unionWith: {
					coll: "models",
					pipeline: [
						{ $match: { type: "model" } },
						{
							$project: {
								_id: 1,
								versionId: "$versionId",
								name: "$name",
								type: { $literal: "model" },
								"meta.dbId": "$dbId",
							},
						},
					],
				},
			},
			{
				$unionWith: {
					coll: "models",
					pipeline: [
						{ $unwind: "$fields" },
						{
							$project: {
								_id: "$fields._id",
								modelId: "$_id",
								versionId: "$versionId",
								name: "$fields.name",
								type: {
									$literal: "field",
								},
								"meta.fieldType": "$fields.type",
								"meta.modelName": "$name",
								"meta.dbId": "$dbId",
							},
						},
					],
				},
			},
		],
	});
}
