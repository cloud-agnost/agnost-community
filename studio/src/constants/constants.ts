import Database from '@/assets/images/database.png';
import Rapid from '@/assets/images/rapid.png';
import Realtime from '@/assets/images/realtime.png';
import {
	ApiKeys,
	Apple,
	Authentication,
	Awss3,
	AzureBlobStorage,
	BellRing,
	Binary,
	Cache,
	Calendar,
	ChangeLog,
	Connect,
	Dashboard,
	Database as DatabaseIcon,
	Decimal,
	Decision,
	DeviceMobile,
	Discord,
	Environment,
	EnvironmentVariable,
	Facebook,
	GcpStorage,
	Github,
	Google,
	Integer,
	Kafka,
	LineSegments,
	MessageQueue,
	Middleware,
	MinIo,
	MongoDb,
	MySql,
	Nodejs,
	NpmPackage,
	Object as ObjectIcon,
	ObjectList,
	Oracle,
	PostgreSql,
	RabbitMq,
	RateLimit,
	React,
	RealTime,
	Redis,
	Resource,
	RichText,
	SocketIo,
	SqlServer,
	Storage,
	Team,
	Timestamp,
	Twitter,
} from '@/components/icons';
import {
	ConnectAWS,
	ConnectAzure,
	ConnectCache,
	ConnectDatabase,
	ConnectGCP,
	ConnectQueue,
} from '@/features/resources';
import useApplicationStore from '@/store/app/applicationStore';
import useTabStore from '@/store/version/tabStore';
import useVersionStore from '@/store/version/versionStore.ts';
import {
	Application,
	EnvironmentStatus,
	HttpMethod,
	Instance,
	OAuthProviderTypes,
	ResourceCreateType,
	ResourceInstances,
	ResourceType,
	SortOption,
	Tab,
	TabTypes,
} from '@/types';
import { generateId, notify, translate } from '@/utils';
import {
	BracketsCurly,
	Clock,
	CurrencyDollarSimple,
	Envelope,
	FileText,
	Function,
	GearSix,
	IdentificationBadge,
	Key,
	LinkSimple,
	ListChecks,
	ListNumbers,
	LockSimple,
	MapPin,
	Phone,
	Plus,
	Share,
	Table,
	TextAa,
	Textbox,
} from '@phosphor-icons/react';
import { BadgeColors } from 'components/Badge/Badge.tsx';
import { ElementType } from 'react';
import * as z from 'zod';

export const PAGE_SIZE = 10;
export const UI_BASE_URL = window.location.origin;
export const MIN_DB_SIZE = 1;
export const MAX_DB_SIZE = 50;

export const SLIDER_IMAGES = [
	{
		text: translate('general.slider.rapid'),
		image: Rapid,
	},
	{
		text: translate('general.slider.database'),
		image: Database,
	},
	{
		text: translate('general.slider.realtime'),
		image: Realtime,
	},
];

export const MENU_ITEMS = [
	{
		title: 'Change Log',
		url: '/change-log',
		icon: ChangeLog,
	},
	{
		title: 'Docs',
		url: 'https://agnost.dev/docs/installation/installation-minikube',
		icon: FileText,
	},
];

export const MENU_ITEMS_FOR_PROFILE_SETTINGS = [
	{
		title: translate('profileSettings.general_title'),
		href: '/profile/settings',
		icon: GearSix,
	},
	{
		title: translate('profileSettings.notifications_title'),
		href: '/profile/settings/notifications',
		icon: BellRing,
	},
	{
		title: translate('profileSettings.clusters_title'),
		href: '/profile/settings/cluster-management',
		icon: LineSegments,
	},
];

export const ORGANIZATION_MENU_ITEMS = [
	{
		name: translate('organization.menu.apps'),
		href: 'apps',
		icon: DeviceMobile,
	},
	{
		name: translate('organization.menu.resources'),
		href: 'resources',
		icon: DatabaseIcon,
	},
	{
		name: translate('organization.menu.settings'),
		href: 'settings',
		icon: GearSix,
	},
];

export const APPLICATION_SETTINGS = [
	{
		id: 'version',
		name: translate('application.settings.openVersion'),
		onClick: (application: Application) => {
			useApplicationStore.getState().openVersionDrawer(application);
		},
		permissionKey: 'version.view',
	},
	{
		id: 'update',
		name: translate('application.settings.editApp'),
		onClick: (application: Application) => {
			useApplicationStore.getState().openEditAppDrawer(application);
			const searchParams = new URLSearchParams(window.location.search);
			if (!searchParams.get('t')) {
				searchParams.set('t', 'general');
				window.history.replaceState(
					null,
					'',
					`${window.location.pathname}?${searchParams.toString()}`,
				);
			}
		},
		permissionKey: 'update',
	},
	{
		id: 'invite',
		name: translate('general.addMembers'),
		onClick: (application: Application) => {
			useApplicationStore.getState().openInviteMemberDrawer(application);
		},
		permissionKey: 'invite.create',
	},
];

export const ORGANIZATION_SETTINGS = [
	{
		title: translate('organization.settings.general'),
		href: '/organization/:id/settings',
		icon: GearSix,
	},
	{
		title: translate('organization.settings.members.title'),
		href: '/organization/:id/settings/members',
		icon: Team,
	},
];

export const ALL_NOTIFICATIONS = [
	'org',
	'app',
	'version',
	'database',
	'model',
	'field',
	'endpoint',
	'queue',
	'cronjob',
	'cache',
	'storage',
	'resource',
	'environment',
];

export const ERROR_CODES_TO_REDIRECT_LOGIN_PAGE = [
	'invalid_session',
	'missing_access_token',
	'invalid_access_token',
	'missing_refresh_token',
	'invalid_refresh_token',
];

export const ORG_MEMBERS_SORT_OPTIONS: SortOption[] = [
	{
		name: translate('general.sortOptions.default'),
		value: 'default',
	},
	{
		name: translate('general.sortOptions.joinDate'),
		value: 'joinDate',
		sortDir: 'desc',
	},
	{
		name: translate('general.sortOptions.nameAsc'),
		value: 'name',
		sortDir: 'asc',
	},
	{
		name: translate('general.sortOptions.nameDesc'),
		value: 'name',
		sortDir: 'desc',
	},
];

export const INVITATIONS_SORT_OPTIONS: SortOption[] = [
	{
		name: translate('general.sortOptions.inviteDate'),
		value: 'createdAt',
		sortDir: 'desc',
	},
	{
		name: translate('general.sortOptions.emailAsc'),
		value: 'email',
		sortDir: 'asc',
	},
	{
		name: translate('general.sortOptions.emailDesc'),
		value: 'email',
		sortDir: 'desc',
	},
];
export const NEW_TAB_ITEMS: Omit<Tab, 'id'>[] = [
	{
		title: translate('version.databases'),
		path: 'database',
		isActive: false,
		isDashboard: false,
		type: TabTypes.Database,
	},
	{
		title: translate('version.storage'),
		path: '/storage',
		isActive: false,
		isDashboard: false,
		type: TabTypes.Storage,
	},
	{
		title: translate('version.cache'),
		path: '/cache',
		isActive: false,
		isDashboard: false,
		type: TabTypes.Cache,
	},
	{
		title: translate('version.endpoints'),
		path: '/endpoint',
		isActive: false,
		isDashboard: false,
		type: TabTypes.Endpoint,
	},
	{
		title: translate('version.message_queues'),
		path: '/queue',
		isActive: false,
		isDashboard: false,
		type: TabTypes.MessageQueue,
	},
	{
		title: translate('version.cron_jobs'),
		path: '/task',
		isActive: false,
		isDashboard: false,
		type: TabTypes.Task,
	},
	{
		title: translate('version.middleware.default'),
		path: '/middleware',
		isActive: false,
		isDashboard: false,
		type: TabTypes.Middleware,
	},
	{
		title: translate('version.function'),
		path: '/function',
		isActive: false,
		isDashboard: false,
		type: TabTypes.Function,
	},
];

export const BADGE_COLOR_MAP: Record<string, BadgeColors> = {
	SUSPENDED: 'yellow',
	DEPLOYING: 'blue',
	ERROR: 'red',
	OK: 'green',
	GOOD: 'green',
	YES: 'green',
	NO: 'red',
	ADMIN: 'orange',
	DEVELOPER: 'purple',
	VIEWER: 'blue',
	CREATING: 'blue',
	UPDATING: 'yellow',
	DELETING: 'red',
	BINDING: 'blue',
	OPTIONAL: 'yellow',
	REQUIRED: 'blue',
	ENABLED: 'green',
	DISABLED: 'red',
	SUCCESS: 'green',
	LOG: 'green',
	INFO: 'blue',
	WARN: 'yellow',
	DEBUG: 'purple',
	IDLE: 'orange',
	TRUE: 'green',
	FALSE: 'red',
};

export const EDIT_APPLICATION_MENU_ITEMS = [
	{
		name: translate('application.edit.general'),
		href: 'general',
	},
	{
		name: translate('application.edit.members'),
		href: 'members',
	},
	{
		name: translate('application.edit.invitations'),
		href: 'invitations',
	},
];

export const AUTH_MENU_ITEMS = [
	{
		name: translate('version.settings.general'),
		href: 'general',
	},
	{
		name: translate('version.authentication.providers'),
		href: 'providers',
	},
	{
		name: translate('version.authentication.message_templates'),
		href: 'templates',
	},
];

export const TEST_ENDPOINTS_MENU_ITEMS = [
	{
		name: translate('endpoint.test.params'),
		href: 'params',
		isPath: false,
		allowedMethods: ['GET', 'DELETE', 'PUT', 'POST'],
	},
	{
		name: translate('endpoint.test.path_variables'),
		href: 'variables',
		isPath: true,
		allowedMethods: ['GET', 'DELETE', 'PUT', 'POST'],
	},
	{
		name: translate('endpoint.test.headers'),
		href: 'headers',
		isPath: false,
		allowedMethods: ['GET', 'DELETE', 'PUT', 'POST'],
	},
	{
		name: translate('endpoint.test.body'),
		href: 'body',
		isPath: false,
		allowedMethods: ['DELETE', 'PUT', 'POST'],
	},
];

export const VERSION_SETTINGS_MENU_ITEMS = [
	{
		id: 1,
		title: translate('version.settings.general'),
		path: '',
		icon: GearSix,
	},
	{
		id: 2,
		title: translate('version.settings.environment'),
		path: 'environment',
		icon: Environment,
	},
	{
		id: 4,
		title: translate('version.settings.npm_packages'),
		path: 'npm-packages',
		icon: NpmPackage,
	},
	{
		id: 5,
		title: translate('version.settings.environment_variables'),
		path: 'environment-variables',
		icon: EnvironmentVariable,
	},
	{
		id: 6,
		title: translate('version.settings.rate_limits'),
		path: 'rate-limits',
		icon: RateLimit,
	},
	{
		id: 7,
		title: translate('version.settings.authentications'),
		path: 'authentications?t=general',
		icon: Authentication,
	},
	{
		id: 8,
		title: translate('version.settings.api_keys'),
		path: 'api-keys',
		icon: Key,
	},
	{
		id: 9,
		title: translate('version.settings.real_time'),
		path: 'real-time',
		icon: RealTime,
	},
];

export const RESOURCE_TYPES = [
	{
		id: 'database',
		name: translate('version.databases'),
		icon: Resource,
	},
	{
		id: 'storage',
		name: translate('version.storage'),
		icon: Storage,
	},
	{
		id: 'cache',
		name: translate('version.cache'),
		icon: Cache,
	},
	{
		id: 'message-queue',
		name: translate('version.message_queues'),
		icon: MessageQueue,
	},
];

export const DEFAULT_RESOURCE_INSTANCES: Instance[] = [
	{
		id: ResourceCreateType.New,
		name: translate('resources.create_new'),
		icon: Plus,
	},
	{
		id: ResourceCreateType.Existing,
		name: translate('resources.connect_existing'),
		icon: Connect,
	},
];

export const DATABASE_ICON_MAP: Record<string, ElementType> = {
	MongoDB: MongoDb,
	MySQL: MySql,
	PostgreSQL: PostgreSql,
	Oracle: Oracle,
	'SQL Server': SqlServer,
};
export const QUEUE_ICON_MAP: Record<string, ElementType> = {
	RabbitMQ: RabbitMq,
	Kafka: Kafka,
};

export const STORAGE_ICON_MAP: Record<string, ElementType> = {
	'AWS S3': Awss3,
	'Azure Blob Storage': AzureBlobStorage,
	'GCP Cloud Storage': GcpStorage,
	MinIO: MinIo,
};

export const CREATE_RESOURCES_ELEMENTS = [
	{
		name: translate('version.databases'),
		resourceType: ResourceType.Database,
		instance: ResourceType.Database,
		CurrentResourceElement: ConnectDatabase,
	},
	{
		name: translate('version.storage'),
		resourceType: ResourceType.Storage,
		instance: ResourceInstances.GCPStorage,
		CurrentResourceElement: ConnectGCP,
	},
	{
		name: translate('version.storage'),
		resourceType: ResourceType.Storage,
		instance: ResourceInstances.AWSS3,
		CurrentResourceElement: ConnectAWS,
	},
	{
		name: translate('version.storage'),
		resourceType: ResourceType.Storage,
		instance: ResourceInstances.AzureBlob,
		CurrentResourceElement: ConnectAzure,
	},
	{
		name: translate('version.cache'),
		resourceType: ResourceType.Cache,
		instance: ResourceInstances.Redis,
		CurrentResourceElement: ConnectCache,
	},
	{
		name: translate('version.message_queues'),
		resourceType: ResourceType.Queue,
		instance: ResourceInstances.RabbitMQ,
		CurrentResourceElement: ConnectQueue,
	},
];
export const VERSION_DROPDOWN_ITEM = [
	{
		title: translate('version.open_version'),
		action: () => {
			const { application, openVersionDrawer } = useApplicationStore.getState();
			if (!application) return;
			openVersionDrawer(application);
		},
		//TODO disabled: useVersionStore.getState().versions.length <= 1,
	},
	{
		title: translate('version.create_a_copy'),

		action: async () => {
			useVersionStore.getState().setCreateCopyVersionDrawerIsOpen(true);
		},
	},
	// {
	// 	title: () => translate('version.merge'),
	// 	active: () => false,
	// 	action: () => {
	// 		// TODO: implement
	// 	},
	// 	disabled: () => true,
	// 	after: () => DropdownMenuSeparator,
	// },
	// {
	// 	title: () => translate('version.export'),
	// 	active: () => false,
	// 	action: () => {
	// 		// TODO: implement
	// 	},
	// 	disabled: () => true,
	//
	// },
	// {
	// 	title: () => translate('version.import'),
	// 	active: () => false,
	// 	action: () => {
	// 		// TODO: implement
	// 	},
	// 	disabled: () => true,
	// 	after: () => DropdownMenuSeparator,
	// },
	{
		title: useVersionStore.getState().version?.readOnly
			? translate('version.mark_read_write')
			: translate('version.mark_read_only'),
		action: () => {
			const { updateVersionProperties, version } = useVersionStore.getState();
			if (!version) return;
			updateVersionProperties({
				orgId: version.orgId,
				versionId: version._id,
				appId: version.appId,
				readOnly: !version?.readOnly,
				onError: (error) => {
					notify({
						type: 'error',
						title: translate('general.error'),
						description: error.details,
					});
				},
			});
		},
		disabled: false,
	},
	{
		title: useVersionStore.getState().version?.private
			? translate('version.set_public')
			: translate('version.set_private'),
		action: () => {
			const { updateVersionProperties, version } = useVersionStore.getState();
			if (!version) return;
			updateVersionProperties({
				orgId: version.orgId,
				versionId: version._id,
				appId: version.appId,
				private: !version?.private,
				onError: (error) => {
					notify({
						type: 'error',
						title: translate('general.error'),
						description: error.details,
					});
				},
			});
		},
		disabled: useVersionStore.getState().version?.master,
	},
	{
		title: translate('version.settings.default'),
		action: () => {
			const { getVersionDashboardPath, version } = useVersionStore.getState();
			const versionHomePath = getVersionDashboardPath('/settings');
			useTabStore.getState().addTab(version?._id as string, {
				id: generateId(),
				title: translate('version.settings.default'),
				path: versionHomePath,
				isActive: true,
				isDashboard: false,
				type: TabTypes.Settings,
			});
		},
		disabled: false,
	},
];

/**
 * @type APIKeyTypes
 */
export const ENDPOINT_ACCESS_PROPERTIES = [
	'no-access',
	'full-access',
	'custom-allowed',
	'custom-excluded',
] as const;

/**
 * @type AllAndSpecified
 */
export const AUTHORIZATION_OPTIONS = ['all', 'specified'] as const;

export const RABBITMQ_CONNECTION_TYPES = ['url', 'object'] as const;
export const RABBITMQ_CONNECTION_SCHEMES = ['amqp', 'amqps'] as const;
export const KAFKA_CONNECTION_SCHEMES = ['simple', 'ssl', 'sasl'] as const;
export const KAFKA_SASL_MECHANISM = ['plain', 'scram-sha-256', 'scram-sha-512'] as const;
export const MONGODB_CONNECTION_FORMATS = ['mongodb', 'mongodb+srv'] as const;
export const ADD_API_KEYS_MENU_ITEMS = [
	{
		name: translate('application.edit.general'),
		href: 'general',
	},
	{
		name: translate('version.api_key.allowed_domains'),
		href: 'allowed-domains',
	},
	{
		name: translate('version.api_key.allowed_ips'),
		href: 'allowed-ips',
	},
];

export const ENDPOINT_OPTIONS: SortOption[] = [
	{
		name: translate('general.sortOptions.default'),
		value: 'createdAt',
		sortDir: 'desc',
	},
	{
		name: translate('general.sortOptions.nameAsc'),
		value: 'name',
		sortDir: 'asc',
	},
	{
		name: translate('general.sortOptions.nameDesc'),
		value: 'name',
		sortDir: 'desc',
	},
];

export const ALL_HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE'];

export const HTTP_METHOD_BADGE_MAP: Record<string, BadgeColors> = {
	GET: 'blue',
	POST: 'green',
	PUT: 'yellow',
	DELETE: 'red',
};
export const INSTANCE_PORT_MAP: Record<string, number> = {
	PostgreSQL: 5432,
	MySQL: 3306,
	'SQL Server': 1433,
	MongoDB: 27017,
	Oracle: 1521,
	Redis: 6379,
	RabbitMQ: 5672,
};
export const ENDPOINT_METHOD_TEXT_COLOR: Record<string, string> = {
	GET: 'text-elements-blue',
	POST: 'text-elements-green',
	PUT: 'text-elements-yellow',
	DELETE: 'text-elements-red',
};
export const ENDPOINT_METHOD_BG_COLOR: Record<string, string> = {
	GET: 'bg-elements-subtle-blue dark:bg-elements-strong-blue',
	POST: 'bg-elements-subtle-green dark:bg-elements-strong-green',
	PUT: 'bg-elements-subtle-yellow dark:bg-elements-strong-yellow',
	DELETE: 'bg-elements-subtle-red dark:bg-elements-strong-red',
};

export const ENDPOINT_RESPONSE_TABS = [
	{
		id: 'body',
		name: translate('endpoint.test.body'),
	},
	{
		id: 'cookies',
		name: translate('endpoint.test.cookies'),
	},
	{
		id: 'headers',
		name: translate('endpoint.test.headers'),
	},
	{
		id: 'console',
		name: translate('endpoint.test.console_logs'),
	},
];

export const NAME_SCHEMA = z
	.string({
		required_error: translate('forms.required', {
			label: translate('general.name'),
		}),
	})
	.min(2, translate('forms.min2.error', { label: translate('general.name') }))
	.max(64, translate('forms.max64.error', { label: translate('general.name') }))
	.regex(/^[a-zA-Z0-9_]*$/, {
		message: translate('forms.alphanumeric', { label: translate('general.name') }),
	})
	.trim()
	.refine(
		(value) => value.trim().length > 0,
		translate('forms.required', {
			label: translate('general.name'),
		}),
	);

export const fieldSchema = z
	.string()
	.min(2, translate('forms.min2.error', { label: translate('general.field') }))
	.max(64, translate('forms.max64.error', { label: translate('general.field') }))
	.regex(/^[a-zA-Z0-9_]*$/, {
		message: translate('forms.alphanumeric', { label: translate('general.field') }),
	})
	.or(z.literal(''));

export const TIMESTAMPS_SCHEMA = z
	.object({
		enabled: z.boolean(),
		createdAt: fieldSchema,
		updatedAt: fieldSchema,
	})
	.superRefine((arg, ctx) => {
		if (arg.enabled) {
			Object.entries(arg).forEach(([key, value]) => {
				if (key !== 'enabled' && typeof value === 'string' && value.length === 0) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: translate('forms.required', {
							label: translate('general.field'),
						}),
						path: [key],
					});
				}
			});
		}
	});

export const FIELD_ICON_MAP: Record<string, ElementType> = {
	text: TextAa,
	email: Envelope,
	link: LinkSimple,
	'encrypted-text': LockSimple,
	phone: Phone,
	'rich-text': RichText,
	boolean: Decision,
	integer: Integer,
	decimal: Decimal,
	monetary: CurrencyDollarSimple,
	datetime: Timestamp,
	date: Calendar,
	time: Clock,
	enum: ListChecks,
	'geo-point': MapPin,
	binary: Binary,
	json: BracketsCurly,
	reference: Share,
	'basic-values-list': ListNumbers,
	object: ObjectIcon,
	'object-list': ObjectList,
	id: IdentificationBadge,
};

/**
 * @type ReferenceAction
 */
export const REFERENCE_FIELD_ACTION = ['CASCADE', 'NO ACTION', 'SET NULL', 'SET DEFAULT'] as const;

export const MAX_LENGTHS: Record<string, number | Record<string, number>> = {
	'encrypted-text': 50,
	decimal: 10,
	enum: 1000,
	text: {
		MySQL: 16_382,
		'SQL Server': 4_000,
		PostgreSQL: 10_485_760,
		Oracle: 4_000,
		MongoDB: Number.MAX_SAFE_INTEGER,
	},
};

export const DATABASE = {
	MySQL: 'MySQL',
	SQLServer: 'SQL Server',
	PostgreSQL: 'PostgreSQL',
	Oracle: 'Oracle',
	MongoDB: 'MongoDB',
};

export const TAB_ICON_MAP: Record<string, ElementType> = {
	Storage: Storage,
	Database: DatabaseIcon,
	Cache: Cache,
	Endpoint: ApiKeys,
	Queue: MessageQueue,
	'Message Queue': MessageQueue,
	Task: Calendar,
	Middleware: Middleware,
	Settings: GearSix,
	Dashboard: Dashboard,
	Notifications: BellRing,
	Function: Function,
	Field: Textbox,
	Model: Table,
	Navigator: Table,
	Bucket: Storage,
};

export const ENV_STATUS_CLASS_MAP: Record<EnvironmentStatus, string[]> = {
	Deploying: ['bg-elements-subtle-blue', 'bg-elements-blue'],
	Error: ['bg-elements-subtle-red', 'bg-elements-red'],
	Idle: ['bg-elements-subtle-orange', 'bg-elements-orange'],
	OK: ['bg-elements-subtle-green', 'bg-elements-green'],
	Suspended: ['bg-elements-subtle-yellow', 'bg-elements-yellow'],
	Redeploying: ['bg-elements-subtle-blue', 'bg-elements-blue'],
	Deleting: ['bg-elements-subtle-red', 'bg-elements-red'],
};

export const NOTIFICATION_ACTIONS = ['create', 'update', 'deploy', 'redeploy', 'delete'];
export const OAUTH_ICON_MAP: Record<OAuthProviderTypes, ElementType> = {
	google: Google,
	github: Github,
	facebook: Facebook,
	twitter: Twitter,
	discord: Discord,
	apple: Apple,
};
export const OAUTH_URL_MAP: Record<OAuthProviderTypes, string> = {
	google: 'https://console.developers.google.com/',
	github: 'https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app',
	facebook: 'https://developers.facebook.com/',
	twitter: 'https://dev.twitter.com/',
	discord: 'https://discord.com/developers/docs/topics/oauth2',
	apple: 'https://developer.apple.com/',
};

export const RESOURCE_ICON_MAP: Record<string, ElementType> = {
	MongoDB: MongoDb,
	MySQL: MySql,
	PostgreSQL: PostgreSql,
	Oracle: Oracle,
	'SQL Server': SqlServer,
	RabbitMQ: RabbitMq,
	Kafka: Kafka,
	'AWS S3': Awss3,
	'Azure Blob Storage': AzureBlobStorage,
	'GCP Cloud Storage': GcpStorage,
	MinIO: MinIo,
	Redis,
	'API Server': Nodejs,
	Agenda: Nodejs,
	'Socket.io': SocketIo,
	'Node.js': Nodejs,
	React,
};

export const VERSION_CHANGE_EXCEPTIONS = [
	'organization',
	'app',
	'theme',
	'types',
	'tab',
	'cluster',
	'auth',
	'onBoarding',
];
export const ORG_CHANGE_EXCEPTIONS = [
	'organization',
	'theme',
	'types',
	'cluster',
	'auth',
	'onBoarding',
];
