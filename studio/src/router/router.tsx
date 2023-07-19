import ErrorBoundary from '@/pages/errors/ErrorBoundary.tsx';
import { Root } from '@/pages/root';
import useAuthStore from '@/store/auth/authStore.ts';
import useClusterStore from '@/store/cluster/clusterStore.ts';
import { lazyRouteImport } from '@/utils';
import type { ReactNode } from 'react';
import { Navigate, createBrowserRouter, useLocation } from 'react-router-dom';
const path = '../pages';
const authPath = `${path}/auth`;
const organizationPath = `${path}/organization`;
const versionPath = `${path}/version`;
const profilePath = `${path}/profile`;
const onboardingPath = `${path}/onboarding`;
const endpointPath = `${path}/endpoint`;

const paths = {
	home: `${path}/home/Home.tsx`,
	auth: {
		login: `${authPath}/Login.tsx`,
		forgetPassword: `${authPath}/ForgotPassword.tsx`,
		confirmChangeEmail: `${authPath}/ConfirmChangeEmail.tsx`,
		verifyEmail: `${authPath}/VerifyEmail.tsx`,
		completeAccountSetup: `${authPath}/CompleteAccountSetup.tsx`,
		completeAccountSetupVerifyEmail: `${authPath}/CompleteAccountSetupVerifyEmail.tsx`,
	},
	organization: {
		organization: `${organizationPath}/Organization.tsx`,
		select: `${organizationPath}/OrganizationSelect.tsx`,
		details: `${organizationPath}/OrganizationDetails.tsx`,
		apps: `${organizationPath}/OrganizationApps.tsx`,
		resources: `${organizationPath}/OrganizationResources.tsx`,
		settings: {
			general: `${organizationPath}/OrganizationSettings/OrganizationSettingsGeneral.tsx`,
			members: `${organizationPath}/OrganizationSettings/OrganizationSettingsMembers.tsx`,
		},
	},
	version: {
		version: `${versionPath}/Version.tsx`,
		dashboard: `${versionPath}/VersionDashboard.tsx`,
		database: `${versionPath}/VersionDatabase.tsx`,
		models: `${versionPath}/models/Models.tsx`,
		fields: `${versionPath}/models/fields/Fields.tsx`,
		endpoint: `${versionPath}/VersionEndpoint.tsx`,
		storage: `${versionPath}/VersionStorage.tsx`,
		middlewares: `${versionPath}/VersionMiddlewares.tsx`,
		cache: `${versionPath}/VersionCache.tsx`,
		messageQueue: `${versionPath}/VersionMessageQueue.tsx`,
		cronJob: `${versionPath}/VersionCronJob.tsx`,
		settings: {
			versionSettings: `${versionPath}/settings/VersionSettings.tsx`,
			general: `${versionPath}/settings/VersionSettingsGeneral.tsx`,
			environment: `${versionPath}/settings/VersionSettingsEnvironment.tsx`,
			environmentVariables: `${versionPath}/settings/VersionSettingsEnvironmentVariables.tsx`,
			authentications: `${versionPath}/settings/VersionSettingsAuthentications.tsx`,
			apiKeys: `${versionPath}/settings/VersionSettingsAPIKeys.tsx`,
			rateLimits: `${versionPath}/settings/VersionSettingsRateLimits.tsx`,
			realTime: `${versionPath}/settings/VersionSettingsRealTime.tsx`,
			npmPackages: `${versionPath}/settings/VersionSettingsNPMPackages.tsx`,
		},
	},
	endpoint: {
		endpoint: `${endpointPath}/Endpoint.tsx`,
		editEndpoint: `${endpointPath}/EditEndpoint.tsx`,
	},
	profileSettings: {
		profileSettings: `${profilePath}/ProfileSettings.tsx`,
		account: `${profilePath}/ProfileSettingsGeneral.tsx`,
		notifications: `${profilePath}/ProfileSettingsNotifications.tsx`,
		clusterManagement: `${profilePath}/ProfileSettingsClusterManagement.tsx`,
	},
	onboarding: {
		onboarding: `${onboardingPath}/Onboarding.tsx`,
		accountInformation: `${onboardingPath}/AccountInformation.tsx`,
		createOrganization: `${onboardingPath}/CreateOrganization.tsx`,
		createApp: `${onboardingPath}/CreateApp.tsx`,
		inviteTeamMembers: `${onboardingPath}/InviteTeamMembers.tsx`,
		smtpConfiguration: `${onboardingPath}/SMTPConfiguration.tsx`,
	},
	redirectHandle: `${path}/RedirectHandle.tsx`,
};

const router = createBrowserRouter([
	{
		path: '/',
		loader: Root.loader,
		element: <Root />,
		children: [
			{
				index: true,
				lazy: () => lazyRouteImport(paths.home),
			},
			{
				path: '/login',
				lazy: () => lazyRouteImport(paths.auth.login),
			},
			{
				path: '/forgot-password',
				lazy: () => lazyRouteImport(paths.auth.forgetPassword),
			},
			{
				path: '/confirm-change-email',
				lazy: () => lazyRouteImport(paths.auth.confirmChangeEmail),
			},
			{
				path: '/forgot-password',
				lazy: () => lazyRouteImport(paths.auth.forgetPassword),
			},
			{
				path: '/verify-email',
				lazy: () => lazyRouteImport(paths.auth.verifyEmail),
			},
			{
				path: '/complete-account-setup',
				lazy: () => lazyRouteImport(paths.auth.completeAccountSetup),
			},
			{
				path: '/complete-account-setup/verify-email',
				lazy: () => lazyRouteImport(paths.auth.completeAccountSetupVerifyEmail),
			},
			{
				path: '/organization',
				lazy: () => lazyRouteImport(paths.organization.organization),
				children: [
					{
						lazy: () => lazyRouteImport(paths.organization.select),
						path: '',
					},
					{
						path: ':orgId',
						lazy: () => lazyRouteImport(paths.organization.details),
						children: [
							{
								path: 'apps',
								children: [
									{
										index: true,
										lazy: () => lazyRouteImport(paths.organization.apps),
									},
									{
										path: ':appId/version/:versionId',
										lazy: () => lazyRouteImport(paths.version.version),
										children: [
											{
												path: '',
												lazy: () => lazyRouteImport(paths.version.dashboard),
											},
											{
												path: 'database',
												children: [
													{
														index: true,
														lazy: () => lazyRouteImport(paths.version.database),
													},
													{
														path: ':dbId/models',
														children: [
															{
																index: true,
																lazy: () => lazyRouteImport(paths.version.models),
															},
															{
																path: ':modelId/fields',
																lazy: () => lazyRouteImport(paths.version.fields),
															},
														],
													},
												],
											},
											{
												path: 'endpoint',
												lazy: () => lazyRouteImport(paths.version.endpoint),
											},
											{
												path: 'storage',
												lazy: () => lazyRouteImport(paths.version.storage),
											},
											{
												path: 'middleware',
												lazy: () => lazyRouteImport(paths.version.middlewares),
											},
											{
												path: 'cache',
												lazy: () => lazyRouteImport(paths.version.cache),
											},
											{
												path: 'message-queue',
												lazy: () => lazyRouteImport(paths.version.messageQueue),
											},
											{
												path: 'cron-job',
												lazy: () => lazyRouteImport(paths.version.cronJob),
											},
											{
												path: 'settings',
												lazy: () => lazyRouteImport(paths.version.settings.versionSettings),
												children: [
													{
														index: true,
														lazy: () => lazyRouteImport(paths.version.settings.general),
													},
													{
														path: 'environment',
														lazy: () => lazyRouteImport(paths.version.settings.environment),
													},
													{
														path: 'npm-packages',
														lazy: () => lazyRouteImport(paths.version.settings.npmPackages),
													},
													{
														path: 'environment-variables',
														lazy: () =>
															lazyRouteImport(paths.version.settings.environmentVariables),
													},
													{
														path: 'rate-limits',
														lazy: () => lazyRouteImport(paths.version.settings.rateLimits),
													},
													{
														path: 'authentications',
														lazy: () => lazyRouteImport(paths.version.settings.authentications),
													},
													{
														path: 'api-keys',
														lazy: () => lazyRouteImport(paths.version.settings.apiKeys),
													},
													{
														path: 'real-time',
														lazy: () => lazyRouteImport(paths.version.settings.realTime),
													},
												],
											},
										],
									},
								],
							},
							{
								path: 'resources',
								lazy: () => lazyRouteImport(paths.organization.resources),
							},
							{
								path: 'settings',
								children: [
									{
										index: true,
										path: '',
										lazy: () => lazyRouteImport(paths.organization.settings.general),
									},
									{
										path: 'members',
										lazy: () => lazyRouteImport(paths.organization.settings.members),
									},
								],
							},
						],
					},
				],
			},
			{
				path: '/organization/:orgId/apps/:appId/version/:versionId',
				lazy: () => lazyRouteImport(paths.version.version),

				children: [
					{
						path: '',
						lazy: () => lazyRouteImport(paths.version.dashboard),
					},
					{
						path: 'database',
						lazy: () => lazyRouteImport(paths.version.database),
					},
					{
						path: 'database/:dbId/models',
						lazy: () => lazyRouteImport(paths.version.models),
					},
					{
						path: 'endpoint',
						lazy: () => lazyRouteImport(paths.version.endpoint),
						children: [
							{
								index: true,
								path: '',
								lazy: () => lazyRouteImport(paths.endpoint.endpoint),
							},
							{
								path: ':endpointId',
								lazy: () => lazyRouteImport(paths.endpoint.editEndpoint),
							},
						],
					},
					{
						path: 'storage',
						lazy: () => lazyRouteImport(paths.version.storage),
					},
					{
						path: 'middleware',
						lazy: () => lazyRouteImport(paths.version.middlewares),
					},
					{
						path: 'cache',
						lazy: () => lazyRouteImport(paths.version.cache),
					},
					{
						path: 'message-queue',
						lazy: () => lazyRouteImport(paths.version.messageQueue),
					},
					{
						path: 'cron-job',
						lazy: () => lazyRouteImport(paths.version.cronJob),
					},
					{
						path: 'settings',
						lazy: () => lazyRouteImport(paths.version.settings.versionSettings),
						children: [
							{
								index: true,
								lazy: () => lazyRouteImport(paths.version.settings.general),
							},
							{
								path: 'environment',
								lazy: () => lazyRouteImport(paths.version.settings.environment),
							},
							{
								path: 'npm-packages',
								lazy: () => lazyRouteImport(paths.version.settings.npmPackages),
							},
							{
								path: 'environment-variables',
								lazy: () => lazyRouteImport(paths.version.settings.environmentVariables),
							},
							{
								path: 'rate-limits',
								lazy: () => lazyRouteImport(paths.version.settings.rateLimits),
							},
							{
								path: 'authentications',
								lazy: () => lazyRouteImport(paths.version.settings.authentications),
							},
							{
								path: 'api-keys',
								lazy: () => lazyRouteImport(paths.version.settings.apiKeys),
							},
							{
								path: 'real-time',
								lazy: () => lazyRouteImport(paths.version.settings.realTime),
							},
						],
					},
				],
			},
			{
				path: '/profile/settings',
				lazy: () => lazyRouteImport(paths.profileSettings.profileSettings),
				children: [
					{
						index: true,
						lazy: () => lazyRouteImport(paths.profileSettings.account),
					},
					{
						path: 'notifications',
						lazy: () => lazyRouteImport(paths.profileSettings.notifications),
					},
					{
						path: 'cluster-management',
						lazy: () => lazyRouteImport(paths.profileSettings.clusterManagement),
					},
				],
			},
		],
		errorElement: <ErrorBoundary />,
	},
	{
		path: '/onboarding',
		lazy: () => lazyRouteImport(paths.onboarding.onboarding),
		errorElement: <ErrorBoundary />,
		children: [
			{
				path: '',
				lazy: () => lazyRouteImport(paths.onboarding.accountInformation),
			},
			{
				path: 'create-organization',
				lazy: () => lazyRouteImport(paths.onboarding.createOrganization),
			},
			{
				path: 'create-app',
				lazy: () => lazyRouteImport(paths.onboarding.createApp),
			},
			{
				path: 'smtp-configuration',
				lazy: () => lazyRouteImport(paths.onboarding.smtpConfiguration),
			},
			{
				path: 'invite-team-members',
				lazy: () => lazyRouteImport(paths.onboarding.inviteTeamMembers),
			},
		],
	},
	{
		path: '/redirect-handle',
		lazy: () => lazyRouteImport(paths.redirectHandle),
		errorElement: <ErrorBoundary />,
	},
]);

// eslint-disable-next-line react-refresh/only-export-components
export function RequireAuth({ children }: { children: JSX.Element }): JSX.Element {
	const { isAuthenticated } = useAuthStore();
	const location = useLocation();

	if (!isAuthenticated()) {
		return <Navigate to='/login' state={{ from: location }} replace />;
	}

	return children;
}
// eslint-disable-next-line react-refresh/only-export-components
export function GuestOnly({ children }: { children: ReactNode }): JSX.Element {
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
