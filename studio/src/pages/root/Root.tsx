import { ApplicationVersions } from '@/features/application';
import EditApplication from '@/features/application/EditApplication.tsx';
import { AddResourceDrawer } from '@/features/resources';
import { CreateCopyVersionDrawer } from '@/features/version/CreateCopyVersionDrawer';
import { EditMiddlewareDrawer } from '@/features/version/Middlewares';
import useAuthStore from '@/store/auth/authStore.ts';
import useClusterStore from '@/store/cluster/clusterStore.ts';
import useEnvironmentStore from '@/store/environment/environmentStore';
import useOrganizationStore from '@/store/organization/organizationStore.ts';
import useVersionStore from '@/store/version/versionStore';
import { history } from '@/utils';
import _ from 'lodash';
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
	const { orgId, versionId, appId } = useParams();
	const { checkClusterSmtpStatus, checkClusterSetup } = useClusterStore();
	const { getOrganizationMembers, getOrganizationById, members, organization } =
		useOrganizationStore();
	const { getUser, isAuthenticated, user } = useAuthStore();
	const { getAppVersionEnvironment, getEnvironmentResources } = useEnvironmentStore();
	const { getVersionNotifications } = useVersionStore();

	useEffect(() => {
		if (orgId) {
			if (_.isEmpty(organization)) {
				getOrganizationById(orgId);
			}
			if (_.isEmpty(members)) {
				getOrganizationMembers({
					organizationId: orgId,
				});
			}
		}
	}, [orgId]);

	useEffect(() => {
		const getEnv = async () => {
			return await getAppVersionEnvironment({
				appId: appId as string,
				orgId: orgId as string,
				versionId: versionId as string,
			});
		};

		const getResources = async () => {
			const env = await getEnv();
			return await getEnvironmentResources({
				appId: appId as string,
				orgId: orgId as string,
				versionId: versionId as string,
				envId: env._id,
			});
		};

		if (orgId && versionId && appId) {
			getResources();
			getVersionNotifications({
				appId,
				orgId,
				versionId,
				page: 0,
				size: 50,
				sortBy: 'createdAt',
				sortDir: 'desc',
			});
		}
	}, [versionId]);

	useEffect(() => {
		checkClusterSmtpStatus();
		checkClusterSetup({
			onSuccess: (isCompleted) => {
				if (!isCompleted) {
					navigate('/onboarding');
				}
			},
		});
	}, []);

	useEffect(() => {
		const isAuthPath = authPaths.includes(pathname);
		if (!isAuthPath && isAuthenticated() && !user?._id) {
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
			<AddResourceDrawer />
		</>
	);
}
