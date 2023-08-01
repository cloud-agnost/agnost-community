import Field from "./Field.js";

export default class Monetary extends Field {
    toDefinitionQuery() {
        return this.name + " " + this.versions[this.adapter];
    }

    toDefinitionQueryForRename() {
        return this.versions[this.adapter];
    }
}
