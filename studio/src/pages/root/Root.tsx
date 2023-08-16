import { ApplicationVersions } from '@/features/application';
import EditApplication from '@/features/application/EditApplication.tsx';
import { CreateResource } from '@/features/resources';
import { CreateCopyVersionDrawer } from '@/features/version/CreateCopyVersionDrawer';
import { EditMiddlewareDrawer } from '@/features/version/Middlewares';
import useAuthStore from '@/store/auth/authStore.ts';
import useClusterStore from '@/store/cluster/clusterStore.ts';
import useOrganizationStore from '@/store/organization/organizationStore.ts';
import { history, removeLastSlash } from '@/utils';
import { useEffect } from 'react';
import { LoaderFunctionArgs, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
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
	history.navigate = useNavigate();
	history.location = useLocation();
	const { orgId } = useParams();
	const { getOrganizationMembers } = useOrganizationStore();

	useEffect(() => {
		if (orgId) {
			getOrganizationMembers({
				organizationId: orgId,
			});
		}
	}, [orgId]);

	return (
		<>
			<Outlet />
			<ApplicationVersions />
			<EditApplication />
			<EditMiddlewareDrawer />
			<CreateCopyVersionDrawer />
			<CreateResource />
		</>
	);
}

Root.loader = loader;
