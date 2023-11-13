import dbCtrl from "../controllers/database.js";
import modelCtrl from "../controllers/model.js";
import queueCtrl from "../controllers/queue.js";
import taskCtrl from "../controllers/task.js";
import storageCtrl from "../controllers/storage.js";
import funcCtrl from "../controllers/function.js";
import cacheCtrl from "../controllers/cache.js";
import { sendMessage } from "../init/sync.js";

/**
 * Returns all the typings of the app version
 * @param  {string} version The version object
 */
export async function getVersionTypings(version) {
	let typings = `export type ReferanceMarker = { _typeTag: "_RefMarker" };
    export type ReferenceFieldType =
        | (string & ReferanceMarker)
        | (number & ReferanceMarker);
    
    export type GenericJSON = {
        [key: string]:
            | string
            | number
            | boolean
            | null
            | GenericJSON
            | GenericJSONArray;
    };
    
    export type GenericJSONArray = GenericJSON[];
    export type JSON = GenericJSON | GenericJSONArray[];`;

	typings = `${typings}\n${await getQueueTypings(version)}`;
	typings = `${typings}\n${await getTaskTypings(version)}`;
	typings = `${typings}\n${await getStorageTypings(version)}`;
	typings = `${typings}\n${await getCacheTypings(version)}`;
	typings = `${typings}\n${await getFunctionTypings(version)}`;
	typings = `${typings}\n${await getDatabaseTypings(version)}`;

	return { "node_modules/@agnost/server/dist/utils/specifics.d.ts": typings };
}

/**
 * Returns the message queue typings
 * @param  {string} version The version object
 */
async function getQueueTypings(version) {
	const list = await queueCtrl.getManyByQuery({ versionId: version._id });
	if (list.length === 0) return "export type QueueName = string;";
	else
		return `export type QueueName = ${list
			.map((entry) => `"${entry.name}"`)
			.join(" | ")};`;
}

/**
 * Returns the task (cron job) typings
 * @param  {string} version The version object
 */
async function getTaskTypings(version) {
	const list = await taskCtrl.getManyByQuery({ versionId: version._id });
	if (list.length === 0) return "export type TaskName = string;";
	else
		return `export type TaskName = ${list
			.map((entry) => `"${entry.name}"`)
			.join(" | ")};`;
}

/**
 * Returns the storage typings
 * @param  {string} version The version object
 */
async function getStorageTypings(version) {
	const list = await storageCtrl.getManyByQuery({ versionId: version._id });
	if (list.length === 0) return "export type StorageName = string;";
	else
		return `export type StorageName = ${list
			.map((entry) => `"${entry.name}"`)
			.join(" | ")};`;
}

/**
 * Returns the cache typings
 * @param  {string} version The version object
 */
async function getCacheTypings(version) {
	const list = await cacheCtrl.getManyByQuery({ versionId: version._id });
	if (list.length === 0) return "export type CacheName = string;";
	else
		return `export type CacheName = ${list
			.map((entry) => `"${entry.name}"`)
			.join(" | ")};`;
}

/**
 * Returns the function typings
 * @param  {string} version The version object
 */
async function getFunctionTypings(version) {
	const list = await funcCtrl.getManyByQuery({ versionId: version._id });
	if (list.length === 0) return "export type FunctionName = string;";
	else
		return `export type FunctionName = ${list
			.map((entry) => `"${entry.name}"`)
			.join(" | ")};`;
}

/**
 * Returns the database typings
 * @param  {string} version The version object
 */
async function getDatabaseTypings(version) {
	const dbs = await getDatabases(version);

	// Firt flatten the model fields and pre-process them for type generation
	for (const db of dbs) {
		for (const model of db.models) {
			preProcessModel(model, db.models);
		}
	}

	if (dbs.length === 0) {
		let result = `\nexport type DatabaseName = string;`;
		result = `${result}\nexport type ModelType<
		D extends DatabaseName,
		T extends ModelList<D>,
	> = never;`;
		result = `${result}\nexport type ModelTypeHierarchy<
		D extends DatabaseName,
		T extends ModelList<D>,
	> = never;`;
		result = `${result}\nexport type FTSFields<
	D extends DatabaseName,
	T extends ModelList<D>,
> = never;`;

		return result;
	}

	// Create typings for database names
	let databaseNames = `export type DatabaseName = ${dbs
		.map((value) => `"${value.name}"`)
		.join(" | ")};`;

	// Create typings for model list
	let modelListTypings = `export type ModelList<D extends DatabaseName> =`;
	for (const db of dbs) {
		modelListTypings = `${modelListTypings}\nD extends "${db.name}" ? ${
			db.models.length > 0
				? `${db.models.map((value) => `"${value.name}"`).join(" | ")}`
				: "string"
		} :`;
	}
	modelListTypings = `${modelListTypings}\nstring;`;

	// Create typings for flattened models
	const flat = [];
	for (const db of dbs) {
		flat.push(getDataBaseType(db, true));
	}

	let flatModelTypings = `export type ModelType<
	D extends DatabaseName,
	T extends ModelList<D>,
> = ${flat.join("\n")} {};`;

	// Create typings for hierarchical models
	const hierarchy = [];
	for (const db of dbs) {
		hierarchy.push(getDataBaseType(db, true));
	}

	let hierarchyModelTypings = `export type ModelTypeHierarchy<
	D extends DatabaseName,
	T extends ModelList<D>,
> = ${hierarchy.join("\n")} {};`;

	// Create typings for full text search fields
	const fts = [];
	for (const db of dbs) {
		const modelTypings = [];
		for (const model of db.models) {
			// We are processing the top level models at this level
			if (model.type === "model") {
				const searchableFields = getSearchableFields(model);
				if (searchableFields.length > 0)
					modelTypings.push(
						`T extends "${model.name}" ? ${searchableFields
							.map((value) => {
								if (value.flatName.startsWith('"')) return value.flatName;
								else return `"${value.flatName}"`;
							})
							.join(" | ")} : `
					);
				else modelTypings.push(`T extends "${model.name}" ? never : `);
			}
		}

		if (modelTypings.length === 0) fts.push(`D extends "${db.name}" ? never :`);
		else
			fts.push(`D extends "${db.name}" ? ${modelTypings.join("\n")} never :`);
	}

	let ftsTypings = `export type FTSFields<
	D extends DatabaseName,
	T extends ModelList<D>,
> = ${fts.join("\n")} never;`;

	return [
		databaseNames,
		modelListTypings,
		flatModelTypings,
		hierarchyModelTypings,
		ftsTypings,
	].join("\n");
}

function getDataBaseType(db, flat) {
	const typings = [];
	for (const model of db.models) {
		// We are processing the top level models at this level
		if (model.type === "model") typings.push(getModelType(model, flat));
	}

	if (typings.length === 0) return `D extends "${db.name}" ? never :`;
	else return `D extends "${db.name}" ? ${typings.join("\n")} never :`;
}

function getModelType(model, flat) {
	const typings = [];
	for (const field of model.fields) {
		typings.push(getFieldType(field, flat));
	}

	if (flat) {
		if (model.type === "model")
			return `T extends "${model.name}" ? {${typings.join("\n")}} : `;
		else return typings.join("\n");
	} else {
		if (model.type === "model")
			return `T extends "${model.name}" ? {${typings.join("\n")}} : `;
		else if (model.type === "sub-model-object")
			return `${model.name}: {${typings.join("\n")}};`;
		else return `${model.name}: Array<{${typings.join("\n")}}>;`;
	}
}

function getFieldType(field, flat) {
	const fieldName = flat ? field.flatName : field.name;
	switch (field.type) {
		case "id":
			return `${fieldName}: string | number;`;
		case "reference":
			return `${fieldName}: ReferenceFieldType;`;
		case "text":
		case "rich-text":
		case "encrypted-text":
		case "email":
		case "link":
		case "phone":
			return `${fieldName}: string;`;
		case "createdat":
		case "updatedat":
		case "datetime":
		case "date":
			return `${fieldName}: Date | string;`;
		case "time":
			return `${fieldName}: string;`;
		case "enum":
			return `${fieldName}: string;`;
		case "boolean":
			return `${fieldName}: boolean;`;
		case "integer":
		case "decimal":
			return `${fieldName}: number;`;
		case "geo-point":
			return `${fieldName}: [number, number];`;
		case "binary":
			return `${fieldName}: Buffer;`;
		case "json":
			return `${fieldName}: JSON;`;
		case "basic-values-list":
			return `${fieldName}: any[];`;
		case "object-list":
			return `${getModelType(field.targetModel, flat)}`;
		case "object":
			return `${getModelType(field.targetModel, flat)}`;
		default:
			return null;
	}
}

/**
 * Returns the databases and their associated models
 * @param  {string} versionId The version id
 */
async function getDatabases(version) {
	let databases = await dbCtrl.getManyByQuery({ versionId: version._id });
	for (const db of databases) {
		db.models = await modelCtrl.getManyByQuery({
			dbId: db._id,
			versionId: version._id,
		});
	}

	return databases;
}

/**
 * Prepares the model of the database, flattens field names and marks fields whether they are searchable or not
 * @param  {object} model The model that will be flattned
 * @param  {array} allModels All models of the database
 */
function preProcessModel(model, allModels) {
	const modelPath = getModelPath(allModels, model);

	for (const field of model.fields) {
		field.flatName = modelPath ? `"${modelPath}.${field.name}"` : field.name;
		if (field.type === "text" && field.text?.searchable)
			field.searchable = true;
		else if (field.type === "rich-text" && field.richText?.searchable)
			field.searchable = true;
		else field.searchable = false;

		if (field.type === "object")
			field.targetModel = getModel(allModels, field.object.iid);
		else if (field.type === "object-list")
			field.targetModel = getModel(allModels, field.objectList.iid);
	}
}

/**
 * Builds the model path of the model starting either from the topmost model or from the cutOffModel
 * @param  {array} models The list of database models
 * @param  {object} model The model whose path will be built
 */
function getModelPath(models, model) {
	if (model.type === "model") return null;
	else {
		let parentModel = getModel(models, model.parentiid);
		let parentPath = getModelPath(models, parentModel);
		if (parentPath) return `${parentPath}.${model.name}`;
		else return model.name;
	}
}

/**
 * Returns the model identified by its iid (internal identifier)
 * @param  {array} models The list of database models
 * @param  {string} modeliid The iid of the model to search for
 */
function getModel(models, modeliid) {
	let length = models.length;
	for (let i = 0; i < length; i++) {
		const model = models[i];
		if (model.iid === modeliid) return model;
	}

	return null;
}

/**
 * Returns the list of searchable fiels of a model
 * @param  {object} model The model whose searchable fields will be retrieved
 */
function getSearchableFields(model, list = null) {
	if (!list) list = [];
	for (const field of model.fields) {
		if (field.searchable) list.push(field);
		if (field.type === "object" || field.type === "object-list")
			getSearchableFields(field.targetModel, list);
	}

	return list;
}

export async function refreshTypings(user, version) {
	const typings = await getVersionTypings(version);
	sendMessage(version._id, {
		actor: {
			userId: user._id,
			name: user.name,
			pictureUrl: user.pictureUrl,
			color: user.color,
			loginEmail: user.loginProfiles[0].email,
			contactEmail: user.contactEmail,
		},
		action: "update",
		object: "org.app.version.typings",
		description: "Typings updated",
		timestamp: Date.now(),
		data: typings,
		identifiers: {
			orgId: version.orgId,
			appId: version.appId,
			versionId: version._id,
		},
	});
}
