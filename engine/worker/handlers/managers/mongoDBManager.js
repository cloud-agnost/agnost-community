import { DBManager } from "./dbManager.js";

export class MongoDBManager extends DBManager {
    constructor(env, dbConfig, prevDbConfig, addLogFn) {
        super(env, dbConfig, prevDbConfig, addLogFn);

        this.appDB = null;
    }

    /**
     * Returns the name of the database to use
     */
    getAppliedDbName() {
        if (this.getAssignUniqueName()) return `${this.getEnvId()}_${this.getDbId()}`;
        else return this.getDbName();
    }

    /**
     * Create a new MongoDB database
     */
    async createDatabase() {
        const conn = await this.getConn();
        conn.db(this.getAppliedDbName());
        this.addLog(t("Created the database"));
    }

    /**
     * Deletes an existing MongoDB database
     */
    async dropDatabase() {
        const conn = await this.getConn();
        await conn.db(this.getAppliedDbName()).dropDatabase();
    }

    /**
     * Returns reference to the apps database object instance
     */
    async getAppDB() {
        if (!this.appDB) {
            const conn = await this.getConn();
            this.appDB = conn.db(this.getAppliedDbName());
        }

        return this.appDB;
    }

    getCollectionName(model) {
        if (model.type === "model") return model.name;
        else {
            let parentModel = this.getModel(model.parentiid);
            return this.getCollectionName(parentModel);
        }
    }

    /**
     * Iterates over existing MongoDB database collections and checks if a collection exits for the given model
     * @param  {array} collections MongoDB database collections
     * @param  {object} model Database model
     */
    modelHasCollection(collections, model) {
        for (let i = 0; i < collections.length; i++) {
            const collection = collections[i];
            if (collection.collectionName === model.name) return true;
        }

        return false;
    }

    /**
     * Iterates over database models and checks if a model exists for the given collection
     * @param  {object} collection MongoDB database collection
     */
    collectionHasModel(collection) {
        const models = this.getModels();
        for (let i = 0; i < models.length; i++) {
            const model = models[i];
            if (collection.collectionName === model.name && model.type === "model") return true;
        }

        return false;
    }

    /**
     * Returns the corresponding model of a database collection
     * @param  {string} collectionName MongoDB database collection name
     */
    getCollectionModel(collectionName) {
        const models = this.getModels();
        for (let i = 0; i < models.length; i++) {
            const model = models[i];
            if (model.name === collectionName && model.type === "model") return model;
        }

        return null;
    }

    /**
     * Iterates over database models creates/drops counterpart collections and associated collection indices
     */
    async manageModels() {
        const models = this.getModels();
        const appDB = await this.getAppDB();

        const collections = await appDB.collections();

        // Create new model collections and rename existing ones (if name has changed)
        for (let i = 0; i < models.length; i++) {
            const model = models[i];
            //We crete collection only for top level models
            if (model.type === "model") {
                //Create collections for required models, if there is not any already
                if (this.modelHasCollection(collections, model) === false) {
                    await appDB.createCollection(model.name);
                    this.addLog(t("Created collection '%s'", model.name));
                } else {
                    const prevModel = this.getPrevModel(model.iid);
                    // Check if the model has been renamed or not
                    if (prevModel && prevModel.name !== model.name) {
                        await appDB.renameCollection(prevModel.name, model.name);
                        this.addLog(t("Renamed collection '%s' to '%s'", prevModel.name, model.name));
                    }
                }
            }
        }

        // Drop deleted models
        for (let i = 0; i < collections.length; i++) {
            const collection = collections[i];
            if (this.collectionHasModel(collection) === false) {
                await appDB.dropCollection(collection.collectionName);
                this.addLog(t("Dropped collection '%s'", collection.collectionName));
            }
        }

        // Process field name changes
        await this.processFieldNameChanges();
        // Drop deleted fields from database collections
        await this.dropDeletedFields();
        // Prepare/update indices on collections
        await this.ensureIndices();
    }

    /**
     * Iterates over database models and updates fields whose name has changed
     */
    async processFieldNameChanges() {
        // If there is no previous database definition then this is a deployment operation and return
        if (!this.hasPrevConfig()) return;

        const fieldChanges = {};
        const models = this.getModels();
        for (let i = 0; i < models.length; i++) {
            let model = models[i];

            for (let j = 0; j < model.fields.length; j++) {
                let field = model.fields[j];

                let prevModel = this.getPrevModel(model.iid);
                let prevField = this.getField(prevModel, field.iid);

                if (prevModel && prevField) {
                    if (field.name !== prevField.name) {
                        let collectionName = this.getCollectionName(model);
                        if (!fieldChanges[collectionName]) fieldChanges[collectionName] = [];

                        // We will first perform the field name changes in the upper level of the hierarchy
                        // For this reason items in the lower level of the hierarchy needs to used the newest query path names
                        let chain = field.queryPath.split(".");
                        let fieldPath = field.unwindQueryPath;
                        if (chain.length > 1) {
                            let unwindChain = fieldPath.split(".");
                            unwindChain[unwindChain.length - 1] = prevField.name;
                            fieldPath = unwindChain.join(".");
                        } else fieldPath = prevField.unwindQueryPath;

                        fieldChanges[collectionName].push({
                            modelPath: model.queryPath ?? model.name,
                            fieldPath: fieldPath,
                            oldName: prevField.name,
                            newName: field.name,
                            level: chain.length,
                        });
                    }
                }
            }
        }

        // Sort each fieldChange according to the hierarchy level, we need to process field changes for upper level items (parent items) first
        for (let key in fieldChanges) {
            let renameFields = fieldChanges[key];
            renameFields.sort(function (a, b) {
                return a.level - b.level;
            });
        }

        // Apply field name changes in the databae
        let appDB = await this.getAppDB();
        for (let key in fieldChanges) {
            let renameFields = fieldChanges[key];
            for (let i = 0; i < renameFields.length; i++) {
                const item = renameFields[i];
                const rename = {};
                rename.$rename = {};
                rename.$rename[item.fieldPath] = item.newName;
                await appDB.collection(key).updateMany({}, rename);
                this.addLog(t("Renamed field '%s' to '%s' in model '%s", item.oldName, item.newName, item.modelPath));
            }
        }
    }

    /**
     * Iterates over database models drops deleted fields from models
     */
    async dropDeletedFields() {
        // If there is no previous database definition then this is a deployment operation and return
        if (!this.hasPrevConfig()) return;

        const fieldDeletes = {};
        const prevModels = this.getPrevModels();
        for (let i = 0; i < prevModels.length; i++) {
            let model = prevModels[i];

            for (let j = 0; j < model.fields.length; j++) {
                let field = model.fields[j];

                let newModel = this.getModel(model.iid);
                let newField = this.getField(newModel, field.iid);

                // If there is no corresponding new model then there is no need to process this field
                // since the corresponding collection if any is already dropped from database, or the field holding this sub-model will be dropped
                if (!newModel) continue;

                // If there is no corresponding new field then we need to drop the field from the respective collection
                if (!newField) {
                    let collectionName = this.getCollectionName(model);
                    if (!fieldDeletes[collectionName]) fieldDeletes[collectionName] = [];

                    fieldDeletes[collectionName].push({
                        fieldPath: field.unwindQueryPath,
                        fieldName: field.name,
                        modelPath: model.queryPath ?? model.name,
                    });
                }
            }
        }

        // Drop deleted fiels
        let appDB = await this.getAppDB();
        for (let key in fieldDeletes) {
            let deleteFields = fieldDeletes[key];
            for (let i = 0; i < deleteFields.length; i++) {
                const item = deleteFields[i];
                const del = {};
                del.$unset = {};
                del.$unset[item.fieldPath] = "";
                await appDB.collection(key).updateMany({}, del);
                this.addLog(t("Deleted field '%s' in model '%s", item.fieldName, item.modelPath));
            }
        }
    }

    /**
     * Iterates over database model fields and create required indices and drop obsolete ones
     */
    async ensureIndices() {
        // Get all collections of the database
        const appDB = await this.getAppDB();
        const collections = await appDB.collections();

        // Iterate through all collections to build/update/delete indexes
        for (let i = 0; i < collections.length; i++) {
            let collection = collections[i];
            let model = this.getCollectionModel(collection.collectionName);
            // Sometimes mongodb creates temporary collections to handle field name changes, we should skip those temp collections
            if (!model) continue;
            // Get existing indices of the collextion
            let indices = await collection.indexes();
            // Find all required indices in collection
            let result = this.getRequiredIndices(model);
            let requiredIndices = result.indices;

            // Drop any unused or changed index
            for (let j = 0; j < indices.length; j++) {
                const index = indices[j];
                // If this is _id field index then skip
                if (index.key._id || index.name === "_id_") continue;
                const requiredIndex = this.getRequiredIndex(index, requiredIndices, result.textIndexDef);

                if (!requiredIndex) {
                    await collection.dropIndex(index.name);
                }
            }

            //Create all required indices
            await collection.createIndexes(requiredIndices);
            this.addLog(t("Completed processing collection index defitions for model '%s'", model.name));
        }
    }

    /**
     * Returns the required indices for a model
     * @param  {object} model The model json object
     * @param  {array} indices Keeps the list of required index definitions
     * @param  {object} textIndexDef Text index definition json object
     */
    getRequiredIndices(model, indices = null, textIndexDef = null) {
        if (indices === null) indices = [];
        if (textIndexDef === null) textIndexDef = {};

        for (let i = 0; i < model.fields.length; i++) {
            let field = model.fields[i];
            if (this.isIndexRequired(field)) {
                // MongoDB allows maximum of 64 indices on a single collection
                if (indices.length + 1 > config.get("general.maxMongoDBIndexNumberPerCollection")) continue;

                let keyName = field.queryPath;
                let indexDef = {};
                indexDef.key = {};

                if (field.type == "geo-point") indexDef.key[keyName] = "2dsphere";
                else indexDef.key[keyName] = 1;

                // Add unique flag to index
                if (field.unique && field.name != "_id") {
                    indexDef.unique = true;
                    indexDef.sparse = true;
                }

                // If we have text indices, then we need to create only one, compount text index and add it only once to the list
                if (
                    (field.type == "text" && field.text.searchable) ||
                    (field.type == "rich-text" && field.richText.searchable)
                ) {
                    // We need to keep reference to text index definition, since we need to define the text indexes as a compound index
                    // We cannot create separate text indexes, only 1 is allowed in MongoDB
                    if (textIndexDef?.key) textIndexDef.key[keyName] = "text";
                    else {
                        textIndexDef.key = {};
                        textIndexDef.key[keyName] = "text";
                        indices.push(textIndexDef);
                    }
                }

                indices.push(indexDef);
            } else if (this.isSubModelField(field)) {
                let subModel = this.getModel(this.getSubmodelIid(field));
                if (subModel) this.getRequiredIndices(subModel, indices, textIndexDef);
            }
        }

        return { indices, textIndexDef };
    }

    /**
     * Returns the corresponding required index definition for an index in database collection
     * @param  {object} index The datababe collection index
     * @param  {array} requiredIndices Keeps the list of required index definitions
     * @param  {object} textIndexDef Text index definition json object
     */
    getRequiredIndex(index, requiredIndices, textIndexDef) {
        // First check whether the index we are checking is a text index or not
        // If this is a text index, we need to find the matching index differently
        if (this.isTextIndex(index)) {
            if (!textIndexDef || !textIndexDef?.key) return null;

            // Check whether existing text index is matching with the new text index, if not we need to drop the old one by returning null
            let existingKeys = Object.keys(index.weights);
            let newKeys = Object.keys(textIndexDef.key);

            if (existingKeys.length !== newKeys.length) return null;

            // Check whether the indexed fields match or not
            for (let i = 0; i < existingKeys.length; i++) {
                const existingKey = existingKeys[i];
                if (!newKeys.includes(existingKey)) return null;
            }

            return textIndexDef;
        }

        for (let i = 0; i < requiredIndices.length; i++) {
            const requiredIndex = requiredIndices[i];

            //Since we have compound indices we need to check all key values
            let keys1 = Object.keys(index.key);
            let keys2 = Object.keys(requiredIndex.key);
            let isMatching = true;
            if (keys1.length === keys2.length) {
                for (let j = 0; j < keys1.length; j++) {
                    let key1 = keys1[j];
                    let key2 = keys2[j];

                    if (
                        key1 != key2 ||
                        index.key[key1] != requiredIndex.key[key2] ||
                        index.unique != requiredIndex.unique ||
                        index.sparse != requiredIndex.sparse
                    ) {
                        isMatching = false;
                        break;
                    }
                }
            } else isMatching = false;

            if (isMatching) return requiredIndex;
        }

        return null;
    }

    /* Text index structure
      {
         v: 2,
         key: { _fts: 'text', _ftsx: 1 },
         name: 'text_text_author_text',
         ns: '61882c2f03cb4300542066a1.611e6fdb23d6f044089d35a0',
         weights: { author: 1, text: 1 },
         default_language: 'english',
         language_override: 'language',
         textIndexVersion: 3
      }
   */
    /**
     * Returns true if index is a text index otherwise returns false
     * @param  {object} index The database collection index
     */
    isTextIndex(index) {
        if (index.key && index.key === "_fts") return true;
        if (index.default_language || index.language_override || index.textIndexVersion) return true;

        return false;
    }

    /**
     * Returns true if index required for the given field
     * @param  {object} field The field json object
     */
    isIndexRequired(field) {
        if (field.creator == "system") return true;
        if (!["object", "object-list"].includes(field.type)) {
            if (field.unique) return true;
            // By default we index geo-point and datetime fields
            if (field.type == "geo-point") return true;
            if (field.type == "datetime") return true;
            if (field.indexed) return true;
            if (field.type == "enum") return true;
            // Index also referenced object _ids
            if (field.type == "reference") return true;
            if (field.type === "text" && field.text.searchable) return true;
            if (field.type === "rich-text" && field.richText.searchable) return true;
        }

        return false;
    }

    /**
     * Returns true if the field is a sub model field (e.g., object or object-list)
     * @param  {object} field The field json object
     */
    isSubModelField(field) {
        return ["object", "object-list"].includes(field.type);
    }

    /**
     * Returns true if the field is a sub model field (e.g., object or object-list)
     * @param  {object} field The field json object
     */
    getSubmodelIid(field) {
        if (field.type === "object") return field.object.iid;
        else if (field.type === "object-list") return field.objectList.iid;

        return null;
    }
}
