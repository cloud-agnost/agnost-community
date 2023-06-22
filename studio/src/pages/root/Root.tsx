import { LoaderFunctionArgs, Outlet } from 'react-router-dom';
import useClusterStore from '@/store/cluster/clusterStore.ts';
import useAuthStore from '@/store/auth/authStore.ts';
import { removeLastSlash } from '@/utils';

const authPaths = [
	'/login',
	'/forgot-password',
	'/confirm-change-email',
	'/forgot-password',
	'/verify-email',
	'/complete-account-setup',
	'/complete-account-setup/verify-email',
];

async function loader({ request }: LoaderFunctionArgs) {
	const isAuthenticated = useAuthStore.getState().isAuthenticated();
	await useClusterStore.getState().checkClusterSmtpStatus();

	const currentPathname = removeLastSlash(new URL(request.url).pathname);
	const isAuthPath = authPaths.includes(currentPathname);

	if (!isAuthPath && isAuthenticated) {
		await useAuthStore.getState().getUser();
	}

	return null;
}

export default function Root() {
	return <Outlet />;
}

Root.loader = loader;
