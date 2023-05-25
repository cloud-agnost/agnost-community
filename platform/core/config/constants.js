// Types of login providers supported. Initially we support agnost (email and password based authentication),
// later on we can support , "github", "bitbucket", "gitlab" etc.
export const providerTypes = ["agnost"];

// Notification types
export const notificationTypes = [
	"org",
	"app",
	"version",
	"database",
	"model",
	"field",
	"endpoint",
	"queue",
	"cronjob",
	"cache",
	"storage",
	"resource",
	"environment",
];

// User statuses. The Pending status is only used during the sign up of the cluster owner, e.g., initialization of the cluster
export const userStatus = ["Active", "Pending", "Deleted"];

// Admin - Can access all organization data including all apps of the organization. Can manage organization resources, organization members and organization settings.
// Member - Can access organization data and view apps that they are a member of. Cannot manage organization resources organization members and organization settings.
// Resource Manager - Can access organization data and view apps that they are a member of.  Can manage organization resources but cannot manage organization members or organization settings.
// Viewer - Can access organization data and view apps that they are a member of.  Cannot manage organization resources, organization members and organization settings.
export const orgRoles = ["Admin", "Member", "Resource Manager", "Viewer"];

// Application team member roles
export const appRoles = ["Admin", "Developer", "Viewer"];

// Invitation statuses
export const invitationStatus = ["Pending", "Accepted", "Rejected"];

export const engineErrorType = [
	"endpoint",
	"queue",
	"cronjob",
	"worker",
	"engine",
	"monitor",
	"scheduler",
	"realtime",
];

export const envActions = [
	"deploy",
	"redeploy",
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
	"Auto-deploying",
	"Deleting",
];

export const logStatuses = ["OK", "Error"];

export const envLogTypes = ["db", "server", "scheduler"];

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

export const resourceActions = ["create", "update", "delete", "bind", "check"];

export const resourceStatuses = [
	"Binding", // Valid for default cluster resources
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
	"realtime",
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
	engine: ["API Server"],
	database: ["PostgreSQL", "MySQL", "SQL Server", "MongoDB", "Oracle"],
	cache: ["Redis"],
	storage: [
		"AWS S3",
		"GCP Cloud Storage",
		"Azure Blob Storage",
		"Cluster Storage",
	],
	queue: ["RabbitMQ", "Kafka"],
	scheduler: ["Default Scheduler"],
	realtime: ["Default Realtime"],
};

export const methodTypes = ["GET", "POST", "PUT", "DELETE"];

export const schedulTypes = ["every", "day", "week", "month", "plain"];

export const intervalTypes = ["minute", "hour"];

export const apiKeyTypes = [
	"no-access",
	"full-access",
	"custom-allowed",
	"custom-excluded",
];

export const osTypes = ["ios", "android", "macos", "windows", "linux", "other"];

export const smsProviders = ["Twilio", "MessageBird", "Vonage"];

export const oAuthProviderTypes = [
	"google",
	"facebook",
	"twitter",
	"apple",
	"discord",
	"github",
];
