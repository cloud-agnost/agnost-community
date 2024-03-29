import mongoose from "mongoose";
import { initializeSearchView } from "./searchView.js";
import { initializeCodeSearchView } from "./codeSearchView.js";

export const connectToDatabase = async () => {
	try {
		mongoose.set("strictQuery", false);
		await mongoose.connect(process.env.CLUSTER_DB_URI, {
			user: process.env.CLUSTER_DB_USER,
			pass: process.env.CLUSTER_DB_PWD,
			maxPoolSize: config.get("database.maxPoolSize"),
		});

		await initializeSearchView();
		await initializeCodeSearchView();

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
