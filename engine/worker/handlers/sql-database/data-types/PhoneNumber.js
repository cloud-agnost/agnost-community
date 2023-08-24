import Text from "./Text.js";

export default class PhoneNumber extends Text {
    isSearchable() {
        return false;
    }

    /**
     * @description Gets the max length of the field
     * @return {number | undefined}
     */
    getMaxLength() {
        return config.get("database.phoneMaxLength") ?? 16;
    }
}
