import { ApplicationVersions } from '@/features/application';
import EditApplication from '@/features/application/EditApplication.tsx';
import { CreateCopyVersionDrawer } from '@/features/version/CreateCopyVersionDrawer';
import { EditMiddlewareDrawer } from '@/features/version/Middlewares';
import useApplicationStore from '@/store/app/applicationStore.ts';
import useAuthStore from '@/store/auth/authStore.ts';
import useClusterStore from '@/store/cluster/clusterStore.ts';
import useOrganizationStore from '@/store/organization/organizationStore.ts';
import { history, removeLastSlash } from '@/utils';
import { useEffect } from 'react';
import { LoaderFunctionArgs, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { CreateResource } from '@/features/resources';
const authPaths = [
	'/login',
	'/forgot-password',
	'/confirm-change-email',
	'/forgot-password',
	'/verify-email',
	'/complete-account-setup',
	'/complete-account-setup/verify-email',
];

async function loader({ request, params }: LoaderFunctionArgs) {
	const isAuthenticated = useAuthStore.getState().isAuthenticated();
	await useClusterStore.getState().checkClusterSmtpStatus();
	await useClusterStore.getState().checkClusterSetup();
	const currentPathname = removeLastSlash(new URL(request.url).pathname);

	const isAuthPath = authPaths.includes(currentPathname);

	if (!isAuthPath && isAuthenticated) {
		await useAuthStore.getState().getUser();
	}

	const { appId, orgId } = params;

	useOrganizationStore.setState((prev) => {
		const organization = prev.organizations.find((org) => org._id === orgId);
		if (organization) prev.organization = organization;
		else prev.organization = null;

		return prev;
	});

	useApplicationStore.setState((prev) => {
		const application = prev.applications.find((app) => app._id === appId);
		if (application) prev.application = application;

		return prev;
	});

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
					initialFetch: memberPage === 0,
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
