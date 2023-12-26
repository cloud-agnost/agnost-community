import { Outlet } from 'react-router-dom';
import { SettingsLayout } from '@/layouts/SettingsLayout';
import { SettingsNavbar } from '@/features/version/SettingsNavbar';
import { VERSION_SETTINGS_MENU_ITEMS } from 'constants/constants.ts';

export default function VersionSettings() {
	return (
		<SettingsLayout
			navbar={<SettingsNavbar items={VERSION_SETTINGS_MENU_ITEMS} />}
			className='full-max-height-without-header'
		>
			<Outlet />
		</SettingsLayout>
	);
}
