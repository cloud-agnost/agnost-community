import Field from "./Field.js";

export default class EncryptedText extends Field {
    /**
     * @description Gets the max length of the field
     * @return {number | undefined}
     */
    getMaxLength() {
        return this.options?.encryptedText?.maxLength;
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
