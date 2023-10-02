import { body, query, validationResult } from "express-validator";
import ERROR_CODES from "../config/errorCodes.js";

// Middleare the create the error message for failed request input validations
export const validate = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({
			error: t("Invalid Input"),
			details: t(
				"The request parameters has failed to pass the validation rules."
			),
			code: ERROR_CODES.validationError,
			fields: errors.array(),
		});
	}

	next();
};

export const applyRules = (action) => {
	switch (action) {
		case "signup-email":
			return [
				body("email")
					.trim()
					.toLowerCase()
					.not()
					.isEmpty()
					.withMessage(t("Email needs to be provided, cannot be left empty."))
					.bail()
					.isEmail()
					.withMessage(t("Not a valid email address format")),
				body("password")
					.not()
					.isEmpty()
					.withMessage(
						t("Password needs to be provided, cannot be left empty.")
					)
					.bail()
					.isLength({
						min: config.get("general.minPwdLength"),
						max: config.get("general.maxPwdLength"),
					})
					.withMessage(
						t(
							"Password can be at least %s and at most %s characters long",
							config.get("general.minPwdLength"),
							config.get("general.maxPwdLength")
						)
					),
				body("redirectURL").optional({ checkFalsy: true }).trim(),
				body("userData").optional({ checkFalsy: true }),
			];
		case "signup-phone":
			return [
				body("phone")
					.trim()
					.not()
					.isEmpty()
					.withMessage(t("Phone needs to be provided, cannot be left empty."))
					.bail()
					.isMobilePhone("any", { strictMode: true })
					.withMessage(
						t(
							"Not a valid phone number. Phone number must be in international format [+] [country code] [subscriber number including area code]"
						)
					),
				body("password")
					.not()
					.isEmpty()
					.withMessage(
						t("Password needs to be provided, cannot be left empty.")
					)
					.bail()
					.isLength({
						min: config.get("general.minPwdLength"),
						max: config.get("general.maxPwdLength"),
					})
					.withMessage(
						t(
							"Password can be at least %s and at most %s characters long",
							config.get("general.minPwdLength"),
							config.get("general.maxPwdLength")
						)
					),
				body("userData").optional({ checkFalsy: true }),
			];
		case "signin-email":
			return [
				body("email")
					.trim()
					.toLowerCase()
					.not()
					.isEmpty()
					.withMessage(t("Email needs to be provided, cannot be left empty."))
					.bail()
					.isEmail()
					.withMessage(t("Not a valid email address format")),
				body("password")
					.not()
					.isEmpty()
					.withMessage(
						t("Password needs to be provided, cannot be left empty.")
					)
					.bail()
					.custom((value) => {
						if (typeof value === "string" || typeof value === "number")
							return true;
						else
							throw new AgnostError(
								t("Password needs to be a string/text value")
							);
					}),
			];
		case "signin-phone":
			return [
				body("phone")
					.trim()
					.not()
					.isEmpty()
					.withMessage(t("Phone needs to be provided, cannot be left empty."))
					.bail()
					.isMobilePhone("any", { strictMode: true })
					.withMessage(
						t(
							"Not a valid phone number. Phone number must be in international format [+] [country code] [subscriber number including area code]"
						)
					),
				body("password")
					.not()
					.isEmpty()
					.withMessage(
						t("Password needs to be provided, cannot be left empty.")
					)
					.bail()
					.custom((value) => {
						if (typeof value === "string" || typeof value === "number")
							return true;
						else
							throw new AgnostError(
								t("Password needs to be a string/text value")
							);
					}),
			];
		case "signin-code":
			return [
				query("phone")
					.trim()
					.not()
					.isEmpty()
					.withMessage(t("Phone needs to be provided, cannot be left empty."))
					.bail()
					.isMobilePhone("any", { strictMode: true })
					.withMessage(
						t(
							"Not a valid phone number. Phone number must be in international format [+] [country code] [subscriber number including area code]"
						)
					),
				query("code")
					.trim()
					.not()
					.isEmpty()
					.withMessage(
						t("SMS code needs to be provided, cannot be left empty.")
					),
			];
		case "send-code":
			return [
				query("phone")
					.trim()
					.not()
					.isEmpty()
					.withMessage(t("Phone needs to be provided, cannot be left empty."))
					.bail()
					.isMobilePhone("any", { strictMode: true })
					.withMessage(
						t(
							"Not a valid phone number. Phone number must be in international format [+] [country code] [subscriber number including area code]"
						)
					),
			];
		case "change-pwd":
			return [
				body("newPassword")
					.not()
					.isEmpty()
					.withMessage(
						t("New password needs to be provided, cannot be left empty.")
					)
					.bail()
					.isLength({
						min: config.get("general.minPwdLength"),
						max: config.get("general.maxPwdLength"),
					})
					.withMessage(
						t(
							"New password can be at least %s and at most %s characters long",
							config.get("general.minPwdLength"),
							config.get("general.maxPwdLength")
						)
					),
				body("oldPassword")
					.not()
					.isEmpty()
					.withMessage(
						t("Old password needs to be provided, cannot be left empty.")
					)
					.bail()
					.custom((value) => {
						if (typeof value === "string" || typeof value === "number")
							return true;
						else
							throw new AgnostError(
								t("Old password needs to be a string/text value")
							);
					}),
			];
		case "send-reset":
		case "send-magic":
		case "resend":
			return [
				body("email")
					.trim()
					.toLowerCase()
					.not()
					.isEmpty()
					.withMessage(t("Email needs to be provided, cannot be left empty."))
					.bail()
					.isEmail()
					.withMessage(t("Not a valid email address format")),
				body("redirectURL")
					.not()
					.isEmpty()
					.withMessage(
						t("Redirect URL needs to be provided, cannot be left empty.")
					),
			];
		case "send-reset-code":
		case "resend-code":
			return [
				query("phone")
					.trim()
					.not()
					.isEmpty()
					.withMessage(t("Phone needs to be provided, cannot be left empty."))
					.bail()
					.isMobilePhone("any", { strictMode: true })
					.withMessage(
						t(
							"Not a valid phone number. Phone number must be in international format [+] [country code] [subscriber number including area code]"
						)
					),
			];
		case "reset-pwd-code":
		case "reset-pwd":
			return [
				body("newPassword")
					.not()
					.isEmpty()
					.withMessage(
						t("New password needs to be provided, cannot be left empty.")
					)
					.bail()
					.isLength({
						min: config.get("general.minPwdLength"),
						max: config.get("general.maxPwdLength"),
					})
					.withMessage(
						t(
							"New password can be at least %s and at most %s characters long",
							config.get("general.minPwdLength"),
							config.get("general.maxPwdLength")
						)
					),
			];
		case "change-email":
			return [
				body("currentPassword")
					.not()
					.isEmpty()
					.withMessage(
						t("Current password needs to be provided, cannot be left empty.")
					)
					.bail()
					.custom((value) => {
						if (typeof value === "string" || typeof value === "number")
							return true;
						else
							throw new AgnostError(
								t("Password needs to be a string/text value")
							);
					}),
				body("newEmail")
					.trim()
					.not()
					.isEmpty()
					.withMessage(t("Email needs to be provided, cannot be left empty."))
					.bail()
					.isEmail()
					.withMessage(t("Not a valid email address format")),
			];
		case "change-phone":
			return [
				body("currentPassword")
					.not()
					.isEmpty()
					.withMessage(
						t("Current password needs to be provided, cannot be left empty.")
					)
					.bail()
					.custom((value) => {
						if (typeof value === "string" || typeof value === "number")
							return true;
						else
							throw new AgnostError(
								t("Password needs to be a string/text value")
							);
					}),
				body("newPhone")
					.trim()
					.not()
					.isEmpty()
					.withMessage(t("Phone needs to be provided, cannot be left empty."))
					.bail()
					.isMobilePhone("any", { strictMode: true })
					.withMessage(
						t(
							"Not a valid phone number. Phone number must be in international format [+] [country code] [subscriber number including area code]"
						)
					),
			];
		case "realtime-get-members":
			return [
				body("channel")
					.trim()
					.not()
					.isEmpty()
					.withMessage(t("Channel name is required, cannot be left empty.")),
			];
		case "upload-formdata":
			return [
				query("fileName")
					.trim()
					.not()
					.isEmpty()
					.withMessage(t("File name is required, cannot be left empty.")),
			];
	}
};
