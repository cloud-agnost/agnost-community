import { LoaderFunctionArgs, Outlet, redirect } from 'react-router-dom';
import useClusterStore from '@/store/cluster/clusterStore.ts';
import useAuthStore from '@/store/auth/authStore.ts';
import { removeLastSlash } from 'utils/utils.ts';

async function loader(params: LoaderFunctionArgs) {
	const status = await useClusterStore.getState().checkClusterSetup();
	await useClusterStore.getState().checkClusterSmtpStatus();
	const isAuthenticated = useAuthStore.getState().isAuthenticated();

	const requestURL = new URL(params.request.url);

	if (!status) {
		return redirect('/onboarding');
	} else if (status && !isAuthenticated && removeLastSlash(requestURL.pathname) !== '/login') {
		return redirect('/login');
	}

	return null;
}

export default function Root() {
	return <Outlet />;
}

Root.loader = loader;
