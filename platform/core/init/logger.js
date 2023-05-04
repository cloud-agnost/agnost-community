import winston from "winston";
import mongoose from "mongoose";
import Transport from "winston-transport";
import { PlatformErrorModel } from "../schemas/platformError.js";
import ERROR_CODES from "../config/errorCodes.js";

const { combine, timestamp, printf } = winston.format;

// Custom transport to save error logs in MongoDB
class MongoDBTransport extends Transport {
	constructor(opts) {
		super(opts);
	}

	log(log, callback) {
		let entry = {
			source: "platform-core",
			name: log.details?.name,
			message: log.details?.message,
			details: log.message,
			stack: log.details?.stack,
			payload: log.payload,
			code: ERROR_CODES.internalServerError,
		};

		// If we have a database connection
		if (mongoose.connection?.readyState === 1) {
			// Save the error to the errors collection, do not wait for the save operation to complete and write it fast
			new PlatformErrorModel(entry).save({ w: 0 });
		}

		callback();
	}
}

const logFormat = printf((log) => {
	let { level, message, label, timestamp } = log;
	//console.log("****log", JSON.stringify(log, null, 3));
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
