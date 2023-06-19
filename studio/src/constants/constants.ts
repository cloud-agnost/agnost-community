import Database from '@/assets/images/database.png';
import Rapid from '@/assets/images/rapid.png';
import Realtime from '@/assets/images/realtime.png';
import { BellRing, ChangeLog, LightBulb, LineSegments } from '@/components/icons';
import { FileText, GearSix, DeviceTablet, Database as DatabaseIcon } from '@phosphor-icons/react';
import { translate } from '@/utils';

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

export const MENU_ITEMS_FOR_PROFILE_SETTINGS = (translate: (key: string) => string) => [
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
		name: translate('application.settings.openVersion'),
	},
	{
		name: translate('application.settings.editApp'),
	},
	{
		name: translate('general.addMembers'),
	},
	{
		name: translate('application.settings.leaveTeam'),
	},
	{
		name: translate('general.delete'),
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
