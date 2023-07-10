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

export const envActions = ["deploy", "redeploy", "auto-deploy", "delete"];

export const envStatuses = [
	"OK",
	"Error",
	"Deploying",
	"Redeploying",
	"Deleting",
];

export const logStatuses = ["OK", "Error"];

export const envLogTypes = ["db", "server", "scheduler"];

// sub-model-object: for single child or reference objects
// sub-model-list: for a collection of child objects within a parent document
export const modelTypes = ["model", "sub-model-object", "sub-model-list"];
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
		view: {
			unique: true,
			indexed: true,
			immutable: true,
		},
	},
	{
		name: "text",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
		},
	},
	{
		name: "rich-text",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		view: {
			unique: false,
			indexed: true,
			immutable: true,
		},
	},
	{
		name: "encrypted-text",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		view: {
			unique: false,
			indexed: false,
			immutable: true,
		},
	},
	{
		name: "email",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
		},
	},
	{
		name: "link",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
		},
	},
	{
		name: "phone",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
		},
	},
	{
		name: "boolean",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
		},
	},
	{
		name: "integer",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
		},
	},
	{
		name: "decimal",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
		},
	},
	{
		name: "monetary",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
		},
	},
	{
		name: "createdat",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
		},
	},
	{
		name: "updatedat",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
		},
	},
	{
		name: "datetime",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
		},
	},
	{
		name: "date",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: false,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
		},
	},
	{
		name: "time",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: false,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
		},
	},
	{
		name: "enum",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
		},
	},
	{
		name: "geo-point",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		view: {
			unique: false,
			indexed: true,
			immutable: true,
		},
	},
	{
		name: "binary",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		view: {
			unique: false,
			indexed: false,
			immutable: true,
		},
	},
	{
		name: "json",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": false,
		MongoDB: true,
		view: {
			unique: false,
			indexed: false,
			immutable: true,
		},
	},
	{
		name: "parent",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
		},
	},
	{
		name: "object",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		view: {
			unique: false,
			indexed: false,
			immutable: false,
		},
	},
	{
		name: "reference",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
		},
	},
	{
		name: "object-list",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		view: {
			unique: false,
			indexed: false,
			immutable: false,
		},
	},
	{
		name: "basic-values-list",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		view: {
			unique: false,
			indexed: true,
			immutable: true,
		},
	},
];

export const databaseTypes = [
	"PostgreSQL",
	"MySQL",
	"SQL Server",
	"MongoDB",
	"Oracle",
];

export const cacheTypes = ["Redis"];

export const messageBrokerTypes = ["RabbitMQ", "Kafka"];

export const mongoDBConnFormat = ["mongodb", "mongodb+srv"];

export const rabbitMQConnFormat = ["object", "url"];

export const rabbitMQConnScheme = ["amqp", "amqps"];

export const kafkaConnFormat = ["simple", "ssl", "sasl"];

export const kafkaSaslMechanism = ["plain", "scram-sha-256", "scram-sha-512"];

export const resourceActions = ["create", "update", "delete", "bind", "check"];

export const resourceStatuses = [
	"Binding", // Valid for default cluster resources
	"Creating",
	"OK",
	"Error",
	"Updating",
	"Deleting",
	"Idle",
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

export const addResourceTypes = ["database", "cache", "storage", "queue"];

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
	storage: ["AWS S3", "GCP Cloud Storage", "Azure Blob Storage", "MinIO"],
	queue: ["RabbitMQ", "Kafka"],
	scheduler: ["Agenda"],
	realtime: ["Socket.io"],
};

export const addInstanceTypes = {
	database: ["PostgreSQL", "MySQL", "SQL Server", "MongoDB", "Oracle"],
	cache: ["Redis"],
	storage: ["AWS S3", "GCP Cloud Storage", "Azure Blob Storage"],
	queue: ["RabbitMQ", "Kafka"],
};

export const methodTypes = ["GET", "POST", "PUT", "DELETE"];

export const logicTypes = ["code", "flow"];

export const schedulTypes = ["every", "day", "week", "month", "plain"];

export const intervalTypes = ["minute", "hour"];

export const apiKeyTypes = [
	"no-access",
	"full-access",
	"custom-allowed",
	"custom-excluded",
];

export const messageTemplatesTypes = [
	"verify_sms_code",
	"confirm_email",
	"reset_password",
	"magic_link",
	"confirm_email_change",
];

export const phoneAuthSMSProviders = [
	{
		provider: "Twilio",
		params: [
			{
				name: "accountSID",
				title: t("Account SID"),
				type: "string",
				description: t(
					"The SID (String Identifier) of your Twilio account that you will be using to send the SMS messages."
				),
				multiline: false,
			},
			{
				name: "authToken",
				title: t("Authentication Token"),
				type: "string",
				description: t("Token to use to authenticate your account."),
				multiline: false,
			},
			{
				name: "fromNumberOrSID",
				title: t("Phone Number or Messsage Service SID"),
				type: "string",
				description: t(
					"The phone number (in E.164 format i.e., [+] [country code] [subscriber number including area code]) or alphanumeric sender ID that initiated the message."
				),
				multiline: false,
			},
		],
	},
	{
		provider: "MessageBird",
		params: [
			{
				name: "accessKey",
				title: t("Access Key"),
				type: "string",
				description: t(
					"The access key of your MessageBird account that you will be using to send the SMS messages."
				),
				multiline: false,
			},
			{
				name: "originator",
				title: t("Message Sender"),
				type: "string",
				description: t(
					"The phone number (in E.164 format i.e., [+] [country code] [subscriber number including area code]) or alphanumeric string."
				),
				multiline: false,
			},
		],
	},
	{
		provider: "Vonage",
		params: [
			{
				name: "apiKey",
				title: t("API Key"),
				type: "string",
				description: t(
					"The API key of your Vonage account that you will be using to send the SMS messages."
				),
				multiline: false,
			},
			{
				name: "apiSecret",
				title: t("API Secret"),
				type: "string",
				description: t(
					"Used in combination with your API key to authenticate your API requests."
				),
				multiline: false,
			},
			{
				name: "from",
				title: t("Message Sender"),
				type: "string",
				description: t(
					"The phone number (in E.164 format i.e., [+] [country code] [subscriber number including area code]) or alphanumeric senderID."
				),
				multiline: false,
			},
		],
	},
];

export const oAuthProviderTypes = [
	{
		provider: "google",
		params: [
			{
				name: "key",
				title: t("Client Id"),
				type: "string",
				multiline: false,
			},
			{
				name: "secret",
				title: t("Client Secret"),
				type: "string",
				multiline: false,
			},
		],
	},
	{
		provider: "facebook",
		params: [
			{
				name: "key",
				title: t("Client Id"),
				type: "string",
				multiline: false,
			},
			{
				name: "secret",
				title: t("Client Secret"),
				type: "string",
				multiline: false,
			},
		],
	},
	{
		provider: "twitter",
		params: [
			{
				name: "key",
				title: t("Client Key"),
				type: "string",
				multiline: false,
			},
			{
				name: "secret",
				title: t("Client Secret"),
				type: "string",
				multiline: false,
			},
		],
	},
	{
		provider: "apple",
		params: [
			{
				name: "teamId",
				title: t("Team Id"),
				type: "string",
				multiline: false,
			},
			{
				name: "serviceId",
				title: t("Service (Client) Id"),
				type: "string",
				multiline: false,
			},
			{
				name: "keyId",
				title: t("Key Id"),
				type: "string",
				multiline: false,
			},
			{
				name: "privateKey",
				title: t("Private Key"),
				type: "string",
				multiline: true,
			},
		],
	},
	{
		provider: "discord",
		params: [
			{
				name: "key",
				title: t("Client Id"),
				type: "string",
				multiline: false,
			},
			{
				name: "secret",
				title: t("Client Secret"),
				type: "string",
				multiline: false,
			},
		],
	},
	{
		provider: "github",
		params: [
			{
				name: "key",
				title: t("Client Id"),
				type: "string",
				multiline: false,
			},
			{
				name: "secret",
				title: t("Client Secret"),
				type: "string",
				multiline: false,
			},
		],
	},
];

// List of fields that are required to use Agnost's built-in authentication methods
export const authUserDataModel = [
	{
		name: "provider",
		type: "text",
	},
	{
		name: "providerUserId",
		type: "text",
	},
	{
		name: "email",
		type: "email",
	},
	{
		name: "phone",
		type: "phone",
	},
	{
		name: "password",
		type: "encrypted-text",
	},
	{
		name: "name",
		type: "text",
	},
	{
		name: "profilePicture",
		type: "link",
	},
	{
		name: "signUpAt",
		type: "datetime",
	},
	{
		name: "lastLoginAt",
		type: "datetime",
	},
	{
		name: "emailVerified",
		type: "boolean",
	},
	{
		name: "phoneVerified",
		type: "boolean",
	},
	{
		name: "2fa",
		type: "boolean",
	},
	{
		name: "2faSecret",
		type: "text",
	},
];

export const defaultEndpointCode = `const endpointHandler = (req, res) => {
	res.json();
};

export default endpointHandler;`;

export const defaultMiddlewareCode = `const middlewareHandler = (req, res, next) => {
	next();
};

export default middlewareHandler;`;

export const defaultQueueCode = `const queueHandler = (message) => {

};

export default queueHandler;`;

export const defaultTaskCode = `const cronJobHandler = () => {

};

export default cronJobHandler;`;
