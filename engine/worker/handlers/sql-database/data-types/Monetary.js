import Decimal from "./Decimal.js";

export default class Monetary extends Decimal {
    baseLength = 13;

    /**
     * @description Gets the monetary digits
     * @return {number}
     */
    getDecimalDigits() {
        return config.get("database.monetaryDecimalDigits") ?? 4;
    }
}
