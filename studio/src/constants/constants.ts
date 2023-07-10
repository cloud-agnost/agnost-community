import Database from '@/assets/images/database.png';
import Rapid from '@/assets/images/rapid.png';
import Realtime from '@/assets/images/realtime.png';
import {
	ApiKeys,
	Authentication,
	BellRing,
	ChangeLog,
	DoubleGear,
	Environment,
	EnvironmentVariable,
	LightBulb,
	LineSegments,
	Middleware,
	NpmPackage,
	RateLimit,
	RealTime,
	Team,
} from '@/components/icons';
import useApplicationStore from '@/store/app/applicationStore';
import { Application, SortOption, Tab } from '@/types';
import { translate } from '@/utils';
import { Database as DatabaseIcon, DeviceTablet, FileText, GearSix } from '@phosphor-icons/react';
import { BadgeColors } from 'components/Badge/Badge.tsx';

export const PAGE_SIZE = 10;
export const UI_BASE_URL = window.location.origin;

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
		icon: DeviceTablet,
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
		id: 3,
		title: translate('version.settings.middlewares'),
		path: 'middlewares',
		icon: Middleware,
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
	{
		id: 10,
		title: translate('version.settings.other'),
		path: 'other',
		icon: DoubleGear,
	},
];
