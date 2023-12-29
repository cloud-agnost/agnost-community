import { io } from "socket.io-client";

var realtime = null;

export function initializeRealtimeServer() {
	// If we already have a connection then return
	if (realtime) return;

	let realtimeConfig = config.get("realtime");
	realtime = io(helper.getRealtimeUrl(), {
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
			`Connection established to realtime server @${helper.getRealtimeUrl()}`
		);
	});

	realtime.io.on("reconnect", () => {
		logger.info(
			`Connection re-established to realtime server @${helper.getRealtimeUrl()}`
		);
	});
}

export function disconnectRealtimeClient() {
	if (realtime) {
		try {
			realtime.close();
		} finally {
			realtime = null;
		}
	}
}

export function getRealtime() {
	return realtime;
}
