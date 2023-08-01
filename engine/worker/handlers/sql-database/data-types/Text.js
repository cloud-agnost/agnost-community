import Field from "./Field.js";

export default class Text extends Field {
    /**
     * @description Checks if the field is searchable
     * @return {boolean}
     */
    isSearchable() {
        return this.options?.text?.searchable;
    }

    /**
     * @description Gets the max length of the field
     * @return {number | undefined}
     */
    getMaxLength() {
        return this.options?.text?.maxLength;
    }

    toDefinitionQuery() {
        const schema = "`{name}` {type}({maxLength}) {required}";

        return schema
            .replace("{name}", this.getName())
            .replace("{type}", this.getDbType())
            .replace("{maxLength}", this.getMaxLength())
            .replace("{required}", this.isRequired() ? "NOT NULL" : "");
    }
}
