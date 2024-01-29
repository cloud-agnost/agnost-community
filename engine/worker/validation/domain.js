import { body } from "express-validator";

export const applyRules = (type) => {
    switch (type) {
        case "create":
            return [
                body("name")
                    .trim()
                    .notEmpty()
                    .withMessage(t("Required field, cannot be left empty"))
                    .bail()
                    .custom((value) => {
                        let regex = /^[a-z0-9-]+$/;
                        if (!regex.test(value)) {
                            throw new AgnostError(
                                t("Domain names can include only numbers, lowercase letters and '-' characters")
                            );
                        }

                        let regex2 = /^[0-9].*$/;
                        if (regex2.test(value)) {
                            throw new AgnostError(t("Domain names cannot start with a number"));
                        }

                        let regex3 = /^-|-$/;
                        if (regex3.test(value)) {
                            throw new AgnostError(t("Domain names cannot start or end with '-' character"));
                        }

                        return true;
                    }),
                body("domain")
                    .trim()
                    .notEmpty()
                    .withMessage(t("Required field, cannot be left empty"))
                    .bail()
                    .toLowerCase() // convert the value to lowercase
                    .custom((value, { req }) => {
                        // The below regex allows for wildcard subdomains
                        // const dnameRegex = /^(?:\*\.)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
                        // Check domain name syntax, we do not currently allow wildcard subdomains
                        const dnameRegex = /^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
                        // Validate domain name (can be at mulitple levels)
                        if (!dnameRegex.test(value)) {
                            throw new AgnostError(t("Not a valid domain name '%s'", value));
                        }

                        return true;
                    }),
                body("service").trim().notEmpty().withMessage(t("Required field, cannot be left empty")),
                body("port")
                    .trim()
                    .notEmpty()
                    .withMessage(t("Required field, cannot be left empty"))
                    .bail()
                    .isInt({
                        min: 0,
                        max: 65535,
                    })
                    .withMessage(t("Port number needs to be an integer between 0-65535"))
                    .toInt(),
            ];
        case "delete":
            return [
                body("name")
                    .trim()
                    .notEmpty()
                    .withMessage(t("Required field, cannot be left empty"))
                    .bail()
                    .custom((value) => {
                        let regex = /^[a-z0-9-]+$/;
                        if (!regex.test(value)) {
                            throw new AgnostError(
                                t("Domain names can include only numbers, lowercase letters and '-' characters")
                            );
                        }

                        let regex2 = /^[0-9].*$/;
                        if (regex2.test(value)) {
                            throw new AgnostError(t("Domain names cannot start with a number"));
                        }

                        let regex3 = /^-|-$/;
                        if (regex3.test(value)) {
                            throw new AgnostError(t("Domain names cannot start or end with '-' character"));
                        }

                        return true;
                    }),
            ];
        default:
            return [];
    }
};
