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
			source: "engine-core",
			name: log.details?.name,
			message: log.details?.message,
			details: log.message,
			stack: log.details?.stack,
			payload: log.payload,
			code: ERROR_CODES.internalServerError,
		};

		callback();
	}
}

const logFormat = printf(({ level, message, label, timestamp }) => {
	return `${timestamp} ${level}: ${message}`;
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
