import axios from "axios";
import util from "util";
import { getDBClient } from "../../init/db.js";
import { createPipeline, getKey, setKey, scanKeys, addToCache, removeFromCache } from "../../init/cache.js";
import { MongoDBManager } from "./mongoDBManager.js";
import { PostgresDBManager } from "./PostgresDBManager.js";
import { MySQLDBManager } from "./MySQLDBManager.js";
import { MsSQLDBManager } from "./MsSQLDBManager.js";
import { OracleDBManager } from "./OracleDBManager.js";
import { DATABASE } from "../../config/constants.js";
import { manageAPIServers } from "../../init/queue.js";

export class DeploymentManager {
    constructor(msgObj) {
        this.msgObj = msgObj;
        this.pipeline = null;
        this.conn = null; //MongoDB MongoClient connection
        this.envDB = null; //MongoDB DB object reference

        // Deployment operation logs
        this.logs = [];
    }

    /**
     * Returns the database object pointing to the MongoDB database of the engine cluster, which is used to store environment configuration info
     */
    getEnvDB() {
        if (!this.envDB) {
            if (!this.conn) {
                this.conn = getDBClient();
            }
            this.envDB = this.conn.db(this.getEnvId());
        }

        return this.envDB;
    }

    /**
     * Deletes the environment specific database
     */
    async dropEnvDB() {
        const db = this.getEnvDB();
        await db.dropDatabase();
        this.addLog(t("Deleted internal environment configuration database"));
    }

    /**
     * Returns the redis command pipeline if exists otherwise creates and returns a new one
     */
    clearPipeline() {
        if (this.pipeline) {
            transaction.discard((err) => {});
            this.pipeline = null;
        }
    }

    /**
     * Returns the redis command pipeline if exists otherwise creates and returns a new one
     */
    getPipeline() {
        if (this.pipeline) return this.pipeline;
        // Send multiple commands at once to redis and get back all the replies in array form in a single step
        this.pipeline = createPipeline();
        // Promisify pipleline exec method so that we can use await
        this.pipeline.exec = util.promisify(this.pipeline.exec);

        return this.pipeline;
    }

    /**
     * Stores a value in cache using the key and redis command pipeline
     * @param  {string} key Stored value key
     * @param  {any} value Stored value, if object/array passed then stringifies the value
     */
    addToCache(key, value) {
        const pipeline = this.getPipeline();
        addToCache(pipeline, key, value);
    }

    /**
     * Removes the value in cache using the key and redis command pipeline
     * @param  {string} key Removed value key
     */
    removeFromCache(key) {
        const pipeline = this.getPipeline();
        removeFromCache(pipeline, key);
    }

    /**
     * Execute all redis commands altogether
     */
    async commitPipeline() {
        await this.getPipeline().exec();
    }

    /**
     * Clear all the cached environment data
     * @param  {string} pattern The cache keys scan/search pattern
     */
    async clearCachedData(pattern) {
        //Get all environment related keys and create key deletion pipeline
        let keys = await scanKeys(pattern);
        keys.forEach((key) => {
            removeFromCache(this.getPipeline(), key);
        });
    }

    /**
     * Returns the message object
     */
    getMsgObj() {
        return this.msgObj;
    }

    /**
     * Returns the message timestamp
     */
    getTimestamp() {
        return this.msgObj.env.timestamp;
    }

    /**
     * Returns the environment object
     */
    getEnvObj() {
        return this.msgObj.env;
    }

    /**
     * Returns the list of app resources
     */
    getResources() {
        return this.msgObj.env.resources || [];
    }

    /**
     * Returns the resource mappings
     */
    getResourceMappings() {
        return this.msgObj.env.mappings || [];
    }

    /**
     * Returns the environment iid (internal identifier)
     */
    getEnvId() {
        return this.getEnvObj().iid;
    }

    /**
     * Returns the databases used by app version
     */
    getDatabases() {
        return this.msgObj.databases || [];
    }

    /**
     * Returns the database object identifier
     * @param  {object} db The database json object
     */
    getDbId(db) {
        return db.iid;
    }

    /**
     * Only valid for undeploy operations, returns true if the user has selected to drop the data during undeployment
     */
    isDataDropped() {
        return this.msgObj.dropData ?? true;
    }

    /**
     * Returns the endpoints of the input message
     */
    getEndpoints() {
        return this.msgObj.endpoints || [];
    }

    /**
     * Returns the middlewares of the input message
     */
    getMiddlewares() {
        return this.msgObj.middlewares || [];
    }

    /**
     * Returns the functions of the input message
     */
    getFunctions() {
        return this.msgObj.functions || [];
    }

    /**
     * Returns the queues of the input message
     */
    getQueues() {
        return this.msgObj.queues || [];
    }

    /**
     * Returns the tasks of the input message
     */
    getTasks() {
        return this.msgObj.tasks || [];
    }

    /**
     * Returns the storages of the input message
     */
    getStorages() {
        return this.msgObj.storages || [];
    }

    /**
     * Returns the caches of the input message
     */
    getCaches() {
        return this.msgObj.caches || [];
    }

    /**
     * Returns the sub-action of the message
     */
    getSubAction() {
        return this.msgObj.subAction;
    }

    /**
     * Returns the udpated resource object (only valid when handling resource access setting updates)
     */
    getUpdatedResource() {
        return this.msgObj.updatedResource;
    }

    /**
     * Returns the database resource object mapped to the database design
     */
    getDatabaseResource(dbConfig) {
        const mappings = this.getResourceMappings();
        const mapping = mappings.find((entry) => entry.design.iid === dbConfig.iid);
        // We have the mapping return the corresponding resource
        if (mapping) {
            const resource = this.getResources().find((entry) => entry.iid === mapping.resource.iid);

            return resource;
        }

        return null;
    }

    /**
     * Adds a log message to track the progress of deployment operations
     * @param  {string} message Logged message
     * @param  {string} status Whether the operation has completed successfully or with errors
     */
    addLog(message, status = "OK") {
        let dtm = new Date();
        let duration = 0;
        if (this.prevDtm) {
            duration = dtm - this.prevDtm;
        }

        this.logs.push({
            startedAt: dtm,
            duration: duration,
            status,
            message,
        });

        logger.info(`${message} (${duration}ms)`);
        this.prevDtm = dtm;
    }

    /**
     * Updates the environment status and logs in platform
     * @param  {string} status Final environment status
     */
    async sendEnvironmentLogs(status = "OK") {
        // If there is no callback just return
        if (!this.msgObj.callback) return;

        try {
            // Update the environment log object
            await axios.post(
                this.msgObj.callback,
                {
                    status,
                    logs: this.logs,
                    type: "db",
                },
                {
                    headers: {
                        Authorization: process.env.MASTER_TOKEN,
                        "Content-Type": "application/json",
                    },
                }
            );
        } catch (err) {}
    }

    /**
     * Sets the environment status while the deployment operation is running
     * @param  {string} status New environment status
     */
    async setStatus(status) {
        await setKey(`${this.getEnvId()}.status`, status);
    }

    /**
     * Loads application databases to the cache
     */
    async loadDatabases() {
        const databases = this.getDatabases();
        for (let i = 0; i < databases.length; i++) {
            const db = databases[i];
            await this.processModels(db);

            // Add databases and its associated models to the cache
            this.addToCache(`${this.getEnvId()}.db.${this.getDbId(db)}`, db);
            this.addLog(t("Loaded and cached '%s' database '%s' and its associated models", db.type, db.name));
        }
    }

    /**
     * Processes the database models before caching them in Redis
     * @param  {object} db The databae object
     */
    async processModels(db) {
        const models = db.models;
        for (let i = 0; i < models.length; i++) {
            const model = models[i];
            // Sort model fields by their order, system created fields have precedence, since we might need to access _id fields
            // during POST requests for parent object, we shoul have the _id values created before other fields not to face any issues
            model.fields.sort(function (a, b) {
                if (a.creator === "system" && b.creator === "user") return -1;
                else if (a.creator === "user" && b.creator === "system") return 1;
                else if (a.creator === "system" && b.creator === "system") return 0;
                else return a.order - b.order;
            });

            for (let j = 0; j < model.fields.length; j++) {
                const field = model.fields[j];
                // Create query path of the field starting from the topmost model
                field.queryPath = this.getFieldPath(models, model, field.name);
                // Unwinded query path is used to delete or rename fields deep in a document hierarchy with multiple levels of sub-object arrays
                field.unwindQueryPath = this.getUnwindFieldPath(models, model, field.name);
            }

            // This is valid mainly for no-sql databases, creates the parent hierarchy if any
            model.parentHierarchy = this.createParentHierarchy(models, model);
            // Create query path of model starting from the topmost model
            model.queryPath = this.getModelPath(models, model);
            // Assign the schema name of the model
            model.schema = this.getModelSchema(model.schemaiid, db);
        }
    }

    /**
     * Returns the model identified by its iid (internal identifier)
     * @param  {array} models The list of database models
     * @param  {string} modeliid The iid of the model to search for
     */
    getModel(models, modeliid) {
        let length = models.length;
        for (let i = 0; i < length; i++) {
            const model = models[i];
            if (model.iid === modeliid) return model;
        }

        return null;
    }

    /**
     * Builds the model path of the model starting either from the topmost model or from the cutOffModel
     * @param  {array} models The list of database models
     * @param  {object} model The model whose path will be built
     * @param  {object} cutOffModel The top level model where the model path will be based on
     */
    getModelPath(models, model, cutOffModel = null) {
        if (model.type === "model") return null;
        else if (cutOffModel && cutOffModel.iid === model.iid) return null;
        else {
            let parentModel = this.getModel(models, model.parentiid);
            let parentPath = this.getModelPath(models, parentModel, cutOffModel);
            if (parentPath) return parentPath + "." + model.name;
            else return model.name;
        }
    }

    /**
     * Returns the schema name of the model
     * @param  {string} schemaiid The iid of the schema object
     * @param  {object} db The database object
     */
    getModelSchema(schemaiid, db) {
        const schema = db.schemas?.find((entry) => entry.iid === schemaiid);

        if (schema) return schema.name;
        return null;
    }

    /**
     * Builds the model path of the model starting either from the topmost model or from the cutOffModel taking into consideration
     * sub-object lists in the overall path. This path is many used to delete or rename fields deep in a document hierarchy
     * @param  {array} models The list of database models
     * @param  {object} model The model whose path will be built
     * @param  {object} cutOffModel The top level model where the model path will be based on
     */
    getUnwindModelPath(models, model, cutOffModel = null) {
        if (model.type === "model") return null;
        else if (cutOffModel && cutOffModel.iid === model.iid) return null;
        else {
            let parentModel = this.getModel(models, model.parentiid);
            let parentPath = this.getUnwindModelPath(models, parentModel, cutOffModel);
            if (parentPath) {
                if (model.type === "sub-model-list") return parentPath + "." + model.name + ".$[]";
                else return parentPath + "." + model.name;
            } else {
                if (model.type === "sub-model-list") return model.name + ".$[]";
                else return model.name;
            }
        }
    }

    /**
     * Builds the field path of the field starting either from the topmost model or from the cutOffModel
     * @param  {array} models The list of database models
     * @param  {object} model The model of which holds the field
     * @param  {string} fieldName The name of the field
     * @param  {object} cutOffModel The top level model where the field path will be based on
     */
    getFieldPath(models, model, fieldName, cutOffModel = null) {
        let modelPath = this.getModelPath(models, model, cutOffModel);
        if (modelPath) return modelPath + "." + fieldName;
        else return fieldName;
    }

    /**
     * Builds the field path of the field starting either from the topmost model or from the cutOffModel taking into consideration
     * sub-object lists in the overall path. This path is many used to delete or rename fields deep in a document hierarchy
     * @param  {array} models The list of database models
     * @param  {object} model The model of which holds the field
     * @param  {string} fieldName The name of the field
     * @param  {object} cutOffModel The top level model where the field path will be based on
     */
    getUnwindFieldPath(models, model, fieldName, cutOffModel = null) {
        let modelPath = this.getUnwindModelPath(models, model, cutOffModel);
        if (modelPath) return modelPath + "." + fieldName;
        else return fieldName;
    }

    /**
     * Builds the parent model hierarchy of the model
     * @param  {array} models The list of database models
     * @param  {object} model The model whose parent hierarchy will be built
     * @param  {object} hierarchyList The hierarchy list array
     */
    createParentHierarchy(models, model, hierarchyList = null) {
        if (hierarchyList === null) hierarchyList = [];

        hierarchyList.unshift({
            name: model.name,
            iid: model.iid,
            cname: this.getDbModelName(models, model),
            type: model.type,
            queryPath: this.getModelPath(models, model),
        });

        if (model.type === "model") return hierarchyList;

        let parentModel = this.getModel(models, model.parentiid);
        if (parentModel) {
            return this.createParentHierarchy(models, parentModel, hierarchyList);
        } else return hierarchyList;
    }

    /**
     * Returns the table/collection name of the model that will be used to store the
     * @param  {array} models The list of database models
     * @param  {object} model The model whose table/collection name is returned
     */
    getDbModelName(models, model) {
        if (model.type === "model") return model.name;
        else {
            let parentModel = this.getModel(models, model.parentiid);
            return this.getDbModelName(models, parentModel);
        }
    }

    /**
     * Create application specific configuration and log collections
     */
    async createInternalCollections() {
        const db = this.getEnvDB();
        const collections = await db.collections();

        await this.creteStorageInfoCollection(collections);
        await this.createMessageInfoCollection(collections);
        await this.createCronInfoCollection(collections);
        await this.createEndopintLogsCollection(collections);
        await this.createMessageQueueLogsCollection(collections);
        await this.createCronJobLogsCollection(collections);
    }

    /**
     * Creates the environment specific app storage file and bucket metadata info collections
     * @param  {array} collections The list of mongodb collections of the environment database
     */
    async creteStorageInfoCollection(collections) {
        const db = this.getEnvDB();
        const length = collections.length;
        // Check for file storage info
        let collection = null;
        for (let i = 0; i < length; i++) {
            const item = collections[i];
            if (item.collectionName === "files") collection = item;
        }

        // Collection has not created yet let's create it
        if (!collection) {
            collection = await db.createCollection("files");
            // Create all required indices
            await collection.createIndexes([
                {
                    key: { id: 1 },
                },
                {
                    key: { path: 1 },
                },
                {
                    key: { bucketId: 1 },
                },
                {
                    key: { storageId: 1 },
                },
                {
                    key: { isPublic: 1 },
                },
                {
                    key: { size: 1 },
                },
                {
                    key: { mimeType: 1 },
                },
                {
                    key: { uploadedAt: 1 },
                },
                {
                    key: { updatedAt: 1 },
                },
                {
                    key: { userId: 1 },
                },
                {
                    key: { tags: 1 },
                    sparse: true,
                },
            ]);

            this.addLog(t("Created file storage info collection"));
        }

        // Check for bucket info
        let collection2 = null;
        for (let i = 0; i < length; i++) {
            const item = collections[i];
            if (item.collectionName === "buckets") collection2 = item;
        }
        // Collection has not created yet let's create it
        if (!collection2) {
            collection2 = await db.createCollection("buckets");
            //Create all required indices
            await collection2.createIndexes([
                {
                    key: { id: 1 },
                },
                {
                    key: { storageId: 1 },
                },
                {
                    key: { name: 1 },
                },
                {
                    key: { isPublic: 1 },
                },
                {
                    key: { createdAt: 1 },
                },
                {
                    key: { updatedAt: 1 },
                },
                {
                    key: { userId: 1 },
                },
                {
                    key: { tags: 1 },
                    sparse: true,
                },
            ]);

            this.addLog(t("Created bucket storage info collection"));
        }
    }

    /**
     * Creates the environment specific message metadata collection that are submitted to a queue
     * @param  {array} collections The list of mongodb collections of the environment database
     */
    async createMessageInfoCollection(collections) {
        const db = this.getEnvDB();
        const length = collections.length;
        let collection = null;
        for (let i = 0; i < length; i++) {
            const item = collections[i];
            if (item.collectionName === "messages") collection = item;
        }

        // Collection has not created yet let's create it
        if (!collection) {
            collection = await db.createCollection("messages");
            // Create all required indices (we also keep queueName, delay and errors fields but they are not indexed)
            await collection.createIndexes([
                {
                    key: { trackingId: 1 },
                },
                {
                    key: { queueId: 1 },
                },
                {
                    key: { status: 1 },
                },
                {
                    key: { startedAt: 1 },
                },
                {
                    key: { completedAt: 1 },
                },
                {
                    key: { delay: 1 },
                },
            ]);

            // Delete records after 1 week
            await collection.createIndex({ submittedAt: 1 }, { expireAfterSeconds: helper.constants["1week"] });

            this.addLog(t("Created message info collection"));
        }
    }

    /**
     * Creates the environment specific cron job metadata collection that are triggered by a cron schedule
     * @param  {array} collections The list of mongodb collections of the environment database
     */
    async createCronInfoCollection(collections) {
        const db = this.getEnvDB();
        let length = collections.length;
        let collection = null;
        for (let i = 0; i < length; i++) {
            const item = collections[i];
            if (item.collectionName === "cronjobs") collection = item;
        }

        // Collection has not created yet let's create it
        if (!collection) {
            collection = await db.createCollection("cronjobs");
            //C reate all required indices (we also keep taskName and errors fields but they are not indexed)
            await collection.createIndexes([
                {
                    key: { trackingId: 1 },
                },
                {
                    key: { cronJobId: 1 },
                },
                {
                    key: { status: 1 },
                },
                {
                    key: { startedAt: 1 },
                },
                {
                    key: { completedAt: 1 },
                },
            ]);

            // Delete records after 1 week
            await collection.createIndex({ triggeredAt: 1 }, { expireAfterSeconds: helper.constants["1week"] });

            this.addLog(t("Created cron job info collection"));
        }
    }

    /**
     * Creates the environment specific endpoint logs collection. Endpoint logs will include the following fields
     * timestamp, endpointPath, method, status, duration, envId, orgId, appId, versionId, endpointId, params, query,
     * body, headers, cookies, files, response
     * @param  {array} collections The list of mongodb collections of the environment database
     */
    async createEndopintLogsCollection(collections) {
        const db = this.getEnvDB();
        let length = collections.length;
        let collection = null;
        for (let i = 0; i < length; i++) {
            const item = collections[i];
            if (item.collectionName === "endpoint_logs") collection = item;
        }

        // Collection has not created yet let's create it
        if (!collection) {
            collection = await db.createCollection("endpoint_logs");
            //C reate all required indices
            await collection.createIndexes([
                {
                    key: { path: 1 },
                },
                {
                    key: { method: 1 },
                },
                {
                    key: { status: 1 },
                },
                {
                    key: { duration: 1 },
                },
                {
                    key: { orgId: 1 },
                },
                {
                    key: { appId: 1 },
                },
                {
                    key: { versionId: 1 },
                },
                {
                    key: { envId: 1 },
                },
                {
                    key: { endpointId: 1 },
                },
            ]);

            // Delete records after 1 week
            await collection.createIndex({ timestamp: 1 }, { expireAfterSeconds: helper.constants["6months"] });

            this.addLog(t("Created endpoint execution logs collection"));
        }
    }

    /**
     * Creates the environment specific message queue logs collection. Message queue logs will include the following fields
     * timestamp, queue (name), status, duration, envId, orgId, appId, versionId, queueId, message (payload), result
     * @param  {array} collections The list of mongodb collections of the environment database
     */
    async createMessageQueueLogsCollection(collections) {
        const db = this.getEnvDB();
        let length = collections.length;
        let collection = null;
        for (let i = 0; i < length; i++) {
            const item = collections[i];
            if (item.collectionName === "queue_logs") collection = item;
        }

        // Collection has not created yet let's create it
        if (!collection) {
            collection = await db.createCollection("queue_logs");
            //C reate all required indices
            await collection.createIndexes([
                {
                    key: { name: 1 },
                },
                {
                    key: { status: 1 },
                },
                {
                    key: { duration: 1 },
                },
                {
                    key: { orgId: 1 },
                },
                {
                    key: { appId: 1 },
                },
                {
                    key: { versionId: 1 },
                },
                {
                    key: { envId: 1 },
                },
                {
                    key: { queueId: 1 },
                },
            ]);

            // Delete records after 1 week
            await collection.createIndex({ timestamp: 1 }, { expireAfterSeconds: helper.constants["6months"] });

            this.addLog(t("Created message queue execution logs collection"));
        }
    }

    /**
     * Creates the environment specific cron job logs collection. Cron job logs will include the following fields
     * timestamp, task (name), status, duration, envId, orgId, appId, versionId, taskId, result
     * @param  {array} collections The list of mongodb collections of the environment database
     */
    async createCronJobLogsCollection(collections) {
        const db = this.getEnvDB();
        let length = collections.length;
        let collection = null;
        for (let i = 0; i < length; i++) {
            const item = collections[i];
            if (item.collectionName === "cronjob_logs") collection = item;
        }

        // Collection has not created yet let's create it
        if (!collection) {
            collection = await db.createCollection("cronjob_logs");
            //C reate all required indices
            await collection.createIndexes([
                {
                    key: { name: 1 },
                },
                {
                    key: { status: 1 },
                },
                {
                    key: { duration: 1 },
                },
                {
                    key: { appId: 1 },
                },
                {
                    key: { versionId: 1 },
                },
                {
                    key: { envId: 1 },
                },
                {
                    key: { taskId: 1 },
                },
            ]);

            // Delete records after 1 week
            await collection.createIndex({ timestamp: 1 }, { expireAfterSeconds: helper.constants["6months"] });

            this.addLog(t("Created cron job execution logs collection"));
        }
    }

    /**
     * Creates or updates the database schema in the target database
     * @param {"deploy"|"redeploy"} type
     */
    async prepareDatabases(type) {
        const databases = this.getDatabases();
        for (let i = 0; i < databases.length; i++) {
            const db = databases[i];
            // We only process databases managed by the platform
            if (!db.managed) continue;

            this.addLog(t("Started preparing database schema for '%s' database '%s'", db.type, db.name));

            // Load the previous database configuration if there is any
            let prevConfig = await this.getPrevDBDefinition(db);
            let dbManager = this.createDBManager(db, prevConfig);
            dbManager.setType(type);

            await dbManager.beginSession();
            await dbManager.createDatabase();
            await dbManager.manageModels();
            await dbManager.endSession();

            this.addLog(t("Completed preparing '%s' database '%s' schema and its associated models", db.type, db.name));
        }

        // Iterate over the previous db configurations and drop deleted databases
        let prevConfig = await this.getPrevDBDefinitions();
        for (let i = 0; i < prevConfig.length; i++) {
            const prevdbConfig = prevConfig[i];
            // Check if this database exists in the new configuration or not
            const newdbConfig = databases.find((entry) => entry.iid === prevdbConfig.iid);
            if (newdbConfig) continue;
            else if (prevdbConfig.managed) {
                let dbManager = this.createDBManager(prevdbConfig, prevdbConfig);
                await dbManager.beginSession();
                await dbManager.dropDatabase();
                await dbManager.endSession();
            }
        }
    }

    /**
     * Creates or updates the database schema in the target database
     * @param {"deploy"|"redeploy"} type
     */
    async prepareDatabasesForUpdates(type) {
        const databases = this.getDatabases();
        for (let i = 0; i < databases.length; i++) {
            const db = databases[i];
            // We only process databases managed by the platform
            if (!db.managed) continue;

            this.addLog(t("Started preparing database schema for '%s' database '%s'", db.type, db.name));

            // Load the previous database configuration if there is any
            let prevConfig = await this.getPrevDBDefinition(db);
            let dbManager = this.createDBManager(db, prevConfig);
            dbManager.setType(type);

            await dbManager.beginSession();
            await dbManager.createDatabase();
            await dbManager.manageModels();
            await dbManager.endSession();

            this.addLog(t("Completed preparing '%s' database '%s' schema and its associated models", db.type, db.name));
        }
    }

    /**
     * Deletes the managed databases and data stored in these databases. Since the database is being deleted we do not have the resource associated with the database for this reason we need to get the resource from the previous db configuration
     */
    async deleteManagedDatabases(dbsToDelete) {
        let prevConfig = await this.getPrevDBDefinitions();
        for (let i = 0; i < dbsToDelete.length; i++) {
            const db = dbsToDelete[i];
            // We only process databases managed by the platform
            if (!db.managed) continue;

            const prevDb = prevConfig.find((entry) => entry.iid === db.iid);

            this.addLog(t("Started deleting %s database %s", db.type, db.name));
            let dbManager = this.createDBManager(db, prevDb);

            await dbManager.beginSession();
            await dbManager.dropDatabase();
            await dbManager.endSession();

            this.addLog(t("Completed deleting '%s' database '%s'", db.type, db.name));
        }
    }

    /**
     * Deletes all managed databases and data stored in these databases
     */
    async dropDatabases() {
        const databases = await this.getPrevDBDefinitions();
        for (let i = 0; i < databases.length; i++) {
            const db = databases[i];
            // We only process databases managed by the platform
            if (!db.managed) continue;

            this.addLog(t("Started deleting %s database %s", db.type, db.name));
            let dbManager = this.createDBManager(db, db);

            await dbManager.beginSession();
            await dbManager.dropDatabase();
            await dbManager.endSession();

            this.addLog(t("Completed deleting '%s' database '%s'", db.type, db.name));
        }
    }

    /**
     * Create a new database schema manager
     * @param  {object} dbConfig The database json configuration object
     * @param  {object} prevConfig The database json object for the previous configuration
     */
    createDBManager(dbConfig, prevConfig) {
        // Assign the database server resource
        const resource = this.getDatabaseResource(dbConfig);
        dbConfig.resource = resource;
        // During delete database operation we do not send the database resource mapping since it is deleted for this reason
        // in such cases we need to use the previous config resource information
        if (!dbConfig.resource) dbConfig.resource = prevConfig.resource;

        switch (dbConfig.type) {
            case DATABASE.MongoDB:
                return new MongoDBManager(this.getEnvObj(), dbConfig, prevConfig, (message, status) =>
                    this.addLog(message, status)
                );
            case DATABASE.PostgreSQL:
                return new PostgresDBManager(this.getEnvObj(), dbConfig, prevConfig, (message, status) =>
                    this.addLog(message, status)
                );
            case DATABASE.MySQL:
                return new MySQLDBManager(this.getEnvObj(), dbConfig, prevConfig, (message, status) =>
                    this.addLog(message, status)
                );
            case DATABASE.SQLServer:
                return new MsSQLDBManager(this.getEnvObj(), dbConfig, prevConfig, (message, status) =>
                    this.addLog(message, status)
                );
            case DATABASE.Oracle:
                return new OracleDBManager(this.getEnvObj(), dbConfig, prevConfig, (message, status) =>
                    this.addLog(message, status)
                );
            default:
                throw new AgnostError(t("Unsupported database type '%s'", dbConfig.type));
        }
    }

    /**
     * Gets the existing (previous) database information from environment database
     * We do not use cache since cache is already updated with new configuration info and we specifially would like to get the previous config from the database which also includes the resource data of the database
     * @param  {object} db The database json object
     */
    async getPrevDBDefinition(dbJson) {
        // Database configuration is not in the cache, load it from the database
        const engineDb = this.getEnvDB();
        const db = await engineDb.collection("databases").findOne({ iid: dbJson.iid });
        if (db) return db;

        return null;
    }

    /**
     * Gets all existing database configurations from environment database.
     * We do not use cache since cache is already updated with new configuration info and we specifially would like to get the previous config from the database which also includes the resource data for each database
     */
    async getPrevDBDefinitions() {
        // Database configuration is not in the cache, load it from the database
        const engineDb = this.getEnvDB();
        const cursor = await engineDb.collection("databases").find({});
        const databases = await cursor.toArray();
        await cursor.close();

        return databases ?? [];
    }

    /**
     * Gets all existing endpoint configurations from the cache.
     */
    async getPrevEndpointDefinitions() {
        let endpoints = await getKey(`${this.getEnvId()}.endpoints`);
        return endpoints ?? [];
    }

    /**
     * Gets all existing middleware configurations from the cache.
     */
    async getPrevMiddlewareDefinitions() {
        let middlewares = await getKey(`${this.getEnvId()}.middlewares`);
        return middlewares ?? [];
    }

    /**
     * Gets all existing function configurations from the cache.
     */
    async getPrevFunctionDefinitions() {
        let functions = await getKey(`${this.getEnvId()}.functions`);
        return functions ?? [];
    }

    /**
     * Gets all existing queue configurations from the cache.
     */
    async getPrevQueueDefinitions() {
        let queues = await getKey(`${this.getEnvId()}.queues`);
        return queues ?? [];
    }

    /**
     * Gets all existing task configurations from the cache.
     */
    async getPrevTaskDefinitions() {
        let tasks = await getKey(`${this.getEnvId()}.tasks`);
        return tasks ?? [];
    }

    /**
     * Gets all existing storage configurations from the cache.
     */
    async getPrevStorageDefinitions() {
        let storages = await getKey(`${this.getEnvId()}.storages`);
        return storages ?? [];
    }

    /**
     * Gets all existing cache configurations from the cache.
     */
    async getPrevCacheDefinitions() {
        let caches = await getKey(`${this.getEnvId()}.caches`);
        return caches ?? [];
    }

    /**
     * Save new deployment configuration to the engine cluster database
     */
    async saveDeploymentConfig() {
        const engineDb = this.getEnvDB();
        // Delete old configuration
        await engineDb.collection("environment").deleteMany({});
        await engineDb.collection("databases").deleteMany({});
        await engineDb.collection("endpoints").deleteMany({});
        await engineDb.collection("middlewares").deleteMany({});
        await engineDb.collection("queues").deleteMany({});
        await engineDb.collection("tasks").deleteMany({});
        await engineDb.collection("storages").deleteMany({});
        await engineDb.collection("caches").deleteMany({});
        await engineDb.collection("functions").deleteMany({});

        // Save environment and version information
        await engineDb.collection("environment").insertOne(this.getEnvObj());
        // We should have records to insert into database if not mongodb raises an error
        if (this.getDatabases().length > 0) await engineDb.collection("databases").insertMany(this.getDatabases());

        if (this.getEndpoints().length > 0) await engineDb.collection("endpoints").insertMany(this.getEndpoints());

        if (this.getMiddlewares().length > 0)
            await engineDb.collection("middlewares").insertMany(this.getMiddlewares());

        if (this.getQueues().length > 0) await engineDb.collection("queues").insertMany(this.getQueues());

        if (this.getTasks().length > 0) await engineDb.collection("tasks").insertMany(this.getTasks());

        if (this.getStorages().length > 0) await engineDb.collection("storages").insertMany(this.getStorages());

        if (this.getCaches().length > 0) await engineDb.collection("caches").insertMany(this.getCaches());

        if (this.getFunctions().length > 0) await engineDb.collection("functions").insertMany(this.getFunctions());

        this.addLog("Saved deployment configuration to database");
    }

    /**
     * Save the database configurations to the engine cluster database
     */
    async saveDatabaseDeploymentConfigs(databases) {
        const engineDb = this.getEnvDB();
        // First clear any existing configuration
        await engineDb.collection("databases").deleteMany({});
        if (databases.length > 0) await engineDb.collection("databases").insertMany(databases);

        this.addLog("Saved database configurations to environment database");
    }

    /**
     * Save the endpoint configurations to the engine cluster database
     */
    async saveEndpointDeploymentConfigs(endpoints) {
        const engineDb = this.getEnvDB();
        // First clear any existing configuration
        await engineDb.collection("endpoints").deleteMany({});
        if (endpoints.length > 0) await engineDb.collection("endpoints").insertMany(endpoints);

        this.addLog("Saved endpoint configurations to environment database");
    }

    /**
     * Save the middleware configurations to the engine cluster database
     */
    async saveMiddlewareDeploymentConfigs(middlewares) {
        const engineDb = this.getEnvDB();
        // First clear any existing configuration
        await engineDb.collection("middlewares").deleteMany({});
        if (middlewares.length > 0) await engineDb.collection("middlewares").insertMany(middlewares);

        this.addLog("Saved middleware configurations to environment database");
    }

    /**
     * Save the function configurations to the engine cluster database
     */
    async saveFunctionDeploymentConfigs(functions) {
        const engineDb = this.getEnvDB();
        // First clear any existing configuration
        await engineDb.collection("functions").deleteMany({});
        if (functions.length > 0) await engineDb.collection("functions").insertMany(functions);

        this.addLog("Saved function configurations to environment database");
    }

    /**
     * Save the queue configurations to the engine cluster database
     */
    async saveQueueDeploymentConfigs(queues) {
        const engineDb = this.getEnvDB();
        // First clear any existing configuration
        await engineDb.collection("queues").deleteMany({});
        if (queues.length > 0) await engineDb.collection("queues").insertMany(queues);

        this.addLog("Saved queue configurations to environment database");
    }

    /**
     * Save the task configurations to the engine cluster database
     */
    async saveTaskDeploymentConfigs(tasks) {
        const engineDb = this.getEnvDB();
        // First clear any existing configuration
        await engineDb.collection("tasks").deleteMany({});
        if (tasks.length > 0) await engineDb.collection("tasks").insertMany(tasks);

        this.addLog("Saved tasks configurations to environment database");
    }

    /**
     * Save the storage configurations to the engine cluster database
     */
    async saveStorageDeploymentConfigs(storages) {
        const engineDb = this.getEnvDB();
        // First clear any existing configuration
        await engineDb.collection("storages").deleteMany({});
        if (storages.length > 0) await engineDb.collection("storages").insertMany(storages);

        this.addLog("Saved storage configurations to environment database");
    }

    /**
     * Save the cache configurations to the engine cluster database
     */
    async saveCacheDeploymentConfigs(caches) {
        const engineDb = this.getEnvDB();
        // First clear any existing configuration
        await engineDb.collection("caches").deleteMany({});
        if (caches.length > 0) await engineDb.collection("caches").insertMany(caches);

        this.addLog("Saved cache configurations to environment database");
    }

    /**
     * Save new deployment configuration to the engine cluster database
     */
    async saveEnvironmentDeploymentConfig() {
        const engineDb = this.getEnvDB();
        // Delete old configuration
        await engineDb.collection("environment").deleteMany({});

        // Save environment and version information
        await engineDb.collection("environment").insertOne(this.getEnvObj());

        this.addLog("Saved deployment configuration to database");
    }

    /**
     * Delete logs and tracking entries
     */
    async deleteLogsAndTrackingEntries(type, objects) {
        const engineDb = this.getEnvDB();

        if (type === "endpoint") {
            const ids = objects.map((entry) => entry._id);
            await engineDb
                .collection("endpoint_logs")
                .deleteMany({ endpointId: { $in: ids } }, { writeConcern: { w: 0 } });
        } else if (type === "queue") {
            const ids = objects.map((entry) => entry._id);
            await engineDb.collection("queue_logs").deleteMany({ queueId: { $in: ids } }, { writeConcern: { w: 0 } });

            const iids = objects.map((entry) => entry.iid);
            await engineDb.collection("messages").deleteMany({ queueId: { $in: iids } }, { writeConcern: { w: 0 } });
        } else if (type === "task") {
            const ids = objects.map((entry) => entry._id);
            await engineDb.collection("cronjob_logs").deleteMany({ taskId: { $in: ids } }, { writeConcern: { w: 0 } });

            const iids = objects.map((entry) => entry.iid);
            await engineDb.collection("cronjobs").deleteMany({ taskId: { $in: iids } }, { writeConcern: { w: 0 } });
        }

        this.addLog(`Cleared ${type} logs and tracking entries`);
    }

    /**
     * Caches the application version design data
     */
    async cacheMetadata() {
        this.cacheDatabases(this.getDatabases(), "set");
        this.cacheEndpoints(this.getEndpoints(), "set");
        this.cacheMiddlewares(this.getMiddlewares(), "set");
        this.cacheQueues(this.getQueues(), "set");
        this.cacheTasks(this.getTasks(), "set");
        this.cacheStorages(this.getStorages(), "set");
        this.cacheFunctions(this.getFunctions(), "set");
        this.cacheCaches(this.getCaches(), "set");

        this.addLog(t("Cached application metadata"));
    }

    /**
     * Caches the database metadata of the app version and returns the latest databases cache data
     * @param  {Array} databases The list of databases data to cache
     * @param  {String} actionType The action type can be either set, udpate or delete
     */
    async cacheDatabases(databases, actionType) {
        switch (actionType) {
            case "set":
                this.addToCache(`${this.getEnvId()}.databases`, databases);
                return databases;
            case "add": {
                const prevDbDefinitions = await this.getPrevDBDefinitions();
                prevDbDefinitions.push(...databases);
                this.addToCache(`${this.getEnvId()}.databases`, prevDbDefinitions);
                return prevDbDefinitions;
            }
            case "update": {
                const prevDbDefinitions = await this.getPrevDBDefinitions();

                if (prevDbDefinitions.length === 0) {
                    this.addToCache(`${this.getEnvId()}.databases`, databases);
                    return databases;
                } else {
                    const updatedDbDefinitions = prevDbDefinitions.map((entry) => {
                        const updatedDb = databases.find((entry2) => entry2.iid === entry.iid);

                        if (updatedDb) return updatedDb;
                        else return entry;
                    });

                    this.addToCache(`${this.getEnvId()}.databases`, updatedDbDefinitions);

                    return updatedDbDefinitions;
                }
            }
            case "delete": {
                const prevDbDefinitions = await this.getPrevDBDefinitions();
                const updatedDbDefinitions = prevDbDefinitions.filter(
                    (entry) => !databases.find((entry2) => entry.iid === entry2.iid)
                );
                this.addToCache(`${this.getEnvId()}.databases`, updatedDbDefinitions);

                return updatedDbDefinitions;
            }
            default:
                break;
        }
    }

    /**
     * Caches the endpoint metadata of the app version
     * @param  {Array} endpoints The list of endpoints data to cache
     * @param  {String} actionType The action type can be either set, udpate or delete
     */
    async cacheEndpoints(endpoints, actionType) {
        switch (actionType) {
            case "set":
                this.addToCache(`${this.getEnvId()}.endpoints`, endpoints);
                return endpoints;
            case "add": {
                const prevEpDefinitions = await this.getPrevEndpointDefinitions();
                prevEpDefinitions.push(...endpoints);
                this.addToCache(`${this.getEnvId()}.endpoints`, prevEpDefinitions);
                return prevEpDefinitions;
            }
            case "update": {
                const prevEpDefinitions = await this.getPrevEndpointDefinitions();

                if (prevEpDefinitions.length === 0) {
                    this.addToCache(`${this.getEnvId()}.endpoints`, endpoints);
                    return endpoints;
                } else {
                    const updatedEpDefinitions = prevEpDefinitions.map((entry) => {
                        const updatedEp = endpoints.find((entry2) => entry2.iid === entry.iid);

                        if (updatedEp) return updatedEp;
                        else return entry;
                    });

                    this.addToCache(`${this.getEnvId()}.endpoints`, updatedEpDefinitions);

                    return updatedEpDefinitions;
                }
            }
            case "delete": {
                const prevEpDefinitions = await this.getPrevEndpointDefinitions();
                const updatedEpDefinitions = prevEpDefinitions.filter(
                    (entry) => !endpoints.find((entry2) => entry.iid === entry2.iid)
                );
                this.addToCache(`${this.getEnvId()}.endpoints`, updatedEpDefinitions);

                return updatedEpDefinitions;
            }
            default:
                break;
        }
    }

    /**
     * Caches the middleware metadata of the app version
     * @param  {Array} middlewares The list of middlewares data to cache
     * @param  {String} actionType The action type can be either set, udpate or delete
     */
    async cacheMiddlewares(middlewares, actionType) {
        switch (actionType) {
            case "set":
                this.addToCache(`${this.getEnvId()}.middlewares`, middlewares);
                return middlewares;
            case "add": {
                const prevMwDefinitions = await this.getPrevMiddlewareDefinitions();
                prevMwDefinitions.push(...middlewares);
                this.addToCache(`${this.getEnvId()}.middlewares`, prevMwDefinitions);
                return prevMwDefinitions;
            }
            case "update": {
                const prevMwDefinitions = await this.getPrevMiddlewareDefinitions();

                if (prevMwDefinitions.length === 0) {
                    this.addToCache(`${this.getEnvId()}.middlewares`, middlewares);
                    return middlewares;
                } else {
                    const updatedMwDefinitions = prevMwDefinitions.map((entry) => {
                        const updatedMw = middlewares.find((entry2) => entry2.iid === entry.iid);

                        if (updatedMw) return updatedMw;
                        else return entry;
                    });

                    this.addToCache(`${this.getEnvId()}.middlewares`, updatedMwDefinitions);

                    return updatedMwDefinitions;
                }
            }
            case "delete": {
                const prevMwDefinitions = await this.getPrevMiddlewareDefinitions();
                const updatedMwDefinitions = prevMwDefinitions.filter(
                    (entry) => !middlewares.find((entry2) => entry.iid === entry2.iid)
                );
                this.addToCache(`${this.getEnvId()}.middlewares`, updatedMwDefinitions);

                return updatedMwDefinitions;
            }
            default:
                break;
        }
    }

    /**
     * Caches the queue metadata of the app version
     * @param  {Array} queues The list of queues data to cache
     * @param  {String} actionType The action type can be either set, udpate or delete
     */
    async cacheQueues(queues, actionType) {
        switch (actionType) {
            case "set":
                this.addToCache(`${this.getEnvId()}.queues`, queues);
                return queues;
            case "add": {
                const prevQueueDefinitions = await this.getPrevQueueDefinitions();
                prevQueueDefinitions.push(...queues);
                this.addToCache(`${this.getEnvId()}.queues`, prevQueueDefinitions);
                return prevQueueDefinitions;
            }
            case "update": {
                const prevQueueDefinitions = await this.getPrevQueueDefinitions();

                if (prevQueueDefinitions.length === 0) {
                    this.addToCache(`${this.getEnvId()}.queues`, queues);
                    return queues;
                } else {
                    const updatedQueueDefinitions = prevQueueDefinitions.map((entry) => {
                        const updatedQueue = queues.find((entry2) => entry2.iid === entry.iid);

                        if (updatedQueue) return updatedQueue;
                        else return entry;
                    });

                    this.addToCache(`${this.getEnvId()}.queues`, updatedQueueDefinitions);

                    return updatedQueueDefinitions;
                }
            }
            case "delete": {
                const prevQueueDefinitions = await this.getPrevQueueDefinitions();
                const updatedQueueDefinitions = prevQueueDefinitions.filter(
                    (entry) => !queues.find((entry2) => entry.iid === entry2.iid)
                );
                this.addToCache(`${this.getEnvId()}.queues`, updatedQueueDefinitions);

                return updatedQueueDefinitions;
            }
            default:
                break;
        }
    }

    /**
     * Caches the task metadata of the app version
     * @param  {Array} tasks The list of tasks data to cache
     * @param  {String} actionType The action type can be either set, udpate or delete
     */
    async cacheTasks(tasks, actionType) {
        switch (actionType) {
            case "set":
                this.addToCache(`${this.getEnvId()}.tasks`, tasks);
                return tasks;
            case "add": {
                const prevTaskDefinitions = await this.getPrevTaskDefinitions();
                prevTaskDefinitions.push(...tasks);
                this.addToCache(`${this.getEnvId()}.tasks`, prevTaskDefinitions);
                return prevTaskDefinitions;
            }
            case "update": {
                const prevTaskDefinitions = await this.getPrevTaskDefinitions();

                if (prevTaskDefinitions.length === 0) {
                    this.addToCache(`${this.getEnvId()}.tasks`, tasks);
                    return tasks;
                } else {
                    const updatedTaskDefinitions = prevTaskDefinitions.map((entry) => {
                        const updatedTask = tasks.find((entry2) => entry2.iid === entry.iid);

                        if (updatedTask) return updatedTask;
                        else return entry;
                    });

                    this.addToCache(`${this.getEnvId()}.tasks`, updatedTaskDefinitions);

                    return updatedTaskDefinitions;
                }
            }
            case "delete": {
                const prevTaskDefinitions = await this.getPrevTaskDefinitions();
                const updatedTaskDefinitions = prevTaskDefinitions.filter(
                    (entry) => !tasks.find((entry2) => entry.iid === entry2.iid)
                );
                this.addToCache(`${this.getEnvId()}.tasks`, updatedTaskDefinitions);

                return updatedTaskDefinitions;
            }
            default:
                break;
        }
    }

    /**
     * Caches the storage metadata of the app version
     * @param  {Array} storages The list of storage data to cache
     * @param  {String} actionType The action type can be either set, udpate or delete
     */
    async cacheStorages(storages, actionType) {
        switch (actionType) {
            case "set":
                this.addToCache(`${this.getEnvId()}.storages`, storages);
                return storages;
            case "add": {
                const prevStorageDefinitions = await this.getPrevStorageDefinitions();
                prevStorageDefinitions.push(...storages);
                this.addToCache(`${this.getEnvId()}.storages`, prevStorageDefinitions);
                return prevStorageDefinitions;
            }
            case "update": {
                const prevStorageDefinitions = await this.getPrevStorageDefinitions();

                if (prevStorageDefinitions.length === 0) {
                    this.addToCache(`${this.getEnvId()}.storages`, storages);
                    return storages;
                } else {
                    const updatedStorageDefinitions = prevStorageDefinitions.map((entry) => {
                        const updatedStorage = storages.find((entry2) => entry2.iid === entry.iid);

                        if (updatedStorage) return updatedStorage;
                        else return entry;
                    });

                    this.addToCache(`${this.getEnvId()}.storages`, updatedStorageDefinitions);

                    return updatedStorageDefinitions;
                }
            }
            case "delete": {
                const prevStorageDefinitions = await this.getPrevStorageDefinitions();
                const updatedStorageDefinitions = prevStorageDefinitions.filter(
                    (entry) => !storages.find((entry2) => entry.iid === entry2.iid)
                );
                this.addToCache(`${this.getEnvId()}.storages`, updatedStorageDefinitions);

                return updatedStorageDefinitions;
            }
            default:
                break;
        }
    }

    /**
     * Caches the function metadata of the app version
     * @param  {Array} functions The list of functions data to cache
     * @param  {String} actionType The action type can be either set, udpate or delete
     */
    async cacheFunctions(functions, actionType) {
        switch (actionType) {
            case "set":
                this.addToCache(`${this.getEnvId()}.functions`, functions);
                return functions;
            case "add": {
                const prevFuncDefinitions = await this.getPrevFunctionDefinitions();
                prevFuncDefinitions.push(...functions);
                this.addToCache(`${this.getEnvId()}.functions`, prevFuncDefinitions);
                return prevFuncDefinitions;
            }
            case "update": {
                const prevFuncDefinitions = await this.getPrevFunctionDefinitions();

                if (prevFuncDefinitions.length === 0) {
                    this.addToCache(`${this.getEnvId()}.functions`, functions);
                    return functions;
                } else {
                    const updatedFuncDefinitions = prevFuncDefinitions.map((entry) => {
                        const updatedFunc = functions.find((entry2) => entry2.iid === entry.iid);

                        if (updatedFunc) return updatedFunc;
                        else return entry;
                    });

                    this.addToCache(`${this.getEnvId()}.functions`, updatedFuncDefinitions);

                    return updatedFuncDefinitions;
                }
            }
            case "delete": {
                const prevFuncDefinitions = await this.getPrevFunctionDefinitions();
                const updatedFuncDefinitions = prevFuncDefinitions.filter(
                    (entry) => !functions.find((entry2) => entry.iid === entry2.iid)
                );
                this.addToCache(`${this.getEnvId()}.functions`, updatedFuncDefinitions);

                return updatedFuncDefinitions;
            }
            default:
                break;
        }
    }

    /**
     * Caches the cache metadata of the app version
     * @param  {Array} caches The list of caches data to cache
     * @param  {String} actionType The action type can be either set, udpate or delete
     */
    async cacheCaches(caches, actionType) {
        switch (actionType) {
            case "set":
                this.addToCache(`${this.getEnvId()}.caches`, caches);
                return caches;
            case "add": {
                const prevCacheDefinitions = await this.getPrevCacheDefinitions();
                prevCacheDefinitions.push(...caches);
                this.addToCache(`${this.getEnvId()}.caches`, prevCacheDefinitions);
                return prevCacheDefinitions;
            }
            case "update": {
                const prevCacheDefinitions = await this.getPrevCacheDefinitions();

                if (prevCacheDefinitions.length === 0) {
                    this.addToCache(`${this.getEnvId()}.caches`, caches);
                    return caches;
                } else {
                    const updatedCacheDefinitions = prevCacheDefinitions.map((entry) => {
                        const updatedCache = caches.find((entry2) => entry2.iid === entry.iid);

                        if (updatedCache) return updatedCache;
                        else return entry;
                    });

                    this.addToCache(`${this.getEnvId()}.caches`, updatedCacheDefinitions);

                    return updatedCacheDefinitions;
                }
            }
            case "delete": {
                const prevCacheDefinitions = await this.getPrevCacheDefinitions();
                const updatedCacheDefinitions = prevCacheDefinitions.filter(
                    (entry) => !caches.find((entry2) => entry.iid === entry2.iid)
                );
                this.addToCache(`${this.getEnvId()}.caches`, updatedCacheDefinitions);

                return updatedCacheDefinitions;
            }
            default:
                break;
        }
    }

    /**
     * Deploys the application version to the engine cluster
     */
    async deployVersion() {
        try {
            this.addLog(t("Started deployment"));
            // Set current status of environment in engine cluster
            await this.setStatus("Deploying");
            // First add environment object data to cache
            this.addToCache(`${this.getEnvId()}.object`, this.getEnvObj());
            this.addToCache(`${this.getEnvId()}.timestamp`, this.getTimestamp());

            // Load all data models and do deployment initializations
            await this.loadDatabases();
            // Cache application configuration data
            await this.cacheMetadata();
            // Create application specific configuration and log collections
            await this.createInternalCollections();
            // Create database structure for databases and models (e.g.,tables, collections, indices)
            await this.prepareDatabases("deploy");
            // Save updated deployment to database
            await this.saveDeploymentConfig();
            // Execute all redis commands altogether
            await this.commitPipeline();
            // After we load all configuration data to the cache we can notify engine API servers to update themselves
            this.notifyAPIServers();

            // Update status of environment in engine cluster
            this.addLog(t("Completed deployment successfully"));
            // Send the deployment telemetry information to the platform
            await this.sendEnvironmentLogs("OK");
            // Update status of environment in engine cluster
            await this.setStatus("OK");
            return { success: true };
        } catch (error) {
            // Clear pipeline
            this.clearPipeline();
            // Update status of environment in engine cluster
            await this.setStatus("Error");
            // Send the deployment telemetry information to the platform
            this.addLog([t("Deployment failed"), error.name, error.message, error.stack].join("\n"), "Error");
            await this.sendEnvironmentLogs("Error");
            return { success: false, error };
        }
    }

    /**
     * Redeploys the application version to the engine cluster
     */
    async redeployVersion() {
        try {
            this.addLog(t("Started redeployment"));
            // Set current status of environment in engine cluster
            await this.setStatus("Deploying");

            // Clear the initially cached environment data
            await this.clearCachedData(`${this.getEnvId()}.*`);
            // Add environment object data to cache
            this.addToCache(`${this.getEnvId()}.object`, this.getEnvObj());
            this.addToCache(`${this.getEnvId()}.timestamp`, this.getTimestamp());

            // Load all data models and do deployment initializations
            await this.loadDatabases();
            // Cache application configuration data
            await this.cacheMetadata();
            // Create application specific configuration and log collections
            await this.createInternalCollections();
            // Create database structure for databases and models (e.g.,tables, collections, indices)
            await this.prepareDatabases("redeploy");
            // Save updated deployment to database
            await this.saveDeploymentConfig();
            // Execute all redis commands altogether
            await this.commitPipeline();
            // After we load all configuration data to the cache we can notify engine API servers to update themselves
            this.notifyAPIServers();

            // Update status of environment in engine cluster
            this.addLog(t("Completed redeployment successfully"));
            // Send the deployment telemetry information to the platform
            await this.sendEnvironmentLogs("OK");
            // Update status of environment in engine cluster
            await this.setStatus("OK");
            return { success: true };
        } catch (error) {
            // Update status of environment in engine cluster
            await this.setStatus("Error");
            // Send the deployment telemetry information to the platform
            this.addLog([t("Redeployment failed"), error.name, error.message, error.stack].join("\n"), "Error");
            await this.sendEnvironmentLogs("Error");
            return { success: false, error };
        }
    }

    /**
     * Deploys the application version to the engine cluster
     */
    async deleteEnvironment() {
        try {
            this.addLog(t("Started environment deletion"));
            // Set current status of environment in engine cluster
            await this.setStatus("Deleting");

            // Clear the initially cached environment data
            await this.clearCachedData(`${this.getEnvId()}.*`);

            // Drop application specific data (e.g., cache, database, storage)
            await this.clearCachedData(`sessions.${this.getEnvId()}.*`);
            await this.clearCachedData(`tokens.${this.getEnvId()}.*`);
            await this.dropStorages();
            await this.dropCaches();
            await this.dropDatabases();

            // Delete environment configuration database
            await this.dropEnvDB();
            // Execute all redis commands altogether
            await this.commitPipeline();

            // Update status of environment in engine cluster
            this.addLog(t("Completed environment deletion successfully"));
            // Send the deployment telemetry information to the platform
            await this.sendEnvironmentLogs("OK");
            // Update status of environment in engine cluster
            await this.setStatus("OK");
            return { success: true };
        } catch (error) {
            // Clear pipeline
            this.clearPipeline();
            // Update status of environment in engine cluster
            await this.setStatus("Error");
            // Send the deployment telemetry information to the platform
            this.addLog([t("Environment deletion failed"), error.name, error.message, error.stack].join("\n"), "Error");
            await this.sendEnvironmentLogs("Error");
            return { success: false, error };
        }
    }

    /**
     * Updates the environemnt and version metadata
     */
    async updateEnvironmentMetadata() {
        try {
            this.addLog(t("Started metadata update"));
            // Set current status of environment in engine cluster
            await this.setStatus("Deploying");
            // First add environment object data to cache
            this.addToCache(`${this.getEnvId()}.object`, this.getEnvObj());
            this.addToCache(`${this.getEnvId()}.timestamp`, this.getTimestamp());

            // Execute all redis commands altogether
            await this.commitPipeline();
            // After we load all configuration data to the cache we can notify engine API servers to update themselves
            this.notifyAPIServers();
            // Save updated deployment to database
            await this.saveEnvironmentDeploymentConfig();
            // Update status of environment in engine cluster
            this.addLog(t("Completed update successfully"));
            // Send the deployment telemetry information to the platform
            await this.sendEnvironmentLogs("OK");
            // Update status of environment in engine cluster
            await this.setStatus("OK");
            return { success: true };
        } catch (error) {
            // Clear pipeline
            this.clearPipeline();
            // Update status of environment in engine cluster
            await this.setStatus("Error");
            // Send the deployment telemetry information to the platform
            this.addLog([t("Metadata update failed"), error.name, error.message, error.stack].join("\n"), "Error");
            await this.sendEnvironmentLogs("Error");
            return { success: false, error };
        }
    }

    /**
     * Updates the databases
     */
    async updateDatabases() {
        try {
            this.addLog(t("Started updating databases"));
            // Set current status of environment in engine cluster
            await this.setStatus("Deploying");
            const subAction = this.getSubAction();

            // Update environment object data in cache
            this.addToCache(`${this.getEnvId()}.object`, this.getEnvObj());
            this.addToCache(`${this.getEnvId()}.timestamp`, this.getTimestamp());

            if (subAction === "delete") {
                // Clear cache of databases
                this.getDatabases().forEach((db) => this.removeFromCache(`${this.getEnvId()}.db.${this.getDbId(db)}`));
            } else {
                // Load updated data models and do deployments
                await this.loadDatabases();
            }

            // Cache updated database configurations (subaction can be add, delete or update)
            const databases = await this.cacheDatabases(this.getDatabases(), subAction);

            if (subAction === "delete") {
                // Delete the databases
                await this.deleteManagedDatabases(this.getDatabases());
            } else {
                // Update database structure for databases and models (e.g.,tables, collections, indices)
                await this.prepareDatabasesForUpdates("redeploy");
            }

            // Save updated deployment to database
            await this.saveDatabaseDeploymentConfigs(databases);
            // Save updated deployment to database
            await this.saveEnvironmentDeploymentConfig();
            // Execute all redis commands altogether
            await this.commitPipeline();
            // We first cache all data and then notify api servers
            // After we load all configuration data to the cache we can notify engine API servers to update themselves
            this.notifyAPIServers();

            // Update status of environment in engine cluster
            this.addLog(t("Completed database updates successfully"));
            // Send the deployment telemetry information to the platform
            await this.sendEnvironmentLogs("OK");
            // Update status of environment in engine cluster
            await this.setStatus("OK");
            return { success: true };
        } catch (error) {
            // Clear pipeline
            this.clearPipeline();
            // Update status of environment in engine cluster
            await this.setStatus("Error");
            // Send the deployment telemetry information to the platform
            this.addLog([t("Database updates failed"), error.name, error.message, error.stack].join("\n"), "Error");
            await this.sendEnvironmentLogs("Error");
            return { success: false, error };
        }
    }

    /**
     * Updates the endpoints
     */
    async updateEndpoints() {
        try {
            this.addLog(t("Started updating endpoints"));
            // Set current status of environment in engine cluster
            await this.setStatus("Deploying");
            const subAction = this.getSubAction();

            // Update environment object data in cache
            this.addToCache(`${this.getEnvId()}.object`, this.getEnvObj());
            this.addToCache(`${this.getEnvId()}.timestamp`, this.getTimestamp());

            // Cache updated database configurations (subaction can be add, delete or update)
            const endpoints = await this.cacheEndpoints(this.getEndpoints(), subAction);

            // Execute all redis commands altogether
            await this.commitPipeline();
            // We first cache all data and then notify api servers
            // After we load all configuration data to the cache we can notify engine API servers to update themselves
            this.notifyAPIServers();

            if (subAction === "delete") {
                await this.deleteLogsAndTrackingEntries("endpoint", this.getEndpoints());
            }
            // Save updated deployment to database
            await this.saveEndpointDeploymentConfigs(endpoints);
            // Save updated deployment to database
            await this.saveEnvironmentDeploymentConfig();

            // Update status of environment in engine cluster
            this.addLog(t("Completed endpoint updates successfully"));
            // Send the deployment telemetry information to the platform
            await this.sendEnvironmentLogs("OK");
            // Update status of environment in engine cluster
            await this.setStatus("OK");
            return { success: true };
        } catch (error) {
            // Clear pipeline
            this.clearPipeline();
            // Update status of environment in engine cluster
            await this.setStatus("Error");
            // Send the deployment telemetry information to the platform
            this.addLog([t("Endpoint updates failed"), error.name, error.message, error.stack].join("\n"), "Error");
            await this.sendEnvironmentLogs("Error");
            return { success: false, error };
        }
    }

    /**
     * Updates the middlewares
     */
    async updateMiddlewares() {
        try {
            this.addLog(t("Started updating middlewares"));
            // Set current status of environment in engine cluster
            await this.setStatus("Deploying");
            const subAction = this.getSubAction();

            // Update environment object data in cache
            this.addToCache(`${this.getEnvId()}.object`, this.getEnvObj());
            this.addToCache(`${this.getEnvId()}.timestamp`, this.getTimestamp());

            // Cache updated database configurations (subaction can be add, delete or update)
            const middlewares = await this.cacheMiddlewares(this.getMiddlewares(), subAction);

            // Execute all redis commands altogether
            await this.commitPipeline();
            // We first cache all data and then notify api servers
            // After we load all configuration data to the cache we can notify engine API servers to update themselves
            this.notifyAPIServers();

            // Save updated deployment to database
            await this.saveMiddlewareDeploymentConfigs(middlewares);
            // Save updated deployment to database
            await this.saveEnvironmentDeploymentConfig();

            // Update status of environment in engine cluster
            this.addLog(t("Completed middleware updates successfully"));
            // Send the deployment telemetry information to the platform
            await this.sendEnvironmentLogs("OK");
            // Update status of environment in engine cluster
            await this.setStatus("OK");
            return { success: true };
        } catch (error) {
            // Clear pipeline
            this.clearPipeline();
            // Update status of environment in engine cluster
            await this.setStatus("Error");
            // Send the deployment telemetry information to the platform
            this.addLog([t("Middleware updates failed"), error.name, error.message, error.stack].join("\n"), "Error");
            await this.sendEnvironmentLogs("Error");
            return { success: false, error };
        }
    }

    /**
     * Updates the functions
     */
    async updateFunctions() {
        try {
            this.addLog(t("Started updating functions"));
            // Set current status of environment in engine cluster
            await this.setStatus("Deploying");
            const subAction = this.getSubAction();

            // Update environment object data in cache
            this.addToCache(`${this.getEnvId()}.object`, this.getEnvObj());
            this.addToCache(`${this.getEnvId()}.timestamp`, this.getTimestamp());

            // Cache updated function configurations (subaction can be add, delete or update)
            const functions = await this.cacheFunctions(this.getFunctions(), subAction);

            // Execute all redis commands altogether
            await this.commitPipeline();
            // We first cache all data and then notify api servers
            // After we load all configuration data to the cache we can notify engine API servers to update themselves
            this.notifyAPIServers();

            // Save updated deployment to database
            await this.saveFunctionDeploymentConfigs(functions);
            // Save updated deployment to database
            await this.saveEnvironmentDeploymentConfig();

            // Update status of environment in engine cluster
            this.addLog(t("Completed function updates successfully"));
            // Send the deployment telemetry information to the platform
            await this.sendEnvironmentLogs("OK");
            // Update status of environment in engine cluster
            await this.setStatus("OK");
            return { success: true };
        } catch (error) {
            // Clear pipeline
            this.clearPipeline();
            // Update status of environment in engine cluster
            await this.setStatus("Error");
            // Send the deployment telemetry information to the platform
            this.addLog([t("Function updates failed"), error.name, error.message, error.stack].join("\n"), "Error");
            await this.sendEnvironmentLogs("Error");
            return { success: false, error };
        }
    }

    /**
     * Updates the caches
     */
    async updateCaches() {
        try {
            this.addLog(t("Started updating caches"));
            // Set current status of environment in engine cluster
            await this.setStatus("Deploying");
            const subAction = this.getSubAction();

            // Update environment object data in cache
            this.addToCache(`${this.getEnvId()}.object`, this.getEnvObj());
            this.addToCache(`${this.getEnvId()}.timestamp`, this.getTimestamp());

            // Cache updated cache configurations (subaction can be add, delete or update)
            const caches = await this.cacheCaches(this.getCaches(), subAction);

            // Execute all redis commands altogether
            await this.commitPipeline();
            // We first cache all data and then notify api servers
            // After we load all configuration data to the cache we can notify engine API servers to update themselves
            this.notifyAPIServers();

            // Save updated deployment to database
            await this.saveCacheDeploymentConfigs(caches);
            // Save updated deployment to database
            await this.saveEnvironmentDeploymentConfig();

            // Update status of environment in engine cluster
            this.addLog(t("Completed cache updates successfully"));
            // Send the deployment telemetry information to the platform
            await this.sendEnvironmentLogs("OK");
            // Update status of environment in engine cluster
            await this.setStatus("OK");
            return { success: true };
        } catch (error) {
            // Clear pipeline
            this.clearPipeline();
            // Update status of environment in engine cluster
            await this.setStatus("Error");
            // Send the deployment telemetry information to the platform
            this.addLog([t("Cache updates failed"), error.name, error.message, error.stack].join("\n"), "Error");
            await this.sendEnvironmentLogs("Error");
            return { success: false, error };
        }
    }

    /**
     * Updates the queues
     */
    async updateQueues() {
        try {
            this.addLog(t("Started updating queues"));
            // Set current status of environment in engine cluster
            await this.setStatus("Deploying");
            const subAction = this.getSubAction();

            // Update environment object data in cache
            this.addToCache(`${this.getEnvId()}.object`, this.getEnvObj());
            this.addToCache(`${this.getEnvId()}.timestamp`, this.getTimestamp());

            // Cache updated database configurations (subaction can be add, delete or update)
            const queues = await this.cacheQueues(this.getQueues(), subAction);

            // Execute all redis commands altogether
            await this.commitPipeline();
            // We first cache all data and then notify api servers
            // After we load all configuration data to the cache we can notify engine API servers to update themselves
            this.notifyAPIServers();

            if (subAction === "delete") {
                await this.deleteLogsAndTrackingEntries("queue", this.getQueues());
            }
            // Save updated deployment to database
            await this.saveQueueDeploymentConfigs(queues);
            // Save updated deployment to database
            await this.saveEnvironmentDeploymentConfig();

            // Update status of environment in engine cluster
            this.addLog(t("Completed queue updates successfully"));
            // Send the deployment telemetry information to the platform
            await this.sendEnvironmentLogs("OK");
            // Update status of environment in engine cluster
            await this.setStatus("OK");
            return { success: true };
        } catch (error) {
            // Clear pipeline
            this.clearPipeline();
            // Update status of environment in engine cluster
            await this.setStatus("Error");
            // Send the deployment telemetry information to the platform
            this.addLog([t("Queue updates failed"), error.name, error.message, error.stack].join("\n"), "Error");
            await this.sendEnvironmentLogs("Error");
            return { success: false, error };
        }
    }

    /**
     * Updates the tasks
     */
    async updateTasks() {
        try {
            this.addLog(t("Started updating tasks"));
            // Set current status of environment in engine cluster
            await this.setStatus("Deploying");
            const subAction = this.getSubAction();

            // Update environment object data in cache
            this.addToCache(`${this.getEnvId()}.object`, this.getEnvObj());
            this.addToCache(`${this.getEnvId()}.timestamp`, this.getTimestamp());

            // Cache updated database configurations (subaction can be add, delete or update)
            const tasks = await this.cacheTasks(this.getTasks(), subAction);

            // Execute all redis commands altogether
            await this.commitPipeline();
            // We first cache all data and then notify api servers
            // After we load all configuration data to the cache we can notify engine API servers to update themselves
            this.notifyAPIServers();

            if (subAction === "delete") {
                await this.deleteLogsAndTrackingEntries("task", this.getTasks());
            }
            // Save updated deployment to database
            await this.saveTaskDeploymentConfigs(tasks);
            // Save updated deployment to database
            await this.saveEnvironmentDeploymentConfig();

            // Update status of environment in engine cluster
            this.addLog(t("Completed task updates successfully"));
            // Send the deployment telemetry information to the platform
            await this.sendEnvironmentLogs("OK");
            // Update status of environment in engine cluster
            await this.setStatus("OK");
            return { success: true };
        } catch (error) {
            // Clear pipeline
            this.clearPipeline();
            // Update status of environment in engine cluster
            await this.setStatus("Error");
            // Send the deployment telemetry information to the platform
            this.addLog([t("Task updates failed"), error.name, error.message, error.stack].join("\n"), "Error");
            await this.sendEnvironmentLogs("Error");
            return { success: false, error };
        }
    }

    /**
     * Updates the storages
     */
    async updateStorages() {
        try {
            this.addLog(t("Started updating storages"));
            // Set current status of environment in engine cluster
            await this.setStatus("Deploying");
            const subAction = this.getSubAction();

            // Update environment object data in cache
            this.addToCache(`${this.getEnvId()}.object`, this.getEnvObj());
            this.addToCache(`${this.getEnvId()}.timestamp`, this.getTimestamp());

            // Cache updated database configurations (subaction can be add, delete or update)
            const storages = await this.cacheStorages(this.getStorages(), subAction);

            // Execute all redis commands altogether
            await this.commitPipeline();
            // We first cache all data and then notify api servers
            // After we load all configuration data to the cache we can notify engine API servers to update themselves
            this.notifyAPIServers();

            // Save updated deployment to database
            await this.saveStorageDeploymentConfigs(storages);
            // Save updated deployment to database
            await this.saveEnvironmentDeploymentConfig();

            // Update status of environment in engine cluster
            this.addLog(t("Completed storage updates successfully"));
            // Send the deployment telemetry information to the platform
            await this.sendEnvironmentLogs("OK");
            // Update status of environment in engine cluster
            await this.setStatus("OK");
            return { success: true };
        } catch (error) {
            // Clear pipeline
            this.clearPipeline();
            // Update status of environment in engine cluster
            await this.setStatus("Error");
            // Send the deployment telemetry information to the platform
            this.addLog([t("Storage updates failed"), error.name, error.message, error.stack].join("\n"), "Error");
            await this.sendEnvironmentLogs("Error");
            return { success: false, error };
        }
    }

    /**
     * Updates the databases
     */
    async updateResourceAccessSettings() {
        try {
            this.addLog(t("Started updating resource access settings"));
            // Set current status of environment in engine cluster
            await this.setStatus("Deploying");
            const updatedResource = this.getUpdatedResource();

            // Update environment object data in cache
            this.addToCache(`${this.getEnvId()}.object`, this.getEnvObj());
            this.addToCache(`${this.getEnvId()}.timestamp`, this.getTimestamp());

            // If the access setting of a database resource has changed then we need to update respective database objects
            let updatedDbList = null;
            if (updatedResource.type === "database") {
                const databases = await this.getPrevDBDefinitions();
                const impactedDB = databases.find((db) => db.resource.iid === updatedResource.iid);

                if (impactedDB) {
                    impactedDB.resource = updatedResource;
                    // Update individual DB cache
                    this.addToCache(`${this.getEnvId()}.db.${this.getDbId(impactedDB)}`, impactedDB);

                    // Update the overall databases list
                    updatedDbList = await this.cacheDatabases([impactedDB], "update");
                }
            }

            // Execute all redis commands altogether
            await this.commitPipeline();
            // We first cache all data and then notify api servers
            // After we load all configuration data to the cache we can notify engine API servers to update themselves
            this.notifyAPIServers();

            // Save updated deployment to database
            if (updatedDbList) await this.saveDatabaseDeploymentConfigs(updatedDbList);
            // Save updated deployment to database
            await this.saveEnvironmentDeploymentConfig();

            // Update status of environment in engine cluster
            this.addLog(t("Completed resource access settings update successfully"));
            // Send the deployment telemetry information to the platform
            await this.sendEnvironmentLogs("OK");
            // Update status of environment in engine cluster
            await this.setStatus("OK");
            return { success: true };
        } catch (error) {
            // Clear pipeline
            this.clearPipeline();
            // Update status of environment in engine cluster
            await this.setStatus("Error");
            // Send the deployment telemetry information to the platform
            this.addLog(
                [t("Resource access settings update failed"), error.name, error.message, error.stack].join("\n"),
                "Error"
            );
            await this.sendEnvironmentLogs("Error");
            return { success: false, error };
        }
    }

    /**
     * Sends the message to the engine API servers so that they can update their state
     */
    notifyAPIServers() {
        // Before sending the message the API server send a ping message to the server so that if it is on standby we can start it up.
        axios.get(`http://${this.getEnvId()}.${process.env.NAMESPACE}.svc.cluster.local/health`).catch((error) => {});

        const msgObj = this.getMsgObj();
        manageAPIServers(this.getEnvId(), {
            action: msgObj.action,
            subAction: msgObj.subAction,
            callback: msgObj.callback,
            actor: msgObj.actor,
            app: msgObj.app,
            env: msgObj.env,
        });
    }

    async dropStorages() {}
    async dropCaches() {}

    /*     async deleteStorageData(storages) {
        for (const storage of storages) {
            // First get all buckets of the storage
            const engineDb = this.getEnvDB();
            // First clear any existing configuration
            const dataCursor = await engineDb
                .collection("buckets")
                .find({ storageId: storage.iid }, { projection: { name: 1, id: 1 } });
            const buckets = await dataCursor.toArray();
            await dataCursor.close();

            // Call the engine endpoint to delete the bucket and associated files
            // Update the environment log object
            axios
                .post(
                    `http://${this.getEnvId()}.${process.env.NAMESPACE}.svc.cluster.local/storage/${
                        storage.name
                    }/bucket/delete-multi`,
                    {
                        bucketNames: buckets.map((entry) => entry.name),
                    },
                    {
                        headers: {
                            Authorization: process.env.ACCESS_TOKEN,
                            "Content-Type": "application/json",
                        },
                    }
                )
                .catch((error) => {});
        }
    } */
}
