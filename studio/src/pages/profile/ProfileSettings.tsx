import { MENU_ITEMS_FOR_PROFILE_SETTINGS } from '@/constants';
import { SettingsNavbar } from '@/features/version/SettingsNavbar';
import { SettingsLayout } from '@/layouts/SettingsLayout';
import { RequireAuth } from '@/router';
import useAuthStore from '@/store/auth/authStore';
import { useMemo } from 'react';
import { Outlet, useParams } from 'react-router-dom';

export default function ProfileSettings() {
	const { orgId } = useParams() as { orgId: string };
	const user = useAuthStore((state) => state.user);
	const settings = useMemo(() => {
		return MENU_ITEMS_FOR_PROFILE_SETTINGS.filter(
			(item) => !item.href.includes('cluster') || user?.isClusterOwner,
		).map((item) => {
			return {
				...item,
				href: item.href.replace(':orgId', orgId),
			};
		});
	}, [user?.isClusterOwner]);

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
