import { RequireAuth } from '@/router';
import { Outlet } from 'react-router-dom';

export default function ProfileSettings() {
	return (
		<RequireAuth>
			<Outlet />
		</RequireAuth>
	);
}
