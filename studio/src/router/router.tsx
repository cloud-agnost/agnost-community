import {
	ChangePasswordWithToken,
	CompleteAccountSetup,
	CompleteAccountSetupVerifyEmail,
	ConfirmChangeEmail,
	ForgotPassword,
	Login,
	VerifyEmail,
} from '@/pages/auth';
import ErrorBoundary from '@/pages/errors/ErrorBoundary.tsx';
import { Home } from '@/pages/home';
import {
	AccountInformation,
	CreateApp,
	CreateOrganization,
	InviteTeamMembers,
	Onboarding,
	SMTPConfiguration,
} from '@/pages/onboarding';
import {
	Organization,
	OrganizationApps,
	OrganizationDetails,
	OrganizationSelect,
} from '@/pages/organization';
import {
	ProfileSettings,
	ProfileSettingsClusterManagement,
	ProfileSettingsGeneral,
	ProfileSettingsNotifications,
} from '@/pages/profile';
import { RedirectHandle } from '@/pages/redirect-handle';
import { Root } from '@/pages/root';
import useAuthStore from '@/store/auth/authStore.ts';
import useClusterStore from '@/store/cluster/clusterStore.ts';
import type { ReactNode } from 'react';
import { Navigate, createBrowserRouter, useLocation } from 'react-router-dom';
import {
	Version,
	VersionCache,
	VersionCronJob,
	VersionDashboard,
	VersionDatabase,
	VersionEndpoint,
	VersionMessageQueue,
	VersionStorage,
} from '@/pages/version';
import {
	OrganizationSettings,
	OrganizationSettingsGeneral,
	OrganizationSettingsMembers,
} from '@/pages/organization/';
const router = createBrowserRouter([
	{
		path: '/',
		loader: Root.loader,
		element: <Root />,
		children: [
			{
				index: true,
				element: (
					<RequireAuth>
						<Home />
					</RequireAuth>
				),
			},
			{
				path: '/login',
				element: (
					<GuestOnly>
						<Login />
					</GuestOnly>
				),
			},
			{
				path: '/forgot-password',
				element: (
					<GuestOnly>
						<ForgotPassword />
					</GuestOnly>
				),
			},
			{
				path: '/confirm-change-email',
				loader: ConfirmChangeEmail.loader,
			},
			{
				path: '/forgot-password',
				loader: ChangePasswordWithToken.loader,
				element: <ChangePasswordWithToken />,
			},
			{
				path: '/verify-email',
				element: (
					<GuestOnly>
						<VerifyEmail />
					</GuestOnly>
				),
			},
			{
				path: '/complete-account-setup',
				element: (
					<GuestOnly>
						<CompleteAccountSetup />
					</GuestOnly>
				),
			},
			{
				path: '/complete-account-setup/verify-email',
				loader: CompleteAccountSetupVerifyEmail.loader,
				element: (
					<GuestOnly>
						<CompleteAccountSetupVerifyEmail />,
					</GuestOnly>
				),
			},
			{
				path: '/organization',
				loader: OrganizationSelect.loader,
				element: (
					<RequireAuth>
						<Organization />
					</RequireAuth>
				),
				children: [
					{
						path: '',
						element: (
							<RequireAuth>
								<OrganizationSelect />
							</RequireAuth>
						),
					},
					{
						path: ':id',
						element: (
							<RequireAuth>
								<OrganizationDetails />
							</RequireAuth>
						),
						children: [
							{
								loader: OrganizationApps.loader,
								path: 'apps',
								element: (
									<RequireAuth>
										<OrganizationApps />
									</RequireAuth>
								),
							},
							{
								path: 'resources',
								element: (
									<RequireAuth>
										<p>Resource</p>
									</RequireAuth>
								),
							},
							{
								path: 'settings',
								element: (
									<RequireAuth>
										<OrganizationSettings />
									</RequireAuth>
								),
								children: [
									{
										index: true,
										path: '',
										element: (
											<RequireAuth>
												<OrganizationSettingsGeneral />
											</RequireAuth>
										),
									},
									{
										path: 'members',
										element: (
											<RequireAuth>
												<OrganizationSettingsMembers />
											</RequireAuth>
										),
									},
								],
							},
						],
					},
				],
			},
			{
				path: '/organization/:orgId/apps/:appId/version/:versionId',
				element: <Version />,
				loader: Version.loader,
				children: [
					{
						path: '',
						element: <VersionDashboard />,
					},
					{
						path: 'database',
						element: <VersionDatabase />,
					},
					{
						path: 'endpoint',
						element: <VersionEndpoint />,
					},
					{
						path: 'storage',
						element: <VersionStorage />,
					},
					{
						path: 'cache',
						element: <VersionCache />,
					},
					{
						path: 'message-queue',
						element: <VersionMessageQueue />,
					},
					{
						path: 'cron-job',
						element: <VersionCronJob />,
					},
				],
			},
			{
				path: '/profile/settings',
				element: (
					<RequireAuth>
						<ProfileSettings />
					</RequireAuth>
				),
				children: [
					{
						index: true,
						element: <ProfileSettingsGeneral />,
					},
					{
						path: 'notifications',
						element: <ProfileSettingsNotifications />,
					},
					{
						path: 'cluster-management',
						element: <ProfileSettingsClusterManagement />,
					},
				],
			},
		],
		errorElement: <ErrorBoundary />,
	},
	{
		loader: Onboarding.loader,
		path: '/onboarding',
		element: <Onboarding />,
		errorElement: <ErrorBoundary />,
		children: [
			{
				path: '',
				element: (
					<GuestOnly>
						<AccountInformation />
					</GuestOnly>
				),
			},
			{
				path: 'create-organization',
				element: (
					<RequireAuth>
						<CreateOrganization />
					</RequireAuth>
				),
			},
			{
				path: 'create-app',
				element: (
					<RequireAuth>
						<CreateApp />
					</RequireAuth>
				),
			},
			{
				path: 'smtp-configuration',
				element: (
					<RequireAuth>
						<SMTPConfiguration />
					</RequireAuth>
				),
			},
			{
				path: 'invite-team-members',
				element: (
					<RequireAuth>
						<InviteTeamMembers />
					</RequireAuth>
				),
			},
		],
	},
	{
		path: '/redirect-handle',
		loader: RedirectHandle.loader,
		errorElement: <ErrorBoundary />,
		element: <RedirectHandle />,
	},
]);

// eslint-disable-next-line react-refresh/only-export-components
function RequireAuth({ children }: { children: JSX.Element }): JSX.Element {
	const { isAuthenticated } = useAuthStore();
	const { isCompleted } = useClusterStore();
	const location = useLocation();

	if (location.pathname === '/') {
		return <Navigate to={isCompleted ? '/login' : '/onboarding'} />;
	} else if (!isAuthenticated()) {
		return <Navigate to='/login' state={{ from: location }} replace />;
	}

	return children;
}
// eslint-disable-next-line react-refresh/only-export-components
function GuestOnly({ children }: { children: ReactNode }): JSX.Element {
	const { isAuthenticated } = useAuthStore();
	const { isCompleted } = useClusterStore();
	const { pathname } = useLocation();

	if (isAuthenticated()) {
		return <Navigate to='/organization' />;
	} else if (!isCompleted && pathname !== '/onboarding') {
		return <Navigate to='/onboarding' />;
	}

	return children as JSX.Element;
}

export default router;
