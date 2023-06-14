import Database from '@/assets/images/database.png';
import Rapid from '@/assets/images/rapid.png';
import Realtime from '@/assets/images/realtime.png';
import { BellRing, ChangeLog, LightBulb, LineSegments } from '@/components/icons';
import { FileText, GearSix } from '@phosphor-icons/react';
import { t } from '@/i18n/config.ts';

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
		title: t('profileSettings.general_title'),
		href: '/profile/settings',
		icon: <GearSix />,
	},
	{
		title: t('profileSettings.notifications_title'),
		href: '/profile/settings/notifications',
		icon: <BellRing />,
	},
	{
		title: t('profileSettings.clusters_title'),
		href: '/profile/settings/cluster-management',
		icon: <LineSegments />,
	},
];
