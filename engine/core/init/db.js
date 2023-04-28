import mongo from "mongodb";

//MongoDB client
var client;

export const connectToDatabase = async () => {
	try {
		client = new mongo.MongoClient(process.env.ENGINE_DB_URI, {
			minPoolSize: config.get("database.minPoolSize"),
			useNewUrlParser: true,
			auth: {
				username: process.env.ENGINE_DB_USER,
				password: process.env.ENGINE_DB_PWD,
			},
		});
		//Connect to the database of the application
		await client.connect();
		logger.info(`Connected to the database ${process.env.ENGINE_DB_URI}`);
	} catch (err) {
		logger.error(`Cannot connect to the database`, { details: err });
		process.exit(1);
	}
};

export const disconnectFromDatabase = async () => {
	await client.close();
	logger.info("Disconnected from the database");
};

export const getDBClient = () => {
	return client;
};
