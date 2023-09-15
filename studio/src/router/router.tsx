import { PATHS } from '@/constants';
import ErrorBoundary from '@/pages/errors/ErrorBoundary.tsx';
import { Root } from '@/pages/root';
import useAuthStore from '@/store/auth/authStore.ts';
import useClusterStore from '@/store/cluster/clusterStore.ts';
import { lazyRouteImport } from '@/utils';
import type { ReactNode } from 'react';
import { Navigate, createBrowserRouter, useLocation } from 'react-router-dom';
const router = createBrowserRouter([
	{
		path: '/',
		element: <Root />,
		children: [
			{
				index: true,
				lazy: () => lazyRouteImport(PATHS.home),
			},
			{
				path: '/login',
				lazy: () => lazyRouteImport(PATHS.auth.login),
			},
			{
				path: '/forgot-password',
				lazy: () => lazyRouteImport(PATHS.auth.forgetPassword),
			},
			{
				path: '/confirm-change-email',
				lazy: () => lazyRouteImport(PATHS.auth.confirmChangeEmail),
			},
			{
				path: '/forgot-password',
				lazy: () => lazyRouteImport(PATHS.auth.forgetPassword),
			},
			{
				path: '/verify-email',
				lazy: () => lazyRouteImport(PATHS.auth.verifyEmail),
			},
			{
				path: '/complete-account-setup',
				lazy: () => lazyRouteImport(PATHS.auth.completeAccountSetup),
			},
			{
				path: '/complete-account-setup/verify-email',
				lazy: () => lazyRouteImport(PATHS.auth.completeAccountSetupVerifyEmail),
			},
			{
				path: '/organization',
				lazy: () => lazyRouteImport(PATHS.organization.organization),
				children: [
					{
						lazy: () => lazyRouteImport(PATHS.organization.select),
						path: '',
					},
					{
						path: ':orgId',
						lazy: () => lazyRouteImport(PATHS.organization.details),
						children: [
							{
								path: 'apps',
								children: [
									{
										index: true,
										lazy: () => lazyRouteImport(PATHS.organization.apps),
									},
									{
										path: ':appId/version/:versionId',
										lazy: () => lazyRouteImport(PATHS.version.version),
										children: [
											{
												path: '',
												lazy: () => lazyRouteImport(PATHS.version.dashboard),
											},
											{
												path: 'database',
												children: [
													{
														index: true,
														lazy: () => lazyRouteImport(PATHS.version.database),
													},
													{
														path: ':dbId/models',
														lazy: () => lazyRouteImport(PATHS.version.modelsOutlet),
														children: [
															{
																index: true,
																lazy: () => lazyRouteImport(PATHS.version.models),
															},
															{
																path: ':modelId/fields',
																lazy: () => lazyRouteImport(PATHS.version.fields),
															},
														],
													},
												],
											},
											{
												path: 'endpoint',
												lazy: () => lazyRouteImport(PATHS.version.endpoint),
												children: [
													{
														index: true,
														lazy: () => lazyRouteImport(PATHS.endpoint.endpoint),
													},
													{
														path: ':endpointId',
														lazy: () => lazyRouteImport(PATHS.endpoint.editEndpoint),
													},
													{
														path: 'logs',
														lazy: () => lazyRouteImport(PATHS.endpoint.endpointLogs),
													},
												],
											},
											{
												path: 'storage',
												lazy: () => lazyRouteImport(PATHS.version.storage),
												children: [
													{
														index: true,
														lazy: () => lazyRouteImport(PATHS.storage.storage),
													},
													{
														path: ':storageId',
														lazy: () => lazyRouteImport(PATHS.storage.bucket),
													},
													{
														path: ':storageId/bucket/:bucketName',
														lazy: () => lazyRouteImport(PATHS.storage.files),
													},
												],
											},
											{
												path: 'middleware',
												lazy: () => lazyRouteImport(PATHS.version.middlewareOutlet),
												children: [
													{
														index: true,
														lazy: () => lazyRouteImport(PATHS.version.middlewares),
													},
													{
														path: ':middlewareId',
														lazy: () => lazyRouteImport(PATHS.version.editMiddleware),
													},
												],
											},
											{
												path: 'cache',
												lazy: () => lazyRouteImport(PATHS.version.cache),
											},
											{
												path: 'queue',
												lazy: () => lazyRouteImport(PATHS.version.messageQueue),
												children: [
													{
														index: true,
														lazy: () => lazyRouteImport(PATHS.queue.queue),
													},
													{
														path: ':queueId',
														lazy: () => lazyRouteImport(PATHS.queue.editQueue),
													},
													{
														path: 'logs',
														lazy: () => lazyRouteImport(PATHS.queue.queueLogs),
													},
												],
											},
											{
												path: 'task',
												lazy: () => lazyRouteImport(PATHS.version.task),
												children: [
													{
														index: true,
														lazy: () => lazyRouteImport(PATHS.task.task),
													},
													{
														path: ':taskId',
														lazy: () => lazyRouteImport(PATHS.task.editTask),
													},
													{
														path: 'logs',
														lazy: () => lazyRouteImport(PATHS.task.taskLogs),
													},
												],
											},
											{
												path: 'settings',
												lazy: () => lazyRouteImport(PATHS.version.settings.versionSettings),
												children: [
													{
														index: true,
														lazy: () => lazyRouteImport(PATHS.version.settings.general),
													},
													{
														path: 'environment',
														lazy: () => lazyRouteImport(PATHS.version.settings.environment),
													},
													{
														path: 'npm-packages',
														lazy: () => lazyRouteImport(PATHS.version.settings.npmPackages),
													},
													{
														path: 'environment-variables',
														lazy: () =>
															lazyRouteImport(PATHS.version.settings.environmentVariables),
													},
													{
														path: 'rate-limits',
														lazy: () => lazyRouteImport(PATHS.version.settings.rateLimits),
													},
													{
														path: 'authentications',
														lazy: () => lazyRouteImport(PATHS.version.settings.authentications),
													},
													{
														path: 'api-keys',
														lazy: () => lazyRouteImport(PATHS.version.settings.apiKeys),
													},
													{
														path: 'real-time',
														lazy: () => lazyRouteImport(PATHS.version.settings.realTime),
													},
												],
											},
										],
									},
								],
							},
							{
								path: 'resources',
								lazy: () => lazyRouteImport(PATHS.organization.resources),
							},
							{
								path: 'settings',
								children: [
									{
										index: true,
										path: '',
										lazy: () => lazyRouteImport(PATHS.organization.settings.general),
									},
									{
										path: 'members',
										lazy: () => lazyRouteImport(PATHS.organization.settings.members),
									},
								],
							},
						],
					},
				],
			},
			{
				path: '/profile/settings',
				lazy: () => lazyRouteImport(PATHS.profileSettings.profileSettings),
				children: [
					{
						index: true,
						lazy: () => lazyRouteImport(PATHS.profileSettings.account),
					},
					{
						path: 'notifications',
						lazy: () => lazyRouteImport(PATHS.profileSettings.notifications),
					},
					{
						path: 'cluster-management',
						lazy: () => lazyRouteImport(PATHS.profileSettings.clusterManagement),
					},
				],
			},
		],
		errorElement: <ErrorBoundary />,
	},
	{
		path: '/onboarding',
		lazy: () => lazyRouteImport(PATHS.onboarding.onboarding),
		errorElement: <ErrorBoundary />,
		children: [
			{
				path: '',
				lazy: () => lazyRouteImport(PATHS.onboarding.accountInformation),
			},
			{
				path: 'create-organization',
				lazy: () => lazyRouteImport(PATHS.onboarding.createOrganization),
			},
			{
				path: 'create-app',
				lazy: () => lazyRouteImport(PATHS.onboarding.createApp),
			},
			{
				path: 'smtp-configuration',
				lazy: () => lazyRouteImport(PATHS.onboarding.smtpConfiguration),
			},
			{
				path: 'invite-team-members',
				lazy: () => lazyRouteImport(PATHS.onboarding.inviteTeamMembers),
			},
		],
	},
	{
		path: '/redirect-handle',
		lazy: () => lazyRouteImport(PATHS.redirectHandle),
		errorElement: <ErrorBoundary />,
	},
	{
		path: '/*',
		lazy: () => lazyRouteImport(PATHS.notFound),
		errorElement: <ErrorBoundary />,
	},
	{
		path: '/401',
		lazy: () => lazyRouteImport(PATHS.unauthorized),
		errorElement: <ErrorBoundary />,
	},
]);

export function RequireAuth({ children }: { children: JSX.Element }): JSX.Element {
	const { isAuthenticated } = useAuthStore();
	const location = useLocation();

	if (!isAuthenticated()) {
		return <Navigate to='/login' state={{ from: location }} replace />;
	}

	return children;
}

export function GuestOnly({ children }: { children: ReactNode }): JSX.Element {
	const { isAuthenticated } = useAuthStore();
	const { isCompleted } = useClusterStore();
	const { pathname } = useLocation();

	if (isAuthenticated() && isCompleted) {
		return <Navigate to='/organization' />;
	} else if (!isCompleted && pathname !== '/onboarding') {
		return <Navigate to='/onboarding' />;
	}

	return children as JSX.Element;
}

export default router;
