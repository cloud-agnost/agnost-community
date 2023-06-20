import { LoaderFunctionArgs, Outlet, redirect } from 'react-router-dom';
import useClusterStore from '@/store/cluster/clusterStore.ts';
import useAuthStore from '@/store/auth/authStore.ts';
import { removeLastSlash } from 'utils/utils.ts';

async function loader(params: LoaderFunctionArgs) {
	const isAuthenticated = useAuthStore.getState().isAuthenticated();
	const requestURL = new URL(params.request.url);
	const currentPath = removeLastSlash(requestURL.pathname);

	if (isAuthenticated) {
		await useAuthStore.getState().getUser();
	} else if (currentPath !== '/login') {
		return redirect('/login');
	}

	const status = await useClusterStore.getState().checkClusterSetup();
	await useClusterStore.getState().checkClusterSmtpStatus();

	if (currentPath !== '/') {
		return null;
	}

	if (status) {
		return redirect('/organization');
	} else {
		return redirect('/onboarding');
	}
}

export default function Root() {
	return <Outlet />;
}

Root.loader = loader;
