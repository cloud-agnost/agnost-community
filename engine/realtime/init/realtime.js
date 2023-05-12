import { Server } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import {
	applyRealtimeMiddlewares,
	applySocketMiddlewares,
} from "../middlewares/applyMiddlewares.js";

export function setUpRealtimeServer(expressServer) {
	// Create the socket.io server
	const realtimeServer = new Server(expressServer, {
		serveClient: config.get("realtime.serveClient"),
		// below are engine.IO options
		pingInterval: config.get("realtime.pingInterval"),
		pingTimeout: config.get("realtime.pingTimeout"),
		upgradeTimeout: config.get("realtime.upgradeTimeout"),
		maxHttpBufferSize: config.get("realtime.maxHttpBufferSize"),
		transports: config.get("realtime.transports"),
		allowUpgrades: config.get("realtime.allowUpgrades"),
		cors: {
			origin: "*",
		},
	});

	try {
		// Create the redis client for pub
		let cacheConfig = config.get("realtimeCache");
		const pubClient = createClient({
			host: cacheConfig.hostname,
			port: cacheConfig.port,
			password:
				process.env.REALTIME_CACHE_PWD &&
				process.env.REALTIME_CACHE_PWD !== "null"
					? process.env.REALTIME_CACHE_PWD
					: undefined,
		});

		// Create the redis client for sub
		const subClient = pubClient.duplicate();

		pubClient.on("connect", function () {
			// Crate socket.io redis adapter
			realtimeServer.adapter(createAdapter(pubClient, subClient));
			logger.info("Realtime server attached to Http server and cache");
		});

		// Register middlewares that get executed for every incoming connection apply the middlewares and join to the default channels
		realtimeServer.use(applyRealtimeMiddlewares());

		//Get to the root namespace
		realtimeServer.on("connection", (socket) => {
			logger.info(`Client ${socket.id} connected`);

			// If the socket is connected from an engine (API server) pod then
			if (!socket.data.master) {
				socket.use(applySocketMiddlewares(socket));
				// By default connection will join to the envId room
				socket.join(socket.data.envId);
				// By default connection will join to the userId room if there is session and associated user id
				if (socket.data.userId)
					socket.join(`${socket.data.envId}.${socket.data.userId}`);
			}

			// Fired upon disconnection.
			socket.on("disconnect", (reason) => {
				logger.info(`Client ${socket.id} disconnected`);
			});

			// Fired when the client is going to be disconnected (but hasn't left its rooms yet).
			socket.on("disconnecting", async (reason) => {
				logger.info(`Client ${socket.id} disconnecting`);

				// Nofity other room members
				const rooms = socket.rooms;
				if (rooms) {
					// Iterate each room and broadcast member data update
					rooms.forEach((roomId) => {
						if (
							roomId !== socket.id &&
							roomId !== socket.data.envId &&
							roomId !== `${socket.data.envId}.${socket.data.userId}`
						) {
							// Remove envId from room names
							const entries = roomId.split(".");
							entries.shift();

							socket.to(roomId).emit("channel:leave", {
								channel: entries.join("."),
								message: { id: socket.id, data: socket.data.profile },
							});
						}
					});
				}
			});

			socket.on("user_event", (payload) => {
				realtimeServer
					.to(`${payload.envId}.${payload.userId}`)
					.emit(payload.eventName, payload.eventName, payload.session);
			});

			socket.on("send_message", async (payload) => {
				realtimeServer
					.to(`${payload.envId}.${payload.channelName}`)
					.emit(payload.eventName, {
						channel: payload.channelName,
						message: payload.message,
					});
			});

			socket.on("broadcast_message", async (payload) => {
				realtimeServer.to(`${payload.envId}`).emit(payload.eventName, {
					channel: null,
					message: payload.message,
				});
			});

			socket.on("message", (payload) => {
				if (payload.channel) {
					if (payload.echo ?? socket.data.echo) {
						realtimeServer
							.to(`${socket.data.envId}.${payload.channel}`)
							.emit(payload.eventName, {
								channel: payload.channel,
								message: payload.message,
							});
					} else {
						socket
							.to(`${socket.data.envId}.${payload.channel}`)
							.emit(payload.eventName, {
								channel: payload.channel,
								message: payload.message,
							});
					}
				} else {
					if (payload.echo ?? socket.data.echo)
						realtimeServer.to(`${socket.data.envId}`).emit(payload.eventName, {
							channel: null,
							message: payload.message,
						});
					else
						socket.to(`${socket.data.envId}`).emit(payload.eventName, {
							channel: null,
							message: payload.message,
						});
				}
			});

			socket.on("update", (payload) => {
				socket.data.profile = payload.data;
				// Nofity other room members
				const rooms = socket.rooms;
				if (rooms) {
					// Iterate each romm and broadcast member data update
					rooms.forEach((roomId) => {
						if (
							roomId !== socket.id &&
							roomId !== socket.data.envId &&
							roomId !== `${socket.data.envId}.${socket.data.userId}`
						) {
							// Remove envId from room names
							const entries = roomId.split(".");
							entries.shift();

							if (payload.echo ?? socket.data.echo) {
								realtimeServer.to(roomId).emit("channel:update", {
									channel: entries.join("."),
									message: { id: socket.id, data: payload.data },
								});
							} else {
								socket.to(roomId).emit("channel:update", {
									channel: entries.join("."),
									message: { id: socket.id, data: payload.data },
								});
							}
						}
					});
				}
			});

			socket.on("join", (payload) => {
				// If the user is already a member of the channel do nothing
				const rooms = socket.rooms;
				if (rooms && rooms.has(`${socket.data.envId}.${payload.channel}`)) {
					return;
				}

				socket
					.to(`${socket.data.envId}.${payload.channel}`)
					.emit("channel:join", {
						channel: payload.channel,
						message: { id: socket.id, data: socket.data.profile },
					});

				socket.join(`${socket.data.envId}.${payload.channel}`);

				if (payload.echo ?? socket.data.echo)
					socket.emit("channel:join", {
						channel: payload.channel,
						message: { id: socket.id, data: socket.data.profile },
					});
			});

			socket.on("leave", (payload) => {
				// If the user is not a member of the channel do nothing
				const rooms = socket.rooms;
				if (rooms && !rooms.has(`${socket.data.envId}.${payload.channel}`)) {
					return;
				}

				socket.leave(`${socket.data.envId}.${payload.channel}`);
				socket
					.to(`${socket.data.envId}.${payload.channel}`)
					.emit("channel:leave", {
						channel: payload.channel,
						message: { id: socket.id, data: socket.data.profile },
					});

				if (payload.echo ?? socket.data.echo)
					socket.emit("channel:leave", {
						channel: payload.channel,
						message: { id: socket.id, data: socket.data.profile },
					});
			});

			// Called from the engine (API server) to fetch channel member through a rest API call
			socket.on("get_members", async (payload, callback) => {
				let sockets = await realtimeServer
					.to(`${payload.envId}.${payload.channel}`)
					.fetchSockets();

				callback(
					(sockets ?? []).map((entry) => {
						return { id: entry.id, data: entry.data.profile };
					})
				);
			});

			socket.on("members", async (payload, callback) => {
				let sockets = await realtimeServer
					.to(`${socket.data.envId}.${payload.channel}`)
					.fetchSockets();

				callback(
					(sockets ?? []).map((entry) => {
						return { id: entry.id, data: entry.data.profile };
					})
				);
			});

			socket.on("error", (err) => {
				if (err && err.message === "unauthorized event") {
					socket.disconnect();
				}
			});
		});
	} catch (err) {
		logger.error(`Cannot connect to the sync cache server`, { details: err });
		process.exit(1);
	}

	return realtimeServer;
}

export function setUpGC() {
	setInterval(() => {
		if (global.gc) {
			// Manually hangle gc to boost performance of our realtime server, gc is an expensive operation
			global.gc();
		}
	}, config.get("realtime.gcSeconds") * 1000);
}

export function disconnectRealtimeServer() {
	// Close realtime server
	realtimeServer.close(() => {
		logger.info("Realtime server closed");
	});
}
