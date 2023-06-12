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
	CompleteAccountSetup,
	CompleteAccountSetupVerifyEmail,
	EmailVerification,
	ForgotPassword,
	Login,
	VerifyEmail,
} from '@/pages/auth';
import useAuthStore from '@/store/auth/authStore.ts';
import type { ReactNode } from 'react';

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
				element: <ForgotPassword />,
			},
			{
				path: '/email-verification',
				element: <EmailVerification />,
			},
			{
				path: '/verify-email',
				element: <VerifyEmail />,
			},
			{
				path: '/complete-account-setup',
				element: <CompleteAccountSetup />,
			},
			{
				path: '/complete-account-setup/verify-email',
				element: <CompleteAccountSetupVerifyEmail />,
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
						path: '',
						element: <SelectOrganization />,
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
		element: (
			<GuestOnly>
				<Onboarding />
			</GuestOnly>
		),
		children: [
			{
				path: '',
				element: <AccountInformation />,
			},
			{
				path: 'create-organization',
				element: <CreateOrganization />,
			},
			{
				path: 'create-app',
				element: <CreateApp />,
			},
			{
				path: 'smtp-configuration',
				element: <SMTPConfiguration />,
			},
			{
				path: 'invite-team-members',
				element: <InviteTeamMembers />,
			},
		],
	},
]);

export function RequireAuth({ children }: { children: ReactNode }) {
	const { isAuthenticated } = useAuthStore();
	const location = useLocation();

	if (!isAuthenticated()) {
		return <Navigate to='/login' state={{ from: location }} replace />;
	}

	return children;
}
export function GuestOnly({ children }: { children: ReactNode }) {
	const { isAuthenticated } = useAuthStore();

	if (isAuthenticated()) {
		return <Navigate to='/' />;
	}

	return children;
}

export default router;
