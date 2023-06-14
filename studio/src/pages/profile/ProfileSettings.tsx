import { Outlet } from 'react-router-dom';
import { UserSettingsLayout } from '@/layouts/UserSettingsLayout';

export default function ProfileSettings() {
	console.log('ProfileSettings');
	return (
		<UserSettingsLayout>
			<Outlet />
		</UserSettingsLayout>
	);
}
