import Text from "./Text.js";

export default class Enum extends Text {
    isSearchable() {
        return false;
    }

    /**
     * @description Gets the max length of the field
     * @return {number | undefined}
     */
    getMaxLength() {
        return config.get("database.enumMaxLength") ?? 2048;
    }
}
