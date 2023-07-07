import useAuthStore from '@/store/auth/authStore.ts';
import useClusterStore from '@/store/cluster/clusterStore.ts';
import { removeLastSlash } from '@/utils';
import { LoaderFunctionArgs, Outlet } from 'react-router-dom';
import { ApplicationVersions } from '@/features/application';
import useOrganizationStore from '@/store/organization/organizationStore.ts';

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

		const application = prev.applications.find((app) => app._id === appId);
		if (application) prev.application = application;

		return prev;
	});

	return null;
}

export default function Root() {
	return (
		<>
			<Outlet />
			<ApplicationVersions />
		</>
	);
}

Root.loader = loader;
