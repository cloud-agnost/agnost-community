import { Header } from '@/components/Header';
import {
	ChangePasswordWithToken,
	CompleteAccountSetup,
	CompleteAccountSetupVerifyEmail,
	ConfirmChangeEmail,
	ForgotPassword,
	Login,
	VerifyEmail,
} from '@/pages/auth';
import {
	AccountInformation,
	CreateApp,
	CreateOrganization,
	InviteTeamMembers,
	Onboarding,
	SMTPConfiguration,
} from '@/pages/onboarding';
import { Organization, OrganizationSelect } from '@/pages/organization';
import { RedirectHandle } from '@/pages/redirect-handle';
import { Root } from '@/pages/root';
import useAuthStore from '@/store/auth/authStore.ts';
import type { ReactNode } from 'react';
import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom';
import {
	ProfileSettings,
	ProfileSettingsGeneral,
	ProfileSettingsClusterManagement,
	ProfileSettingsNotifications,
} from '@/pages/profile';
import ErrorBoundary from '@/pages/errors/ErrorBoundary.tsx';

const router = createBrowserRouter([
	{
		path: '/',
		loader: Root.loader,
		element: <Root />,
		children: [
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
				path: '/forgot-password/:token',
				element: (
					<GuestOnly>
						<ChangePasswordWithToken />
					</GuestOnly>
				),
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
				path: '/complete-account-setup/verify-email/',
				loader: CompleteAccountSetupVerifyEmail.loader,
				element: (
					<GuestOnly>
						<CompleteAccountSetupVerifyEmail />,
					</GuestOnly>
				),
			},
			{
				path: '/organization',
				element: (
					<RequireAuth>
						<Organization />
					</RequireAuth>
				),
				children: [
					{
						loader: OrganizationSelect.loader,
						path: '',
						element: (
							<RequireAuth>
								<OrganizationSelect />
							</RequireAuth>
						),
					},
					{
						path: ':id',
						element: <Header></Header>,
					},
				],
			},
			{
				path: '/organization/:id',
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
		children: [
			{
				path: '',
				element: <AccountInformation />,
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
		element: <RedirectHandle />,
	},
]);

// eslint-disable-next-line react-refresh/only-export-components
function RequireAuth({ children }: { children: JSX.Element }): JSX.Element {
	const { isAuthenticated } = useAuthStore();
	const location = useLocation();

	if (!isAuthenticated()) {
		return <Navigate to='/login' state={{ from: location }} replace />;
	}

	return children;
}
// eslint-disable-next-line react-refresh/only-export-components
function GuestOnly({ children }: { children: ReactNode }): JSX.Element {
	const { isAuthenticated } = useAuthStore();

	if (isAuthenticated()) {
		return <Navigate to='/organization' />;
	}

	return children as JSX.Element;
}

export default router;
