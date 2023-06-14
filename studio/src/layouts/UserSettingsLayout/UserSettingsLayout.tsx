import { ReactNode } from 'react';
import './UserSettingsLayout.scss';
import { GearSix } from '@phosphor-icons/react';
import { BellRing, LineSegments } from '@/components/icons';
import { Navbar } from '@/components/Navbar';

type UserSettingsLayoutProps = {
	children: ReactNode;
};

const MENU_ITEMS_FOR_PROFILE_SETTINGS = [
	{
		title: 'General',
		href: '/profile/settings',
		icon: <GearSix />,
	},
	{
		title: 'Notifications',
		href: '/profile/settings/notifications',
		icon: <BellRing />,
	},
	{
		title: 'Cluster Management',
		href: '/profile/settings/cluster-management',
		icon: <LineSegments />,
	},
];

export default function UserSettingsLayout({ children }: UserSettingsLayoutProps) {
	return (
		<div className='user-settings-layout'>
			<div className='user-settings-layout-left'>
				<Navbar items={MENU_ITEMS_FOR_PROFILE_SETTINGS} />
			</div>
			<div className='user-settings-layout-right'>{children}</div>
		</div>
	);
}
