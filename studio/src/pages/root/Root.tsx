import { Outlet } from 'react-router-dom';
import useClusterStore from '@/store/cluster/clusterStore.ts';
import useAuthStore from '@/store/auth/authStore.ts';

async function loader() {
	const isAuthenticated = useAuthStore.getState().isAuthenticated();
	await useClusterStore.getState().checkClusterSmtpStatus();

	if (isAuthenticated) {
		await useAuthStore.getState().getUser();
	}

	return null;
}

export default function Root() {
	return <Outlet />;
}

Root.loader = loader;
