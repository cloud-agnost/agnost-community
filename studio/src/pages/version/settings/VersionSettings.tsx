import { Outlet } from 'react-router-dom';
import { VersionSettingsLayout } from '@/layouts/VersionSettingsLayout';

export default function VersionSettings() {
	return (
		<VersionSettingsLayout>
			<Outlet />
		</VersionSettingsLayout>
	);
}
