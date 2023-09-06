import { ApplicationVersions } from '@/features/application';
import EditApplication from '@/features/application/EditApplication.tsx';
import { CreateResource } from '@/features/resources';
import { CreateCopyVersionDrawer } from '@/features/version/CreateCopyVersionDrawer';
import { EditMiddlewareDrawer } from '@/features/version/Middlewares';
import useAuthStore from '@/store/auth/authStore.ts';
import useClusterStore from '@/store/cluster/clusterStore.ts';
import useOrganizationStore from '@/store/organization/organizationStore.ts';
import { history } from '@/utils';
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';

const authPaths = [
	'/login',
	'/forgot-password',
	'/confirm-change-email',
	'/forgot-password',
	'/verify-email',
	'/complete-account-setup',
	'/complete-account-setup/verify-email',
];

export default function Root() {
	history.navigate = useNavigate();
	history.location = useLocation();
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const { orgId } = useParams();
	const { checkClusterSmtpStatus, checkClusterSetup } = useClusterStore();
	const { getOrganizationMembers } = useOrganizationStore();
	const { getUser, isAuthenticated } = useAuthStore();

	useEffect(() => {
		if (orgId) {
			getOrganizationMembers({
				organizationId: orgId,
			});
		}
	}, [orgId]);

	useEffect(() => {
		checkClusterSmtpStatus();
		checkClusterSetup({
			onSuccess: (isCompleted) => {
				console.log('isCompleted', isCompleted);
				if (!isCompleted) {
					navigate('/onboarding');
				}
			},
		});
	}, []);

	useEffect(() => {
		const isAuthPath = authPaths.includes(pathname);
		if (!isAuthPath && isAuthenticated()) {
			getUser();
		}
	}, [pathname]);

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
