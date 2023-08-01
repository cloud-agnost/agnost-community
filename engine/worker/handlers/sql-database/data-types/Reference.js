import Field from "./Field.js";

export default class Reference extends Field {
    defaultField = "_id";

    getReferenceModelIid() {
        return this.config?.reference?.iid;
    }

    getReferenceModelName() {
        return this.config?.reference?.modelName;
    }

    /**
     * @description Generates the query for the field.
     */
    toDefinitionQuery() {
        return (
            this.getName() +
            " " +
            this.versions[this.adapter] +
            `, CONSTRAINT FK_${this.getName()} FOREIGN KEY(${this.getName()}) REFERENCES ${this.getReferenceModelName()}(${
                this.defaultField
            })` +
            this.onDelete() +
            this.onUpdate()
        );
    }

    afterCreateQuery(tableName) {
        const foreignTable = this.getReferenceModelName();
        const foreignName = `fk_${tableName}_${foreignTable}`;

        let SQL = "";

        SQL += `ALTER TABLE ${tableName} ADD CONSTRAINT ${foreignName} FOREIGN KEY (${this.getName()}) REFERENCES ${foreignTable}(${
            this.defaultField
        })`;

        SQL += this.onDelete();
        SQL += this.onUpdate();

        SQL += ";";

        return SQL;
    }

    /**
     * @description Returns the onDelete part of the query
     * @private
     */
    onDelete() {
        if (this.config.reference.onDelete) {
            return ` ON DELETE ${this.config.reference.onDelete}`;
        }
        return "";
    }

    /**
     * @description Returns the onUpdate part of the query
     * @private
     */
    onUpdate() {
        if (this.config.reference.onUpdate) {
            return ` ON UPDATE ${this.config.reference.onUpdate}`;
        }
        return "";
    }
}
