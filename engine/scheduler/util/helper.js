import mongo from "mongodb";

/**
 * Generate a new unique MongoDB identifier
 * @param  {string} id The string representation of a MongoDB id
 */
const generateId = (id = null) => {
	if (id && typeof id === "string") return new mongo.ObjectID(id);
	else if (id instanceof mongo.ObjectID) return id;
	else return new mongo.ObjectID();
};

export default { generateId };
