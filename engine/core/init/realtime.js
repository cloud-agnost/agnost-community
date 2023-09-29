import { io } from "socket.io-client";

var realtime = null;

export function initializeRealtimeServer() {
	// If we already have a connection then return
	if (realtime) return;

	let realtimeConfig = config.get("realtime");
	realtime = io(realtimeConfig.serverURL, {
		reconnection: realtimeConfig.reconnection,
		reconnectionDelay: realtimeConfig.reconnectionDelay,
		transports: ["websocket", "polling"],
		forceNew: true,
		auth: {
			accessToken: process.env.ACCESS_TOKEN,
		},
		path: "/realtime/",
	});

	realtime.on("connect", () => {
		logger.info(
			`Connection established to realtime server @${realtimeConfig.serverURL}`
		);
	});

	realtime.io.on("reconnect", () => {
		logger.info(
			`Connection re-established to realtime server @${realtimeConfig.serverURL}`
		);
	});
}

export function disconnectRealtimeClient() {
	if (realtime) {
		realtime.close();
		realtime = null;
	}
}

export function getRealtime() {
	return realtime;
}
