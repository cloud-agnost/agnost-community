import ERROR_CODES from "../config/errorCodes.js";

export const checkAuthUserModel = async function (req, res, next) {
	const version = META.getVersion();
	const { authentication } = version;

	if (
		!authentication.userDataModel?.database ||
		!authentication.userDataModel?.model
	) {
		return res
			.status(400)
			.json(
				helper.createErrorMessage(
					ERROR_CODES.clientError,
					ERROR_CODES.missingAuthUserDataModelConfig,
					t(
						"The application version '%s' does not have any user data model configuration to store user authentication data.",
						version.name
					)
				)
			);
	}

	let { userDb, userModel } = META.getDatabaseModelByIId(
		authentication.userDataModel.database,
		authentication.userDataModel.model
	);

	if (!userModel) {
		return res
			.status(400)
			.json(
				helper.createErrorMessage(
					ERROR_CODES.clientError,
					ERROR_CODES.missingAuthUserDataModel,
					t(
						"The application version '%s' does not have the configured user data model to to store user authentication data.",
						version.name
					)
				)
			);
	}

	let isValid = isValidModel(userModel);
	if (isValid.result === false) {
		return res
			.status(400)
			.json(
				helper.createErrorMessage(
					ERROR_CODES.clientError,
					ERROR_CODES.invalidAuthUserDataModel,
					t(
						"The application version '%s' has a user data model named '%s' but the model is not valid. The user data model does not have the following fields with exact name and type: %s",
						version.name,
						userModel.name,
						getMissingFieldsInfo(isValid).join(", ")
					)
				)
			);
	}

	req.userDb = userDb;
	req.userModel = userModel;

	next();
};

function isValidModel(model) {
	let provider = getModelField(model, "provider", "text");
	let providerUserId = getModelField(model, "providerUserId", "text");
	let email = getModelField(model, "email", "email");
	let phone = getModelField(model, "phone", "phone");
	let password = getModelField(model, "password", "encrypted-text");
	let name = getModelField(model, "name", "text");
	let profilePicture = getModelField(model, "profilePicture", "link");
	let signUpAt = getModelField(model, "signUpAt", "datetime");
	let lastLoginAt = getModelField(model, "lastLoginAt", "datetime");
	let emailVerified = getModelField(model, "emailVerified", "boolean");
	let phoneVerified = getModelField(model, "phoneVerified", "boolean");

	let isValid = false;
	if (
		provider &&
		providerUserId &&
		email &&
		phone &&
		password &&
		name &&
		profilePicture &&
		signUpAt &&
		lastLoginAt &&
		emailVerified &&
		phoneVerified
	)
		isValid = true;

	return {
		result: isValid,
		provider: provider ? true : false,
		providerUserId: providerUserId ? true : false,
		email: email ? true : false,
		phone: phone ? true : false,
		password: password ? true : false,
		name: name ? true : false,
		profilePicture: profilePicture ? true : false,
		signUpAt: signUpAt ? true : false,
		lastLoginAt: lastLoginAt ? true : false,
		emailVerified: emailVerified ? true : false,
		phoneVerified: phoneVerified ? true : false,
	};
}

function getModelField(model, name, type) {
	for (let i = 0; i < model.fields.length; i++) {
		const field = model.fields[i];
		if (field.name === name && field.type === type) return field;
	}

	return null;
}

function getMissingFieldsInfo(isValid) {
	let missingFields = [];
	if (isValid.provider === false) missingFields.push("provider (text)");
	if (isValid.providerUserId === false)
		missingFields.push("providerUserId (text)");
	if (isValid.email === false) missingFields.push("email (email)");
	if (isValid.phone === false) missingFields.push("phone (phone)");
	if (isValid.password === false)
		missingFields.push("password (encrypted-text)");
	if (isValid.name === false) missingFields.push("name (text)");
	if (isValid.profilePicture === false)
		missingFields.push("profilePicture (link)");
	if (isValid.signUpAt === false) missingFields.push("signUpAt (datetime)");
	if (isValid.lastLoginAt === false)
		missingFields.push("lastLoginAt (datetime)");
	if (isValid.emailVerified === false)
		missingFields.push("emailVerified (boolean)");
	if (isValid.phoneVerified === false)
		missingFields.push("phoneVerified (boolean)");

	return missingFields;
}
