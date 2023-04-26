import mongo from "mongodb";

//MongoDB client
var client;

export const connectToDatabase = async () => {
	try {
		client = new mongo.MongoClient(
			`mongodb://${process.env.ENGINE_DB_USER}:${process.env.ENGINE_DB_PWD}@engine-mongodb-clusterip-service`,
			{
				minPoolSize: config.get("database.minPoolSize"),
				useNewUrlParser: true,
			}
		);
		//Connect to the database of the application
		await client.connect();
		logger.info(`Connected to the database @${config.get("database.uri")}`);
	} catch (err) {
		logger.error(`Cannot connect to the database`, { details: err });
		process.exit(1);
	}
};

export const disconnectFromDatabase = async () => {
	await client.close();
	logger.info("Disconnected from the database");
};

export const getMongoDBClient = () => {
	return client;
};
