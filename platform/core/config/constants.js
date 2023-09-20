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
	"task",
	"cache",
	"storage",
	"resource",
	"environment",
	"middleware",
	"function",
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

export const fieldTypes = [
	{
		name: "id",
		group: "none",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		Oracle: true,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
			searchable: false,
		},
	},
	{
		name: "text",
		group: "textual",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		Oracle: true,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
			searchable: true,
		},
	},
	{
		name: "rich-text",
		group: "textual",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		Oracle: true,
		view: {
			unique: false,
			indexed: false,
			immutable: true,
			searchable: true,
		},
	},
	{
		name: "encrypted-text",
		group: "textual",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		Oracle: true,
		view: {
			unique: false,
			indexed: false,
			immutable: true,
			searchable: false,
		},
	},
	{
		name: "email",
		group: "textual",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		Oracle: true,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
			searchable: false,
		},
	},
	{
		name: "link",
		group: "textual",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		Oracle: true,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
			searchable: false,
		},
	},
	{
		name: "phone",
		group: "textual",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		Oracle: true,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
			searchable: false,
		},
	},
	{
		name: "boolean",
		group: "numeric",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		Oracle: true,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
			searchable: false,
		},
	},
	{
		name: "integer",
		group: "numeric",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		Oracle: true,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
			searchable: false,
		},
	},
	{
		name: "decimal",
		group: "numeric",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		Oracle: true,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
			searchable: false,
		},
	},
	{
		name: "createdat",
		group: "none",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		Oracle: true,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
			searchable: false,
		},
	},
	{
		name: "updatedat",
		group: "none",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		Oracle: true,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
			searchable: false,
		},
	},
	{
		name: "datetime",
		group: "datetime",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		Oracle: true,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
			searchable: false,
		},
	},
	{
		name: "date",
		group: "datetime",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: false,
		Oracle: false,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
			searchable: false,
		},
	},
	{
		name: "time",
		group: "datetime",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: false,
		Oracle: false,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
			searchable: false,
		},
	},
	{
		name: "enum",
		group: "advanced",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		Oracle: true,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
			searchable: false,
		},
	},
	{
		name: "geo-point",
		group: "advanced",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		Oracle: true,
		view: {
			unique: false,
			indexed: true,
			immutable: true,
			searchable: false,
		},
	},
	{
		name: "binary",
		group: "advanced",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		Oracle: true,
		view: {
			unique: false,
			indexed: false,
			immutable: true,
			searchable: false,
		},
	},
	{
		name: "json",
		group: "advanced",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		Oracle: true,
		view: {
			unique: false,
			indexed: false,
			immutable: true,
			searchable: false,
		},
	},
	{
		name: "reference",
		group: "advanced",
		PostgreSQL: true,
		MySQL: true,
		"SQL Server": true,
		MongoDB: true,
		Oracle: true,
		view: {
			unique: true,
			indexed: true,
			immutable: true,
			searchable: false,
		},
	},
	{
		name: "basic-values-list",
		group: "advanced",
		PostgreSQL: false,
		MySQL: false,
		"SQL Server": false,
		MongoDB: true,
		Oracle: false,
		view: {
			unique: false,
			indexed: true,
			immutable: true,
			searchable: false,
		},
	},
	{
		name: "object",
		group: "sub-models",
		PostgreSQL: false,
		MySQL: false,
		"SQL Server": false,
		MongoDB: true,
		Oracle: false,
		view: {
			unique: false,
			indexed: false,
			immutable: false,
			searchable: false,
		},
	},
	{
		name: "object-list",
		group: "sub-models",
		PostgreSQL: false,
		MySQL: false,
		"SQL Server": false,
		MongoDB: true,
		Oracle: false,
		view: {
			unique: false,
			indexed: false,
			immutable: false,
			searchable: false,
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

export const dbTypeMappings = {
	MongoDB: {
		id: "id",
		text: "text",
		"rich-text": "rich-text",
		"encrypted-text": "encrypted-text",
		email: "email",
		link: "link",
		phone: "phone",
		boolean: "boolean",
		integer: "integer",
		decimal: "decimal",
		createdat: "createdat",
		updatedat: "updatedat",
		datetime: "datetime",
		date: "date",
		time: "time",
		enum: "enum",
		"geo-point": "geo-point",
		binary: "binary",
		json: "json",
		reference: "reference",
		"basic-values-list": "basic-values-list",
		"object-list": "object-list",
		object: "object",
	},
	PostgreSQL: {
		id: "bigserial",
		text: "varchar",
		"rich-text": "text",
		"encrypted-text": "varchar",
		email: "varchar",
		link: "varchar",
		phone: "varchar",
		boolean: "boolean",
		integer: "integer",
		decimal: "decimal",
		createdat: "timestamp",
		updatedat: "timestamp",
		datetime: "timestamp",
		date: "date",
		time: "time",
		enum: "varchar",
		"geo-point": "point",
		binary: "bytea",
		json: "jsonb",
		reference: "bigint",
		"basic-values-list": "undefined",
		"object-list": "undefined",
		object: "undefined",
	},
	MySQL: {
		id: "bigint",
		text: "varchar",
		"rich-text": "longtext",
		"encrypted-text": "varchar",
		email: "varchar",
		link: "varchar",
		phone: "varchar",
		boolean: "boolean",
		integer: "int",
		decimal: "decimal",
		createdat: "datetime",
		updatedat: "datetime",
		datetime: "datetime",
		date: "date",
		time: "time",
		enum: "varchar",
		"geo-point": "point",
		binary: "blob",
		json: "json",
		reference: "bigint",
		"basic-values-list": "undefined",
		"object-list": "undefined",
		object: "undefined",
	},
	"SQL Server": {
		id: "bigint",
		text: "nvarchar",
		"rich-text": "nvarchar(max)",
		"encrypted-text": "nvarchar",
		email: "nvarchar",
		link: "nvarchar",
		phone: "nvarchar",
		boolean: "bit",
		integer: "int",
		decimal: "decimal",
		createdat: "datetime",
		updatedat: "datetime",
		datetime: "datetime",
		date: "date",
		time: "time",
		enum: "nvarchar",
		"geo-point": "geography",
		binary: "binary",
		json: "nvarchar",
		reference: "bigint",
		"basic-values-list": "undefined",
		"object-list": "undefined",
		object: "undefined",
	},
	Oracle: {
		id: "number",
		text: "varchar",
		"rich-text": "clob",
		"encrypted-text": "varchar",
		email: "varchar",
		link: "varchar",
		phone: "varchar",
		boolean: "number",
		integer: "number",
		decimal: "number",
		createdat: "timestamp",
		updatedat: "timestamp",
		datetime: "timestamp",
		date: "undefined",
		time: "undefined",
		enum: "nvarchar",
		"geo-point": "point",
		binary: "blob",
		json: "json",
		reference: "number",
		"basic-values-list": "undefined",
		"object-list": "undefined",
		object: "undefined",
	},
};

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

export const defaultEndpointCode = `const endpointHandler = async (req, res) => {
	res.json();
};

export default endpointHandler;`;

export const defaultMiddlewareCode = `const middlewareHandler = async (req, res, next) => {
	next();
};

export default middlewareHandler;`;

export const defaultQueueCode = `const queueHandler = async (message) => {

};

export default queueHandler;`;

export const defaultTaskCode = `const cronJobHandler = async () => {

};

export default cronJobHandler;`;

export const defaultFunctionCode = `const helperFunction = async (param) => {

};

export default defaultFunctionCode;`;
