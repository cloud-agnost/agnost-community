import { getDBClient } from "../init/db.js";
import { getKey } from "../init/cache.js";
import ERROR_CODES from "../config/errorCodes.js";

export const authManageStorage = async (req, res, next) => {
	// Get token
	let token = req.header("Authorization") ?? req.query.token;

	// Check if there is token
	if (!token) {
		return res.status(401).json({
			error: t("Unauthorized"),
			details: t("No access token was found in 'Authorization' header."),
			code: ERROR_CODES.missingAccessToken,
		});
	}

	// Check if token is still valid or not
	// Check if this is a valid session token, session tokens have refresh tokens
	let session = await getKey(token);
	if (!session || !session.rt) {
		return res.status(401).json({
			error: t("Unauthorized"),
			details: t("The access token was not authorized or has expired."),
			code: ERROR_CODES.invalidSession,
		});
	}

	// Get the user information associated with the session
	const user = await getUser(session.userId);

	if (!user || user.status !== "Active") {
		return res.status(401).json({
			error: t("Unauthorized"),
			details: t("No such user exists or the user account is not active."),
			code: ERROR_CODES.invalidUser,
		});
	}

	// Assign app role to
	let role = "viewer";
	if (user.isClusterOwner) {
		role = "Admin";
	} else {
		// Check if the user is member of the app team
		const appTeam = META.getAppTeam();

		// Check if the user is a member of the app or not
		let appMember = appTeam.find(
			(entry) => entry.userId.toString() === user._id.toString()
		);

		if (!appMember) {
			return res.status(401).json({
				error: t("Not Authorized"),
				details: t(
					"You are not a member of the application '%s'",
					META.getAppObj().name
				),
				code: ERROR_CODES.unauthorized,
			});
		}

		role = appMember.role;
	}

	// If the user has the role of viewer then the user does not have the authorization to perform actions on storage data
	if (role === "viewer") {
		return res.status(401).json({
			error: t("Not Authorized"),
			details: t(
				"You do not have the authorization to view or manage storage data of the application '%s'",
				META.getAppObj().name
			),
			code: ERROR_CODES.unauthorized,
		});
	}

	next();
};

async function getUser(userId) {
	// Get the user information associated with the session
	let user = await getKey(userId);
	if (user) return user;

	const conn = getDBClient();
	let db = conn.db("agnost");
	return await db.collection("users").findOne({ _id: helper.objectId(userId) });
}
