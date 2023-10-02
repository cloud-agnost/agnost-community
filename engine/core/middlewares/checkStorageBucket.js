import ERROR_CODES from "../config/errorCodes.js";

// Middleware to fetch storage information
export const checkStorage = (req, res, next) => {
	const storageName = req.params.storageName;

	try {
		const storage = agnost.storage(storageName);
		req.storage = storage;
	} catch (err) {
		return res
			.status(400)
			.json(
				helper.createErrorMessage(
					err.origin ?? ERROR_CODES.clientError,
					err.code ?? ERROR_CODES.storageNotFound,
					err.message ??
						t("No storage found matching the name '%s'", storageName)
				)
			);
	}
	next();
};

// Middleware to fetch bucket information
export const checkBucket = async (req, res, next) => {
	const bucketName = req.params.bucketName;

	try {
		const bucket = await req.storage.bucket(bucketName).getInfo();
		if (!bucket) {
			const options = JSON.parse(req.query.options);
			if (options?.createBucket) {
				let response = await req.storage.createBucket(
					bucketName,
					options.isPublic ? true : false
				);
				req.bucket = response;
			} else {
				return res
					.status(400)
					.json(
						helper.createErrorMessage(
							ERROR_CODES.clientError,
							ERROR_CODES.bucketNotFound,
							t(
								"Cannot identify the bucket '%s' in storage '%s'",
								bucketName,
								req.params.storageName
							)
						)
					);
			}
		} else req.bucket = bucket;
	} catch (err) {
		return res
			.status(400)
			.json(
				helper.createErrorMessage(
					err.origin ?? ERROR_CODES.clientError,
					err.code ?? ERROR_CODES.bucketNotFound,
					err.message ??
						t(
							"No bucket found matching the name '%s' in storage '%s'",
							bucketName,
							req.params.storageName
						)
				)
			);
	}
	next();
};
