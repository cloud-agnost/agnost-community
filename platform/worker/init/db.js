import mongo from "mongodb";

var dbConnection = null;

export const connectToDatabase = async () => {
	try {
		// Create a new MongoClient
		dbConnection = new mongo.MongoClient(process.env.CLUSTER_DB_URI, {
			minPoolSize: config.get("database.minPoolSize"),
			auth: {
				username: process.env.CLUSTER_DB_USER,
				password: process.env.CLUSTER_DB_PWD,
			},
		});

		//Connect to the platform database
		await dbConnection.connect();

		logger.info(`Connected to the database @${process.env.CLUSTER_DB_URI}`);
	} catch (err) {
		logger.error(`Cannot connect to the database`, {
			details: err,
		});
		process.exit(1);
	}
};

export const disconnectFromDatabase = async () => {
	await dbConnection.close();
	logger.info("Disconnected from the database");
};

export const getDBClient = () => {
	return dbConnection;
};
