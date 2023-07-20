import { ApplicationVersions } from '@/features/application';
import EditApplication from '@/features/application/EditApplication.tsx';
import { CreateResource } from '@/features/resources';
import { CreateCopyVersionDrawer } from '@/features/version/CreateCopyVersionDrawer';
import { EditMiddlewareDrawer } from '@/features/version/Middlewares';
import useAuthStore from '@/store/auth/authStore.ts';
import useClusterStore from '@/store/cluster/clusterStore.ts';
import useOrganizationStore from '@/store/organization/organizationStore.ts';
import { history, removeLastSlash } from '@/utils';
import { LoaderFunctionArgs, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

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
	const { getOrganizationMembers, memberPage, setMemberPage } = useOrganizationStore();

	useEffect(() => {
		if (orgId) {
			const fetchData = async () => {
				return await getOrganizationMembers({
					organizationId: orgId,
					page: memberPage,
					size: 100,
				});
			};
			fetchData().then((res) => {
				if (res.length > 0) setMemberPage(memberPage + 1);
			});
		}
	}, [memberPage, orgId]);

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
