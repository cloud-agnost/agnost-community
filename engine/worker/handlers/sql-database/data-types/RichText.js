import Field from "./Field.js";

export default class RichText extends Field {
    /**
     * @description Checks if the field is searchable
     * @return {boolean}
     */
    isSearchable() {
        return this.options?.richText?.searchable ?? false;
    }

    /**
     * @description Gets the language of the field
     * @return {string}
     */
    getLanguage() {
        return this.options?.richText?.language;
    }
}
