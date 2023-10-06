import express from "express";
import ERROR_CODES from "../config/errorCodes.js";

// Middleware to check and process content type
export const checkContentType = (req, res, next) => {
	const contentType = req.get("Content-Type");
	if (console.stdlog) console.log("Checking content type:", contentType);

	// Check whether the content-type is a supported one or not
	if (
		contentType &&
		contentType.startsWith("application/json") === false &&
		contentType.startsWith("application/x-www-form-urlencoded") === false &&
		contentType.startsWith("multipart/form-data") === false
	) {
		return res
			.status(415)
			.json(
				helper.createErrorMessage(
					ERROR_CODES.clientError,
					ERROR_CODES.unsupportedMediaType,
					t(
						"The server does not accept the submitted Content-Type header. The Content-Type needs to be either 'application/json, 'application/x-www-form-urlencoded' or 'multipart/form-data'."
					)
				)
			);
	}

	//If content-type is 'application/json' or if content type is missing the default is application/json
	if (!contentType || contentType.startsWith("application/json")) {
		req.files = null;
		express.json({
			limit: config.get("general.expressRequestMaxBodySize"),
			//This type entry is needed in order to parse request bodies without a Content-Type header parameter set
			type: () => {
				return true;
			},
		})(req, res, (error) => {
			if (error) {
				if (error.name == "PayloadTooLargeError") {
					return res
						.status(400)
						.json(
							helper.createErrorMessage(
								ERROR_CODES.clientError,
								ERROR_CODES.payloadTooLarge,
								t(
									"Request body size is larger than the allowed limit of '%s'.",
									config.get("general.expressRequestMaxBodySize")
								)
							)
						);
				}

				return res
					.status(400)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.invalidRequestBodySyntax,
							t(
								"The server could not understand the request due to invalid syntax of JSON document in request body. %s",
								helper.getJSONErrorMessage(error)
							)
						)
					);
			}
			next();
		});
	} else if (contentType.startsWith("application/x-www-form-urlencoded")) {
		req.files = null;
		next();
	} else if (contentType.startsWith("multipart/form-data")) {
		// First parse the body part entries
		for (const key in req.body) {
			let entryValue = req.body[key];
			if (!entryValue) continue;

			try {
				let json = JSON.parse(entryValue);
				// Check if the parsed object is a json object or not, null values are also recognized as object so we also do null check
				if (json && typeof json === "object") req.body[key] = json;
				else req.body[key] = entryValue;
			} catch (error) {
				req.body[key] = entryValue;
			}
		}

		next();
	}
};
