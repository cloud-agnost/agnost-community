// Application team member roles
export const appRoles = ["Admin", "Member", "Read-only"];

export const engineErrorType = ["endpoint", "queue", "cronjob", "worker"];

export const envActions = [
	"deploy",
	"redeploy",
	"undeploy",
	"switch",
	"auto-deploy",
	"delete",
];

export const envStatuses = [
	"Idle",
	"OK",
	"Error",
	"Deploying",
	"Redeploying",
	"Undeploying",
	"Auto-deploying",
	"Deleting",
];

export const logStatuses = ["OK", "Error"];

// sub-model-object: for single child or reference objects
// sub-model-list: for a collection of child objects within a parent document
export const modelTypes = ["model", "sub-model-object", "sub-model-list"];
export const crudType = ["create", "read", "update", "delete"];
export const ruleType = ["sql", "exp"];
export const bvlTypes = [
	"text",
	"boolean",
	"integer",
	"decimal",
	"monetary",
	"datetime",
	"date",
	"time",
	"email",
	"link",
	"phone",
	"id",
];

export const fieldTypes = [
	{
		name: "id",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
	},
	{
		name: "text",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
	},
	{
		name: "rich-text",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
	},
	{
		name: "encrypted-text",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
	},
	{
		name: "email",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
	},
	{
		name: "link",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
	},
	{
		name: "phone",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
	},
	{
		name: "boolean",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
	},
	{
		name: "integer",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
	},
	{
		name: "decimal",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
	},
	{
		name: "monetary",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
	},
	{
		name: "createdat",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
	},
	{
		name: "updatedat",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
	},
	{
		name: "datetime",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
	},
	{
		name: "date",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: false,
	},
	{
		name: "time",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: false,
	},
	{
		name: "enum",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
	},
	{
		name: "geo-point",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
	},
	{
		name: "binary",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
	},
	{
		name: "json",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": false,
		MongoDB: true,
	},
	{
		name: "parent",
		PostgreSQL: false,
		MySQL: false,
		"SQL Server": false,
		MongoDB: true,
	},
	{
		name: "object",
		PostgreSQL: false,
		MySQL: false,
		"SQL Server": false,
		MongoDB: true,
	},
	{
		name: "reference",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
	},
	{
		name: "object-list",
		PostgreSQL: false,
		MySQL: false,
		"SQL Server": false,
		MongoDB: true,
	},
	{
		name: "basic-values-list",
		PostgreSQL: false,
		MySQL: false,
		"SQL Server": false,
		MongoDB: true,
	},
];

export const databaseTypes = [
	"PostgreSQL",
	"MySQL",
	"SQL Server",
	"MongoDB",
	"Oracle",
];

export const mongoDBConnFormat = ["mongodb", "mongodb+srv"];

export const resourceActions = ["create", "update", "delete"];

export const resourceStatuses = [
	"Creating",
	"OK",
	"Error",
	"Updating",
	"Deleting",
];

export const resourceTypes = [
	"engine",
	"database",
	"cache",
	"storage",
	"queue",
	"scheduler",
];

export const designElementTypes = [
	"engine",
	"endpoint",
	"database",
	"cache",
	"storage",
	"queue",
	"scheduler",
];

export const instanceTypes = {
	engine: ["Agnost K8s Cluster"],
	database: ["PostgreSQL", "MySQL", "SQL Server", "MongoDB", "Oracle"],
	cache: ["Redis"],
	storage: [
		"AWS S3",
		"GCP Cloud Storage",
		"Azure Blob Storage",
		"Local Storage",
	],
};
