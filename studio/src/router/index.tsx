import { createBrowserRouter } from 'react-router-dom';
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

const router = createBrowserRouter([
	{
		path: '/',
		loader: Root.loader,
		element: <Root />,
		children: [
			{
				path: '/login',
				element: <Login />,
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
				element: <Organization />,
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
		element: <Onboarding />,
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

export default router;
