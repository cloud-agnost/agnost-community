import { LoaderFunctionArgs, Outlet, redirect } from 'react-router-dom';
import useClusterStore from '@/store/cluster/clusterStore.ts';
import useAuthStore from '@/store/auth/authStore.ts';
import { removeLastSlash } from 'utils/utils.ts';

async function loader(params: LoaderFunctionArgs) {
	const isAuthenticated = useAuthStore.getState().isAuthenticated();
	const requestURL = new URL(params.request.url);
	const currentPath = removeLastSlash(requestURL.pathname);
	const status = await useClusterStore.getState().checkClusterSetup();
	await useClusterStore.getState().checkClusterSmtpStatus();

	if (isAuthenticated) {
		await useAuthStore.getState().getUser();
		if (status && currentPath !== '/organization') return redirect('/organization');
	} else if (!status && currentPath !== '/onboarding') {
		return redirect('/onboarding');
	}

	return null;
}

export default function Root() {
	return <Outlet />;
}

Root.loader = loader;
