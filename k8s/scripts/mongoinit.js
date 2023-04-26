// Connect to admin database to create users
db = new Mongo().getDB("admin");

// Create admin user with clusterAdim role. Provides the greatest cluster-management access.
// This role combines the privileges granted by the clusterManager, clusterMonitor, and hostManager roles.
// Additionally, the role provides the dropDatabase action.
db.createUser({
	user: "cluster_admin",
	pwd: "G3oUiFhcKczQI6lJ",
	roles: [
		{
			role: "clusterAdmin",
			db: "admin",
		},
	],
});

// Authenticate with cluster_admin user
db.auth("cluster_admin", "G3oUiFhcKczQI6lJ");

// Switch to main database
db = db.getSiblingDB("main");

// Create platform_admin user in main database (used in platform app)
db.createUser({
	user: "mongodb_admin",
	pwd: "G3oUiFhcKczQI6lJ",
	roles: [
		{
			role: "dbOwner",
			db: "main",
		},
	],
});
