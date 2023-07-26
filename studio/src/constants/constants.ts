import Database from '@/assets/images/database.png';
import Rapid from '@/assets/images/rapid.png';
import Realtime from '@/assets/images/realtime.png';
import {
	ApiKeys,
	Authentication,
	BellRing,
	Cache,
	ChangeLog,
	Connect,
	Database as DatabaseIcon,
	DeviceMobile,
	Environment,
	EnvironmentVariable,
	LightBulb,
	LineSegments,
	MessageQueue,
	MongoDb,
	MySql,
	NpmPackage,
	Oracle,
	PostgreSql,
	RateLimit,
	RealTime,
	Resource,
	Storage,
	Team,
} from '@/components/icons';
import { ConnectDatabase, CreateDatabase, SelectResourceType } from '@/features/resources';
import useApplicationStore from '@/store/app/applicationStore';
import useVersionStore from '@/store/version/versionStore.ts';
import { Application, Instance, Method, SortOption, Tab } from '@/types';
import { history, translate } from '@/utils';
import { FileText, GearSix, Plus } from '@phosphor-icons/react';
import { BadgeColors } from 'components/Badge/Badge.tsx';
import { DropdownMenuSeparator } from 'components/Dropdown';
import { ElementType, Fragment } from 'react';
import * as z from 'zod';

export const PAGE_SIZE = 10;
export const UI_BASE_URL = window.location.origin;
export const MIN_DB_SIZE = 1;
export const MAX_DB_SIZE = 50;
export const IP_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;
export const URL_REGEX = /^(http|https):\/\/[^ "]+$/;
export const NUMBER_REGEX = /^[0-9]+$/;
export const NAME_REGEX = /^[A-Za-z0-9_]+$/;
export const NOT_START_WITH_NUMBER_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;
export const ROUTE_NAME_REGEX = /^\/[a-zA-Z0-9_-]+(?:\/:[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*)*$/;
export const PARAM_REGEX = /:([^/?]+)/g;
export const PARAM_NAME_REGEX = /^[a-zA-Z0-9_-]+$/;

export const SLIDER_IMAGES = [
	{
		text: 'Accelerate your app development journey and leave the competition in the dust with our cutting-edge platform designed for rapid innovation and unbeatable efficiency.',
		image: Rapid,
	},
	{
		text: 'Amplify your backend capabilities and seamlessly integrate, manipulate, and leverage the power of multiple databases, including MySQL, MSSQL, and PostgreSQL.',
		image: Database,
	},
	{
		text: 'Amplify your backend capabilities and seamlessly integrate, manipulate, and leverage the power of multiple databases, including MySQL, MSSQL, and PostgreSQL.',
		image: Realtime,
	},
];

export const MENU_ITEMS = [
	{
		title: 'Feedback',
		url: '/feedback',
		icon: LightBulb,
	},
	{
		title: 'Change Log',
		url: '/change-log',
		icon: ChangeLog,
	},
	{
		title: 'Docs',
		url: '/docs',
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
		id: 'open-version',
		name: translate('application.settings.openVersion'),
		onClick: (application: Application) => {
			console.log('application', application);
			useApplicationStore.getState().openVersionDrawer(application);
		},
	},
	{
		id: 'edit-app',
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
	},
	{
		id: 'add-members',
		name: translate('general.addMembers'),
		onClick: (application: Application) => {
			useApplicationStore.getState().openInviteMemberDrawer(application);
		},
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
	},
	{
		title: translate('version.storage'),
		path: 'storage',
	},
	{
		title: translate('version.cache'),
		path: 'cache',
	},
	{
		title: translate('version.endpoints'),
		path: 'endpoint',
	},
	{
		title: translate('version.message_queues'),
		path: 'message-queue',
	},
	{
		title: translate('version.cron_jobs'),
		path: 'cron-job',
	},
	{
		title: translate('version.middleware.default'),
		path: 'middleware',
	},
	{
		title: translate('version.settings.default'),
		path: 'settings',
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
	CREATING: 'green',
	UPDATING: 'yellow',
	DELETING: 'red',
	BINDING: 'blue',
	GET: 'blue',
	POST: 'green',
	PUT: 'yellow',
	DELETE: 'red',
	OPTIONAL: 'yellow',
	REQUIRED: 'blue',
};

export const EDIT_APPLICATION_MENU_ITEMS = [
	{
		name: translate('application.edit.general'),
		href: '?t=general',
	},
	{
		name: translate('application.edit.members'),
		href: '?t=members',
	},
	{
		name: translate('application.edit.invitations'),
		href: '?t=invitations',
	},
];

export const TEST_ENDPOINTS_MENU_ITEMS = [
	{
		name: translate('endpoint.test.params'),
		href: '?t=params',
	},
	{
		name: translate('endpoint.test.headers'),
		href: '?t=headers',
	},
	{
		name: translate('endpoint.test.body'),
		href: '?t=body',
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
		path: 'authentications',
		icon: Authentication,
	},
	{
		id: 8,
		title: translate('version.settings.api_keys'),
		path: 'api-keys',
		icon: ApiKeys,
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
		id: 'create_new',
		name: translate('resources.create_new'),
		icon: Plus,
	},
	{
		id: 'connect_existing',
		name: translate('resources.connect_existing'),
		icon: Connect,
	},
];

export const STORAGE_TYPES: Instance[] = [
	{
		id: 'AWS S3',
		name: 'AWS S3',
		icon: MongoDb,
	},
	{
		id: 'Azure Blob Storage',
		name: 'Azure Blob Storage',
		icon: MySql,
	},
	{
		id: 'GCP Cloud Storage',
		name: 'GCP Cloud Storage',
		icon: MySql,
	},
	{
		id: 'Cluster Storage - MinIO',
		name: 'MinIO',
		icon: PostgreSql,
	},
];

export const DATABASE_TYPES: Instance[] = [
	{
		id: 'MongoDB',
		name: 'MongoDB',
		icon: MongoDb,
	},
	{
		id: 'MySQL',
		name: 'MySQL',
		icon: MySql,
	},
	{
		id: 'PostgreSQL',
		name: 'PostgreSQL',
		icon: PostgreSql,
	},
	{
		id: 'Oracle',
		name: 'Oracle',
		icon: Oracle,
		isConnectOnly: true,
	},
	{
		id: 'SQL Server',
		name: 'SQL Server',
		icon: Oracle,
		isConnectOnly: true,
	},
];

export const DATABASE_ICON_MAP: Record<string, ElementType> = {
	MongoDB: MongoDb,
	MySQL: MySql,
	PostgreSQL: PostgreSql,
	Oracle: Oracle,
	'SQL Server': Oracle,
};

export const CREATE_RESOURCES_ELEMENTS = [
	{
		step: 1,
		title: translate('resources.select'),
		CurrentResourceElement: SelectResourceType,
	},
	{
		step: 2,
		name: translate('version.databases'),
		type: translate('resources.create_new'),
		CurrentResourceElement: CreateDatabase,
	},
	{
		step: 2,
		name: translate('version.databases'),
		type: translate('resources.connect_existing'),
		CurrentResourceElement: ConnectDatabase,
	},
];

export const VERSION_DROPDOWN_ITEM = [
	{
		title: () => translate('version.open_version'),
		active: () => false,
		action: () => {
			const { application, openVersionDrawer } = useApplicationStore.getState();
			if (!application) return;
			openVersionDrawer(application);
		},
		disabled: false,
		after: Fragment,
	},
	{
		title: () => translate('version.create_a_copy'),
		active: () => false,
		action: async () => {
			useVersionStore.getState().setCreateCopyVersionDrawerIsOpen(true);
		},
		after: Fragment,
		disabled: false,
	},
	{
		title: () => translate('version.merge'),
		active: () => false,
		action: () => {
			// TODO: implement
		},
		disabled: true,
		after: DropdownMenuSeparator,
	},
	{
		title: () => translate('version.export'),
		active: () => false,
		action: () => {
			// TODO: implement
		},
		disabled: true,
		after: Fragment,
	},
	{
		title: () => translate('version.import'),
		active: () => false,
		action: () => {
			// TODO: implement
		},
		disabled: true,
		after: DropdownMenuSeparator,
	},
	{
		title: () =>
			useVersionStore.getState().version?.readOnly
				? translate('version.mark_read_write')
				: translate('version.mark_read_only'),
		active: () => false,
		action: () => {
			const { updateVersionProperties, version } = useVersionStore.getState();
			if (!version) return;
			updateVersionProperties({
				orgId: version.orgId,
				versionId: version._id,
				appId: version.appId,
				readOnly: !version?.readOnly,
			});
		},
		after: Fragment,
		disabled: false,
	},
	{
		title: () =>
			useVersionStore.getState().version?.private
				? translate('version.set_public')
				: translate('version.set_private'),
		active: () => false,
		action: () => {
			const { updateVersionProperties, version } = useVersionStore.getState();
			if (!version) return;
			updateVersionProperties({
				orgId: version.orgId,
				versionId: version._id,
				appId: version.appId,
				private: !version?.private,
			});
		},
		after: Fragment,
		disabled: useVersionStore.getState().version?.master,
	},
	{
		title: () => translate('version.settings.default'),
		active: () =>
			history.location?.pathname ===
			`${useVersionStore.getState().getVersionDashboardPath()}/settings`,
		action: () => {
			const versionHomePath = useVersionStore.getState().getVersionDashboardPath('/settings');
			history.navigate?.(versionHomePath);
		},
		disabled: false,
		after: DropdownMenuSeparator,
	},
	{
		title: () => translate('version.delete'),
		active: () => false,
		after: Fragment,
		action: () => {
			// TODO: implement
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

export const ADD_API_KEYS_MENU_ITEMS = [
	{
		name: translate('application.edit.general'),
		href: '?t=general',
	},
	{
		name: translate('version.api_key.allowed_domains'),
		href: '?t=allowed-domains',
	},
	{
		name: translate('version.api_key.allowed_ips'),
		href: '?t=allowed-ips',
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

export const ALL_HTTP_METHODS: Method[] = ['GET', 'POST', 'PUT', 'DELETE'];

export const HTTP_METHOD_BADGE_MAP: Record<string, BadgeColors> = {
	GET: 'orange',
	POST: 'green',
	PUT: 'yellow',
	DELETE: 'red',
};
export const INSTANCE_PORT_MAP: Record<string, string> = {
	PostgreSQL: '5432',
	MySQL: '3306',
	'SQL Server': '1433',
	MongoDB: '27017',
	Oracle: '1521',
	Redis: '6379',
};
export const ENDPOINT_METHOD_TEXT_COLOR: Record<string, string> = {
	GET: 'text-elements-blue',
	POST: 'text-elements-green',
	PUT: 'text-elements-yellow',
	DELETE: 'text-elements-red',
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

export const ADD_MODEL_FIELDS_TAB_ITEMS = [
	{
		name: 'General Properties',
		href: '?t=general',
	},
	{
		name: 'Specific Properties',
		href: '?t=specific',
	},
];

export const MODEL_FIELD_DEFAULT_VALUE_TYPES = [
	{
		name: 'Constant',
		value: '',
	},
	{
		name: 'JS Function',
		value: `export default function getDefaultValues(value, allValues) {
	return value;
}`,
	},
];

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

export const TEXT_MAX_LENGTH = 256;
export const RICH_TEXT_MAX_LENGTH = 1024;
export const ENCRYPTED_TEXT_MAX_LENGTH = 256;
export const DECIMAL_DIGITS = 2;
