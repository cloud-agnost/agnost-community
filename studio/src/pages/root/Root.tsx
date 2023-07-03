import { useUpdateEffect } from '@/hooks';
import useAuthStore from '@/store/auth/authStore.ts';
import useClusterStore from '@/store/cluster/clusterStore.ts';
import useTypeStore from '@/store/types/typeStore';
import { removeLastSlash } from '@/utils';
import { LoaderFunctionArgs, Outlet } from 'react-router-dom';
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
	await useClusterStore.getState().checkClusterSetup();
	const currentPathname = removeLastSlash(new URL(request.url).pathname);

	const isAuthPath = authPaths.includes(currentPathname);

	if (!isAuthPath && isAuthenticated) {
		await useAuthStore.getState().getUser();
	}

	return null;
}

export default function Root() {
	const accessToken = useAuthStore((s) => s.accessToken);
	useUpdateEffect(() => {
		const { isTypesOk, getAllTypes } = useTypeStore.getState();
		if (!isTypesOk && accessToken) {
			getAllTypes();
		}
	}, [accessToken]);
	return <Outlet />;
}

Root.loader = loader;
