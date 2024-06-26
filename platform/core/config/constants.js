// Types of login providers supported. Initially we support agnost (email and password based authentication),
// later on we can support , "github", "bitbucket", "gitlab" etc.
export const providerTypes = ["agnost"];

export const appTypes = ["nodejs", "project"];

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
export const orgRoleDesc = {
	Admin: t(
		"Full control over the organization and its resources. Can manage organization team and resources (e.g., create or add new database) and can create new apps."
	),
	Member: t(
		"Can view organization resource and members but cannot update them and cannot create new apps."
	),
	"Resource Manager": t(
		"Can view organization resources and members and can only manage organization resources (e.g., create or add new database)."
	),
	Viewer: t(
		"Can view organization resources and members but cannot update them."
	),
};
// Application team member roles
export const appRoles = ["Admin", "Developer", "Viewer"];
export const appRoleDesc = {
	Admin: t(
		"Full control over the app, its design elements and team members. Can manage all app versions even the ones marked as private and even edit the ones marked as read-only."
	),
	Developer: t(
		"Has read-write access over the design elements of his app version. Can view versions marked as public by other team members but cannot manage app team."
	),
	Viewer: t("Read-only access to public app versions and app properties."),
};

// Project team member roles
export const projectRoles = ["Admin", "Developer", "Viewer"];
export const projectRoleDesc = {
	Admin: t(
		"Full control over the project, its environments, containers and team members. Can manage all project environments even the ones marked as private and even edit the ones marked as read-only."
	),
	Developer: t(
		"Has read-write access over the containers of his project environment. Can view environments marked as public by other project members but cannot manage project team."
	),
	Viewer: t(
		"Read-only access to public project environments and project properties."
	),
};

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

export const forbiddenEpPrefixes = ["/agnost"];

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
		id: "serial",
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
		reference: "integer",
		"basic-values-list": "undefined",
		"object-list": "undefined",
		object: "undefined",
	},
	MySQL: {
		id: "int",
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
		reference: "int",
		"basic-values-list": "undefined",
		"object-list": "undefined",
		object: "undefined",
	},
	"SQL Server": {
		id: "int",
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
		reference: "int",
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

export const resourceActions = [
	"create",
	"update",
	"delete",
	"bind",
	"check",
	"restart",
	"restart-managed",
	"manage-tcp-proxy",
];

export const resourceStatuses = [
	"Binding", // Valid for default cluster resources
	"Creating",
	"OK",
	"Error",
	"Updating",
	"Deleting",
	"Idle",
	"Restarting",
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
export const createResourceTypes = ["database", "cache", "queue"];
export const clusterOtherResourceTypes = [
	"database",
	"cache",
	"storage",
	"queue",
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

//  "Kafka","Oracle" "SQL Server" "MinIO"
export const instanceTypes = {
	engine: ["API Server"],
	database: ["PostgreSQL", "MySQL", "MongoDB"],
	cache: ["Redis"],
	storage: ["AWS S3", "GCP Cloud Storage", "Azure Blob Storage"],
	queue: ["RabbitMQ"],
	scheduler: ["Agenda"],
	realtime: ["Socket.io"],
};

export const addInstanceTypes = {
	database: ["PostgreSQL", "MySQL", "SQL Server", "MongoDB", "Oracle"],
	cache: ["Redis"],
	storage: ["AWS S3", "GCP Cloud Storage", "Azure Blob Storage"],
	queue: ["RabbitMQ", "Kafka"],
};

export const clusterResourceInstanceTypes = {
	database: ["MongoDB"],
	cache: ["Redis"],
	storage: ["Minio"],
	queue: ["RabbitMQ"],
};

export const createInstanceTypes = {
	database: ["PostgreSQL", "MySQL", "MongoDB"],
	cache: ["Redis"],
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
];

export const defaultEndpointCode = `import { agnost } from "@agnost/server";

const endpointHandler = async (req, res) => {
	res.json();
};

export default endpointHandler;`;

export const defaultMiddlewareCode = `import { agnost } from "@agnost/server";

const middlewareHandler = async (req, res, next) => {
	next();
};

export default middlewareHandler;`;

export const defaultQueueCode = `import { agnost } from "@agnost/server";

const queueHandler = async (message) => {

};

export default queueHandler;`;

export const defaultTaskCode = `import { agnost } from "@agnost/server";

const cronJobHandler = async () => {

};

export default cronJobHandler;`;

export const defaultFunctionCode = `import { agnost } from "@agnost/server";

const helperFunction = async (param) => {

};

export default helperFunction;`;

export const defaultMessages = (userId) => {
	return [
		{
			type: "verify_sms_code",
			body: "Your authorization code is {{token.code}}",
			createdBy: userId,
		},
		{
			type: "confirm_email",
			subject: "Confirm your email",
			body: `<p>Thank you for signing up. To complete your sign up, we just need to verify your email address.</p>
			<p>Follow this link to confirm your email:</p>
			<p><a href="{{token.confirmationURL}}">Confirm your email</a></p>`,
			createdBy: userId,
		},
		{
			type: "reset_password",
			subject: "Reset your password",
			body: `<p>We heard that you lost your password. Sorry about that! But don’t worry!</p>
			<p>You can use the following link to reset your password:</p>
			<p><a href="{{token.confirmationURL}}">Reset password</a></p>
			<p>If you did not mean to reset your password, then you can just ignore this email; your password will not change.</p>`,
			createdBy: userId,
		},
		{
			type: "magic_link",
			subject: "Your magic link",
			body: `<p>Your magic link is ready to use.</p>
			<p>To access your account simply click the following link:</p>
			<p><a href="{{token.confirmationURL}}">Log in</a></p>`,
			createdBy: userId,
		},
		{
			type: "confirm_email_change",
			subject: "Confirm your new email",
			body: `<p>You requested a change to the email address that you use to sign in to your account.</p>
			<p>Follow this link to confirm the update of your email from {{user.email}} to {{token.email}}:</p>
			<p><a href="{{token.confirmationURL}}">Confirm your email</a></p>`,
			createdBy: userId,
		},
	];
};

// List of resources that can be customized in terms of min and max replicas
export const clusterComponents = [
	{
		deploymentName: "engine-worker-deployment",
		hpaName: "engine-worker-hpa",
	},
	{
		deploymentName: "engine-realtime-deployment",
		hpaName: "engine-realtime-hpa",
	},
	{
		deploymentName: "platform-core-deployment",
		hpaName: "platform-core-hpa",
	},
	{
		deploymentName: "platform-sync-deployment",
		hpaName: "platform-sync-hpa",
	},
	{
		deploymentName: "platform-worker-deployment",
		hpaName: "platform-worker-hpa",
	},
	{
		deploymentName: "studio-deployment",
		hpaName: "studio-hpa",
	},
];

export const clusterOtherComponents = [
	{
		name: "mongodb",
		type: "database",
		instance: "MongoDB",
		k8sName: "mongodb",
	},
	{
		name: "redis-master",
		type: "cache",
		instance: "Redis",
		k8sName: "redis",
	},
	{
		name: "rabbitmq-server",
		type: "queue",
		instance: "RabbitMQ",
		k8sName: "rabbitmq",
	},
	{
		name: "minio",
		type: "storage",
		instance: "Minio",
		k8sName: "minio",
	},
	{
		name: "minio-storage",
		type: "storage",
		instance: "Minio",
		k8sName: "minio-storage",
	},
];

export const clusterComponentStatus = ["OK", "Error", "Updating"];

// List of all cluster resources
export const clusterComponentsAll = [
	{
		deploymentName: "engine-worker-deployment",
		hpaName: "engine-worker-hpa",
	},
	{
		deploymentName: "engine-realtime-deployment",
		hpaName: "engine-realtime-hpa",
	},
	{
		deploymentName: "engine-monitor-deployment",
	},
	{
		deploymentName: "engine-scheduler-deployment",
	},
	{
		deploymentName: "platform-core-deployment",
		hpaName: "platform-core-hpa",
	},
	{
		deploymentName: "platform-sync-deployment",
		hpaName: "platform-sync-hpa",
	},
	{
		deploymentName: "platform-worker-deployment",
		hpaName: "platform-worker-hpa",
	},
	{
		deploymentName: "studio-deployment",
		hpaName: "studio-hpa",
	},
];

export const resourceVersions = {
	MongoDB: ["7.0.1", "6.0.11", "5.0.21", "4.4.25"],
	PostgreSQL: ["15", "14", "13", "12"],
	MySQL: ["8.1.0", "8.0.34"],
	RabbitMQ: ["3.12.6", "3.11.23"],
	Redis: ["7.2.1", "7.0.13", "6.2.13"],
};

export const ftsIndexLanguages = {
	MongoDB: [
		{ value: "danish", name: "danish" },
		{ value: "dutch", name: "dutch" },
		{ value: "english", name: "english" },
		{ value: "finnish", name: "finnish" },
		{ value: "french", name: "french" },
		{ value: "german", name: "german" },
		{ value: "hungarian", name: "hungarian" },
		{ value: "italian", name: "italian" },
		{ value: "norwegian", name: "norwegian" },
		{ value: "portuguese", name: "portuguese" },
		{ value: "romanian", name: "romanian" },
		{ value: "russian", name: "russian" },
		{ value: "spanish", name: "spanish" },
		{ value: "swedish", name: "swedish" },
		{ value: "turkish", name: "turkish" },
	],
	PostgreSQL: [
		{ value: "arabic", name: "arabic" },
		{ value: "armenian", name: "armenian" },
		{ value: "basque", name: "basque" },
		{ value: "catalan", name: "catalan" },
		{ value: "danish", name: "danish" },
		{ value: "dutch", name: "dutch" },
		{ value: "english", name: "english" },
		{ value: "finnish", name: "finnish" },
		{ value: "french", name: "french" },
		{ value: "german", name: "german" },
		{ value: "greek", name: "greek" },
		{ value: "hindi", name: "hindi" },
		{ value: "hungarian", name: "hungarian" },
		{ value: "indonesian", name: "indonesian" },
		{ value: "irish", name: "irish" },
		{ value: "italian", name: "italian" },
		{ value: "lithuanian", name: "lithuanian" },
		{ value: "nepali", name: "nepali" },
		{ value: "norwegian", name: "norwegian" },
		{ value: "portuguese", name: "portuguese" },
		{ value: "romanian", name: "romanian" },
		{ value: "russian", name: "russian" },
		{ value: "serbian", name: "serbian" },
		{ value: "simple", name: "simple" },
		{ value: "spanish", name: "spanish" },
		{ value: "swedish", name: "swedish" },
		{ value: "tamil", name: "tamil" },
		{ value: "turkish", name: "turkish" },
		{ value: "yiddish", name: "yiddish" },
	],
	MySQL: [
		{ value: "utf8mb4_bin", name: "utf8mb4_bin" },
		{ value: "utf8mb4_croatian_ci", name: "utf8mb4_croatian_ci" },
		{ value: "utf8mb4_czech_ci", name: "utf8mb4_czech_ci" },
		{ value: "utf8mb4_danish_ci", name: "utf8mb4_danish_ci" },
		{ value: "utf8mb4_esperanto_ci", name: "utf8mb4_esperanto_ci" },
		{ value: "utf8mb4_estonian_ci", name: "utf8mb4_estonian_ci" },
		{ value: "utf8mb4_general_ci", name: "utf8mb4_general_ci" },
		{ value: "utf8mb4_german2_ci", name: "utf8mb4_german2_ci" },
		{ value: "utf8mb4_hungarian_ci", name: "utf8mb4_hungarian_ci" },
		{ value: "utf8mb4_icelandic_ci", name: "utf8mb4_icelandic_ci" },
		{ value: "utf8mb4_latvian_ci", name: "utf8mb4_latvian_ci" },
		{ value: "utf8mb4_lithuanian_ci", name: "utf8mb4_lithuanian_ci" },
		{ value: "utf8mb4_persian_ci", name: "utf8mb4_persian_ci" },
		{ value: "utf8mb4_polish_ci", name: "utf8mb4_polish_ci" },
		{ value: "utf8mb4_romanian_ci", name: "utf8mb4_romanian_ci" },
		{ value: "utf8mb4_roman_ci", name: "utf8mb4_roman_ci" },
		{ value: "utf8mb4_sinhala_ci", name: "utf8mb4_sinhala_ci" },
		{ value: "utf8mb4_slovak_ci", name: "utf8mb4_slovak_ci" },
		{ value: "utf8mb4_slovenian_ci", name: "utf8mb4_slovenian_ci" },
		{ value: "utf8mb4_spanish2_ci", name: "utf8mb4_spanish2_ci" },
		{ value: "utf8mb4_spanish_ci", name: "utf8mb4_spanish_ci" },
		{ value: "utf8mb4_swedish_ci", name: "utf8mb4_swedish_ci" },
		{ value: "utf8mb4_turkish_ci", name: "utf8mb4_turkish_ci" },
		{ value: "utf8mb4_unicode_520_ci", name: "utf8mb4_unicode_520_ci" },
		{ value: "utf8mb4_unicode_ci", name: "utf8mb4_unicode_ci" },
		{ value: "utf8mb4_vietnamese_ci", name: "utf8mb4_vietnamese_ci" },
	],
	"SQL Server": [
		{ value: "5124", name: "Chinese (Macao SAR)" },
		{ value: "4100", name: "Chinese (Singapore)" },
		{ value: "3098", name: "Serbian (Cyrillic)" },
		{ value: "3082", name: "Spanish" },
		{ value: "3076", name: "Chinese (Hong Kong SAR, PRC)" },
		{ value: "2074", name: "Serbian (Latin)" },
		{ value: "2070", name: "Portuguese" },
		{ value: "2057", name: "British English" },
		{ value: "2052", name: "Simplified Chinese" },
		{ value: "1102", name: "Marathi" },
		{ value: "1100", name: "Malayalam" },
		{ value: "1099", name: "Kannada" },
		{ value: "1098", name: "Telugu" },
		{ value: "1097", name: "Tamil" },
		{ value: "1095", name: "Gujarati" },
		{ value: "1094", name: "Punjabi" },
		{ value: "1093", name: "Bengali (India)" },
		{ value: "1086", name: "Malay - Malaysia" },
		{ value: "1081", name: "Hindi" },
		{ value: "1066", name: "Vietnamese" },
		{ value: "1063", name: "Lithuanian" },
		{ value: "1062", name: "Latvian" },
		{ value: "1060", name: "Slovenian" },
		{ value: "1058", name: "Ukrainian" },
		{ value: "1057", name: "Indonesian" },
		{ value: "1056", name: "Urdu" },
		{ value: "1055", name: "Turkish" },
		{ value: "1054", name: "Thai" },
		{ value: "1053", name: "Swedish" },
		{ value: "1051", name: "Slovak" },
		{ value: "1050", name: "Croatian" },
		{ value: "1049", name: "Russian" },
		{ value: "1048", name: "Romanian" },
		{ value: "1046", name: "Brazilian" },
		{ value: "1045", name: "Polish" },
		{ value: "1044", name: "Bokmål" },
		{ value: "1043", name: "Dutch" },
		{ value: "1042", name: "Korean" },
		{ value: "1041", name: "Japanese" },
		{ value: "1040", name: "Italian" },
		{ value: "1039", name: "Icelandic" },
		{ value: "1037", name: "Hebrew" },
		{ value: "1036", name: "French" },
		{ value: "1033", name: "English" },
		{ value: "1032", name: "Greek" },
		{ value: "1031", name: "German" },
		{ value: "1030", name: "Danish" },
		{ value: "1029", name: "Czech" },
		{ value: "1028", name: "Traditional Chinese" },
		{ value: "1027", name: "Catalan" },
		{ value: "1026", name: "Bulgarian" },
		{ value: "1025", name: "Arabic" },
		{ value: "0", name: "Neutral" },
	],
};

export const apiServerDefaultPackages = {
	"@agnost/server": "1.4.3",
	"@azure/storage-blob": "12.14.0",
	"@google-cloud/storage": "6.10.0",
	amqplib: "0.10.3",
	axios: "1.3.3",
	config: "3.3.9",
	"connect-redis": "7.1.0",
	"cookie-parser": "1.4.6",
	cors: "2.8.5",
	"crypto-js": "4.1.1",
	"decimal.js": "10.4.3",
	express: "4.18.2",
	"express-session": "1.17.3",
	"express-validator": "6.14.3",
	helmet: "6.0.1",
	i18n: "0.15.1",
	jsonwebtoken: "9.0.2",
	kafkajs: "2.2.4",
	minio: "7.1.1",
	mongodb: "5.1.0",
	mssql: "9.1.1",
	multer: "1.4.5-lts.1",
	mysql2: "3.2.0",
	nodemailer: "6.9.5",
	nanoid: "4.0.1",
	nocache: "3.0.4",
	"on-headers": "1.0.2",
	passport: "0.6.0",
	"passport-google-oauth20": "2.0.0",
	"passport-facebook": "3.0.0",
	"passport-twitter": "1.0.4",
	"passport-github2": "0.1.12",
	"passport-discord": "0.1.4",
	"passport-apple": "2.0.2",
	pg: "8.10.0",
	"rate-limiter-flexible": "3.0.0",
	redis: "4.6.9",
	"response-time": "2.3.2",
	"socket.io-client": "4.6.1",
	"ua-parser-js": "1.0.36",
	winston: "3.8.2",
	"winston-transport": "4.5.0",
	bcrypt: "5.1.0",
	luxon: "3.4.1",
	validator: "13.11.0",
};
