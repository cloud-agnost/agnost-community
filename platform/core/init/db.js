import mongoose from "mongoose";

export const connectToDatabase = async () => {
	try {
		mongoose.set("strictQuery", false);
		await mongoose.connect(process.env.PLATFORM_DB_URI, {
			user: process.env.PLATFORM_DB_USER,
			pass: process.env.PLATFORM_DB_PWD,
			minPoolSize: config.get("database.minPoolSize"),
		});

		logger.info(`Connected to the database @${process.env.PLATFORM_DB_URI}`);
	} catch (err) {
		logger.error(`Cannot connect to the database`, { details: err });
		process.exit(1);
	}
};

export const disconnectFromDatabase = async () => {
	await mongoose.disconnect();
	logger.info("Disconnected from the database");
};
