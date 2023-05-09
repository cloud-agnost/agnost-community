import { getKey } from "../init/cache.js";
import ERROR_CODES from "../config/errorCodes.js";

/**
 * Checks the validity of the user session token if it is required
 * The handshake auth object provides the following information
 * echoMessages (boolean) - whether send back the message to the sender
 * envId (string) - The environmend iid of the version
 * apiKey (string) - The apiKey of the app version
 * at (string) - The session access token
 */
export const checkSession = async function (socket) {
	// If the socket is connected from an engine (API server) pod then bypass middlewares
	if (socket.data.master) return false;
	const realtimeConfig = socket.temp.realtimeConfig;

	// If session is not required then no need to check the session token
	if (!realtimeConfig.sessionRequired) return false;

	// Get the session access token
	const at = socket.handshake.auth.at;
	if (!at) {
		return helper.errorMessage(
			{
				error: t("Realtime Connection Error - Missing Session Access Token"),
				details: t(
					"No valid session access token provided for socket authentication"
				),
			},
			ERROR_CODES.missingSessionAccessToken
		);
	}

	// Ok we have an session access token get the associated session object
	let session = await getKey(at);
	if (!session) {
		return helper.errorMessage(
			{
				error: t("Realtime Connection Error - Invalid Session Access Token"),
				details: t(
					"The session access token was not authorized or has expired"
				),
			},
			ERROR_CODES.invalidSessionAccessToken
		);
	}

	// Assigne user id
	socket.data.userId = session.userId;
	return false;
};

export const checkSession2 =
	(socket) =>
	async ([event, ...args], next) => {
		return await checkSession(socket, next);
	};
