import { RequireAuth } from '@/router';
import useAuthStore from '@/store/auth/authStore.ts';
import { redirect } from 'react-router-dom';

Home.loader = function () {
	if (useAuthStore.getState().isAuthenticated()) {
		// return redirect('/organization');
	}
	return null;
};

export default function Home() {
	return (
		<RequireAuth>
			<div>Home</div>
		</RequireAuth>
	);
}
