import axios from "axios";
import winston from "winston";
import Transport from "winston-transport";
import ERROR_CODES from "../config/errorCodes.js";

const { combine, timestamp, printf } = winston.format;

// Custom transport to save error logs in MongoDB
class MongoDBTransport extends Transport {
	constructor(opts) {
		super(opts);
	}

	log(log, callback) {
		let entry = {
			source: "platform-sync",
			name: log.details?.name,
			message: log.details?.message,
			details: log.message,
			stack: log.details?.stack,
			payload: log.payload,
			code: ERROR_CODES.internalServerError,
		};

		//Make api call to the platform to log the error message
		axios
			.post(
				config.get("general.platformBaseUrl") + "/v1/platform/error",
				entry,
				{
					headers: {
						Authorization: process.env.MASTER_TOKEN,
						"Content-Type": "application/json",
					},
				}
			)
			.catch((error) => {});

		callback();
	}
}

const logFormat = printf(({ level, message, label, timestamp }) => {
	return `${timestamp} ${level}: ${message}${label ? "\n" + label : ""}`;
});

const logger = winston.createLogger({
	transports: [
		new winston.transports.Console({
			format: combine(timestamp(), logFormat),
			handleExceptions: true,
			level: "info",
			silent: false,
			/* process.env.NODE_ENV == 'production' || process.env.NODE_ENV === 'demo'
					? true
					: false, */
		}),
		new MongoDBTransport({ level: "error" }),
	],
});

export default logger;
