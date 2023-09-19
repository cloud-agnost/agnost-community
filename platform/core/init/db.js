import mongoose from "mongoose";
import { initializeSearchView } from "./searchView.js";

export const connectToDatabase = async () => {
	try {
		mongoose.set("strictQuery", false);
		await mongoose.connect(process.env.CLUSTER_DB_URI, {
			user: process.env.CLUSTER_DB_USER,
			pass: process.env.CLUSTER_DB_PWD,
			minPoolSize: config.get("database.minPoolSize"),
		});

		await initializeSearchView();

		logger.info(`Connected to the database @${process.env.CLUSTER_DB_URI}`);
	} catch (err) {
		logger.error(`Cannot connect to the database`, { details: err });
		process.exit(1);
	}
};

export const disconnectFromDatabase = async () => {
	await mongoose.disconnect();
	logger.info("Disconnected from the database");
};
