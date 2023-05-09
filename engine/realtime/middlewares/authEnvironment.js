import { getKey } from "../init/cache.js";
import ERROR_CODES from "../config/errorCodes.js";

/**
 * Checks the validity of the app version execution environment
 * The handshake auth object provides the following information
 * echoMessages (boolean) - whether send back the message to the sender
 * envId (string) - The environmend iid of the version
 * apiKey (string) - The apiKey of the app version
 * session (string) - The session token
 */
export const authEnvironment = async function (socket) {
	let params = socket.handshake.auth;
	// If the socket is connected from an engine (API server) pod then bypass middlewares
	if (params.accessToken === process.env.ACCESS_TOKEN) {
		socket.data.master = true;
		return false;
	}

	// Get the environment object
	let env = await getKey(`${params.envId}.object`);
	if (env) {
		// Check if environment is suspended or not
		if (env.suspended) {
			return helper.errorMessage(
				{
					error: t("Realtime Connection Error - Suspended Environment"),
					details: t(
						"Access to environment has been suspended, no operation can be executed until suspension has been revoked."
					),
				},
				ERROR_CODES.suspendedEnvironment
			);
		}

		// Check realtime services are enabled or not
		if (!env.version.realtime.enabled) {
			return helper.errorMessage(
				{
					error: t("Realtime Connection Error - Realtime Disabled"),
					details: t(
						"Realtime services are disabled for the application version."
					),
				},
				ERROR_CODES.realtimeNotAllowed
			);
		}

		// Store temporary data which will be deleted at the last step
		socket.temp = {
			envId: env.iid,
			versionId: env.version.iid,
			realtimeConfig: env.version.realtime,
			apiKeys: env.version.apiKeys,
			rateLimits: env.version.limits,
		};

		// Success validated the environment
		socket.data.envId = env.iid;
		socket.data.echo = params.echoMessages;
		socket.data.master = false;
		return false;
	} else {
		return helper.errorMessage(
			{
				error: t("Realtime Connection Error - No Environment Found"),
				details: t(
					"Cannot identify the execution environment of the app version. Either there is no app version deployed yet, or the API base URL is not pointing to a valid environment."
				),
			},
			ERROR_CODES.noEnvironment
		);
	}
};

export const authEnvironment2 =
	(socket) =>
	async ([event, ...args], next) => {
		return await authEnvironment(socket);
	};
