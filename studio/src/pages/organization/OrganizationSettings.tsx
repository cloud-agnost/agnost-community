import { RequireAuth } from '@/router';
import { Outlet } from 'react-router-dom';

export default function OrganizationSettings() {
	return (
		<RequireAuth>
			<Outlet />
		</RequireAuth>
	);
}
