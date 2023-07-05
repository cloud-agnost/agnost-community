import Database from '@/assets/images/database.png';
import Rapid from '@/assets/images/rapid.png';
import Realtime from '@/assets/images/realtime.png';
import { BellRing, ChangeLog, LightBulb, LineSegments, Team } from '@/components/icons';
import useApplicationStore from '@/store/app/applicationStore';
import { Application, SortOption } from '@/types';
import { translate } from '@/utils';
import { Database as DatabaseIcon, DeviceTablet, FileText, GearSix } from '@phosphor-icons/react';
import { BadgeColors } from 'components/Badge/Badge.tsx';

import { Tab } from '@/types';
export const ORGANIZATION_MEMBERS_PAGE_SIZE = 10;

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
		name: translate('organization.settings.members.sortOptions.default'),
		value: 'default',
	},
	{
		name: translate('organization.settings.members.sortOptions.joinDate'),
		value: 'joinDate',
		sortDir: 'desc',
	},
	{
		name: translate('organization.settings.members.sortOptions.nameAsc'),
		value: 'name',
		sortDir: 'asc',
	},
	{
		name: translate('organization.settings.members.sortOptions.nameDesc'),
		value: 'name',
		sortDir: 'desc',
	},
];
export const ORG_INVITATIONS_SORT_OPTIONS: SortOption[] = [
	{
		name: translate('organization.settings.members.sortOptions.default'),
	},
	{
		name: translate('organization.settings.members.sortOptions.inviteDate'),
		value: 'createdAt',
		sortDir: 'desc',
	},
	{
		name: translate('organization.settings.members.sortOptions.email'),
		value: 'email',
		sortDir: 'asc',
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
];

export const BADGE_COLOR_MAP: Record<string, BadgeColors> = {
	Suspended: 'yellow',
	Deploying: 'blue',
	Error: 'red',
	Ok: 'green',
	Good: 'green',
	Yes: 'green',
	No: 'red',
};
