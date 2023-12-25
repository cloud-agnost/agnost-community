import { MENU_ITEMS_FOR_PROFILE_SETTINGS } from '@/constants';
import { SettingsNavbar } from '@/features/version/SettingsNavbar';
import { SettingsLayout } from '@/layouts/SettingsLayout';
import { RequireAuth } from '@/router';
import { Outlet, useParams } from 'react-router-dom';

export default function ProfileSettings() {
	const { orgId } = useParams() as { orgId: string };
	const settings = MENU_ITEMS_FOR_PROFILE_SETTINGS.map((setting) => ({
		...setting,
		href: setting.href.replace(':id', orgId as string),
	}));

	return (
		<SettingsLayout
			navbar={<SettingsNavbar items={settings} />}
			className='p-6 full-height-without-header'
		>
			<RequireAuth>
				<Outlet />
			</RequireAuth>
		</SettingsLayout>
	);
}
