import jwt from "jsonwebtoken";
import { getKey } from "../init/cache.js";
import ERROR_CODES from "../config/errorCodes.js";

/**
 * Checks the validity of the user session token if it is required
 * The handshake auth object provides the following information
 * echoMessages (boolean) - whether send back the message to the sender
 * envId (string) - The environmend iid of the version
 * apiKey (string) - The apiKey of the app version
 * session (string) - The session access token
 */
export const checkSession = async (socket) => {
	return new Promise(async (resolve, reject) => {
		try {
			// If the socket is connected from an engine (API server) pod then bypass middlewares
			if (socket.data.master) return resolve(false);
			const realtimeConfig = socket.temp.realtimeConfig;
			// Get the session access token
			const sessionToken = socket.handshake.auth.session;

			// If session is not required then no need to check the session token
			if (realtimeConfig.sessionRequired) {
				if (!sessionToken) {
					return resolve(
						errorMessage(
							{
								error: t("Realtime Connection Error - Missing Session Token"),
								details: t(
									"No valid session token provided for socket authentication"
								),
							},
							ERROR_CODES.missingSessionToken
						)
					);
				}

				// Ok it seems we have a session token, first dedoce it to verify it
				jwt.verify(
					sessionToken,
					process.env.JWT_SECRET,
					async (error, decoded) => {
						if (error) {
							return resolve(
								errorMessage(
									{
										error: t(
											"Realtime Connection Error - Invalid Session Token"
										),
										details: t(
											"The Session token was not authorized or has expired"
										),
									},
									ERROR_CODES.invalidSessionToken
								)
							);
						} else {
							// Check to see if this token is a valid token, valid tokens should be stored in redis cache
							const session = await getKey(
								`sessions.${socket.temp.envId}.${decoded.key}`
							);

							if (!session) {
								return resolve(
									errorMessage(
										{
											error: t(
												"Realtime Connection Error - Invalid Session Token"
											),
											details: t(
												"The Session token was not authorized or has expired"
											),
										},
										ERROR_CODES.invalidSessionToken
									)
								);
							}

							// Store temporary data which will be deleted at the last step
							socket.data.userId = session.userId;
							return resolve(false);
						}
					}
				);
			} else {
				if (sessionToken) {
					//Ok it seems we have a session token, first dedoce it to verify it
					jwt.verify(
						sessionToken,
						process.env.JWT_SECRET,
						async (error, decoded) => {
							if (!error) {
								// Check to see if this token is a valid token, valid tokens should be stored in redis cache
								const session = await getKey(
									`sessions.${socket.temp.envId}.${decoded.key}`
								);

								if (session) {
									socket.data.userId = session.userId;
								}
							}
							return resolve(false);
						}
					);
				} else return resolve(false);
			}
		} catch (error) {
			logger.error("Server Error - Realtime Check Session", {
				details: {
					action: "check-session",
					source: "realtime-socket",
					url: socket.handshake.url,
					name: error.name,
					message: error.message,
					stack: error.stack,
				},
			});

			return resolve(
				helper.errorMessage(
					{
						error: t("Internal Server Error"),
						details: t(
							"The server has encountered a situation it does not know how to handle. Cannot process user session check."
						),
					},
					ERROR_CODES.internalServerError
				)
			);
		}
	});
};

export const checkSession2 =
	(socket) =>
	async ([event, ...args], next) => {
		return await checkSession(socket, next);
	};
