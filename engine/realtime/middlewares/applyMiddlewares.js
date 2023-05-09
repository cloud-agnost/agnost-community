import { authEnvironment, authEnvironment2 } from "./authEnvironment.js";
import { checkApiKey, checkApiKey2 } from "./checkApiKey.js";
import { checkSession, checkSession2 } from "./checkSession.js";

export const applyRealtimeMiddlewares = () => async (socket, next) => {
	let error = await authEnvironment(socket);
	if (error) return next(error);

	if (socket.temp?.envId) {
		error = await checkApiKey(socket);
		if (error) return next(error);
	}

	if (socket.temp?.envId && socket.temp?.apiKey) {
		error = await checkSession(socket);
		if (error) return next(error);
	}

	return next();
};

export const applySocketMiddlewares = (socket) => async (params, next) => {
	let error = await authEnvironment2(socket)(params, next);
	if (error) return next(error);

	if (socket.temp?.envId) {
		error = await checkApiKey2(socket)(params, next);
		if (error) return next(error);
	}

	if (socket.temp?.envId && socket.temp?.apiKey) {
		error = await applyRateLimiters2(socket)(params, next);
		if (error) return next(error);

		error = await checkSession2(socket)(params, next);
		if (error) return next(error);
	}

	return next();
};
