import { getRealtime } from "../../init/realtime.js";
import ERROR_CODES from "../../config/errorCodes.js";

const AWAIT_TIMEOUT = 5000;

/**
 * Primarily used to broadcast messages or send messages to a channel
 */
export class RealtimeAdapter {
	constructor(manager) {
		this.manager = manager;
	}

	/**
	 * Sends the message identified by the `eventName` to all connected members of the app. All serializable datastructures are supported for the `message`, including `Buffer`.
	 *
	 * @param {string} eventName The name of the event.
	 * @param {any} message The message payload/contents.
	 * @returns {void}
	 */
	broadcast(eventName, message) {
		let realtime = getRealtime();
		if (!realtime) {
			throw new AgnostError(
				t("Realtime is not enabled in your app version settings."),
				ERROR_CODES.realtimeNotEnabled
			);
		}

		realtime.emit("broadcast_message", {
			eventName: eventName,
			envId: META.getEnvId(),
			message: message,
		});
	}

	/**
	 * Sends the message identified by the `eventName` to the provided channel members only. All serializable datastructures are supported for the `message`, including `Buffer`.
	 *
	 * @param {string} channel The name of the channel.
	 * @param {string} eventName The name of the event.
	 * @param {any} message The message payload/contents.
	 * @returns {void}
	 */
	send(channel, eventName, message) {
		let realtime = getRealtime();
		if (!realtime) {
			throw new AgnostError(
				t("Realtime is not enabled in your app version settings."),
				ERROR_CODES.realtimeNotEnabled
			);
		}

		realtime.emit("send_message", {
			channelName: channel,
			eventName: eventName,
			envId: META.getEnvId(),
			message: message,
		});
	}

	/**
	 * Returns the members of the specified channel.
	 *
	 * @param {string} channel The name of the channel.
	 * @returns Returns array of channel member data. If no channel members then returns and empty array []
	 */
	async getMembers(channel) {
		let realtime = getRealtime();
		if (!realtime) {
			throw new AgnostError(
				t("Realtime is not enabled in your app version settings."),
				ERROR_CODES.realtimeNotEnabled
			);
		}

		return new Promise(async (resolve, reject) => {
			realtime
				.timeout(AWAIT_TIMEOUT)
				.emit(
					"get_members",
					{ envId: META.getEnvId(), channel: channel },
					(err, response) => {
						if (err) {
							reject(
								new AgnostError(
									t(
										"Cannot get the list of members of channel '%s'. %s",
										channel,
										err
									),
									ERROR_CODES.getMembersError
								)
							);
						} else resolve(response);
					}
				);
		});
	}
}
