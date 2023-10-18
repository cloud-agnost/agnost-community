import Text from "./Text.js";

export default class EncryptedText extends Text {
    isSearchable() {
        return false;
    }

    /**
     * @description Gets the max length of the field
     * @return {number | undefined}
     */
    getMaxLength() {
        return this.options?.encryptedText?.maxLength ?? config.get("general.encryptedTextFieldSQLMaxLength");
    }
}
