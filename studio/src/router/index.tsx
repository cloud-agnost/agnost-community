import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom';
import { Root } from '@/pages/root';
import {
	AccountInformation,
	CreateApp,
	CreateOrganization,
	InviteTeamMembers,
	Onboarding,
	SMTPConfiguration,
} from '@/pages/onboarding';
import { Organization, SelectOrganization } from '@/pages/organization';
import {
	ChangePasswordWithToken,
	CompleteAccountSetup,
	CompleteAccountSetupVerifyEmail,
	ForgotPassword,
	Login,
	VerifyEmail,
} from '@/pages/auth';
import useAuthStore from '@/store/auth/authStore.ts';
import type { ReactNode } from 'react';
import { RedirectHandle } from '@/pages/redirect-handle';

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
				element: (
					<RequireAuth>
						<Organization />
					</RequireAuth>
				),
				children: [
					{
						loader: SelectOrganization.loader,
						path: '',
						element: (
							<RequireAuth>
								<SelectOrganization />
							</RequireAuth>
						),
					},
				],
			},
			{
				path: '/organization/:id',
			},
		],
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
function RequireAuth({ children }: { children: ReactNode }) {
	const { isAuthenticated } = useAuthStore();
	const location = useLocation();

	if (!isAuthenticated()) {
		return <Navigate to='/login' state={{ from: location }} replace />;
	}

	return children;
}
// eslint-disable-next-line react-refresh/only-export-components
function GuestOnly({ children }: { children: ReactNode }) {
	const { isAuthenticated } = useAuthStore();

	if (isAuthenticated()) {
		return <Navigate to='/organization' />;
	}

	return children;
}

export default router;
