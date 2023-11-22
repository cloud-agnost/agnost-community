import { componentLoader } from '@/helpers';
import { CompleteAccountSetupVerifyEmail, ConfirmChangeEmail } from '@/pages/auth';
import ErrorBoundary from '@/pages/errors/ErrorBoundary.tsx';
import { Root } from '@/pages/root';
import useAuthStore from '@/store/auth/authStore.ts';
import useClusterStore from '@/store/cluster/clusterStore.ts';
import loadable from '@loadable/component';
import type { ReactNode } from 'react';
import { Navigate, createBrowserRouter, useLocation } from 'react-router-dom';
import ChangePasswordWithToken from '../pages/auth/ChangePasswordWithToken';
import EditEndpoint from '../pages/endpoint/EditEndpoint';
import EditFunction from '../pages/function/EditFunction';
import EditMiddleware from '../pages/middleware/EditMiddleware';
import EditMessageQueue from '../pages/queue/EditMessageQueue';
import EditTask from '../pages/task/EditTask';
import Home from '../pages/home/Home';
import AccountInformation from '../pages/onboarding/AccountInformation';
import InviteTeamMembers from '../pages/onboarding/InviteTeamMembers';
import Onboarding from '../pages/onboarding/Onboarding';
import OrganizationDetails from '../pages/organization/OrganizationDetails';
import RedirectHandle from '../pages/redirect-handle/RedirectHandle';
import Buckets from '../pages/storage/Bucket';
import Files from '../pages/storage/Files';
import VersionDashboard from '../pages/version/VersionDashboard';
import Fields from '../pages/version/models/fields/Fields';
import Navigator from '../pages/version/navigator/Navigator';
import ModelsOutlet from '../pages/version/models/ModelsOutlet';
export function Fallback(): JSX.Element {
	return <div>Something went wrong</div>;
}

const HomeLoadable = loadable(() => componentLoader(() => import('../pages/home/Home')), {
	fallback: <Fallback />,
	resolveComponent: (mod: any) => mod.default,
});

const Login = loadable(() => componentLoader(() => import('../pages/auth/Login')), {
	fallback: <Fallback />,
	resolveComponent: (mod: any) => mod.default,
});

const ForgotPassword = loadable(
	() => componentLoader(() => import('../pages/auth/ForgotPassword')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);
const ChangePasswordWithTokenLoadable = loadable(
	() => componentLoader(() => import('../pages/auth/ChangePasswordWithToken')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const ConfirmChangeEmailLoadable = loadable(
	() => componentLoader(() => import('../pages/auth/ConfirmChangeEmail')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const VerifyEmail = loadable(() => componentLoader(() => import('../pages/auth/VerifyEmail')), {
	fallback: <Fallback />,
	resolveComponent: (mod: any) => mod.default,
});

const CompleteAccountSetup = loadable(
	() => componentLoader(() => import('../pages/auth/CompleteAccountSetup')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const CompleteAccountSetupVerifyEmailLoadable = loadable(
	() => componentLoader(() => import('../pages/auth/CompleteAccountSetupVerifyEmail')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const Organization = loadable(
	() => componentLoader(() => import('../pages/organization/Organization')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const OrganizationSelect = loadable(
	() => componentLoader(() => import('../pages/organization/OrganizationSelect')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const OrganizationDetailsLoadable = loadable(
	() => componentLoader(() => import('../pages/organization/OrganizationDetails')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const OrganizationApps = loadable(
	() => componentLoader(() => import('../pages/organization/OrganizationApps')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const OrganizationResources = loadable(
	() => componentLoader(() => import('../pages/organization/OrganizationResources')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const OrganizationSettingsGeneral = loadable(
	() =>
		componentLoader(
			() => import('../pages/organization/OrganizationSettings/OrganizationSettingsGeneral'),
		),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const OrganizationSettingsMembers = loadable(
	() =>
		componentLoader(
			() => import('../pages/organization/OrganizationSettings/OrganizationSettingsMembers'),
		),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const Version = loadable(() => componentLoader(() => import('../pages/version/Version')), {
	fallback: <Fallback />,
	resolveComponent: (mod: any) => mod.default,
});

const Dashboard = loadable(
	() => componentLoader(() => import('../pages/version/VersionDashboard')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const VersionDatabase = loadable(
	() => componentLoader(() => import('../pages/version/VersionDatabase')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const NavigatorLoadable = loadable(
	() => componentLoader(() => import('../pages/version/navigator/Navigator')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const Models = loadable(() => componentLoader(() => import('../pages/version/models/Models')), {
	fallback: <Fallback />,
	resolveComponent: (mod: any) => mod.default,
});

const ModelsOutletLoadable = loadable(
	() => componentLoader(() => import('../pages/version/models/ModelsOutlet')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const FieldsLoadable = loadable(
	() => componentLoader(() => import('../pages/version/models/fields/Fields')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const VersionEndpoint = loadable(
	() => componentLoader(() => import('../pages/version/VersionEndpoint')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const VersionStorage = loadable(
	() => componentLoader(() => import('../pages/version/VersionStorage')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const VersionFunction = loadable(
	() => componentLoader(() => import('../pages/version/VersionFunction')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const VersionCache = loadable(
	() => componentLoader(() => import('../pages/version/VersionCache')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const VersionMessageQueue = loadable(
	() => componentLoader(() => import('../pages/version/VersionMessageQueue')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const VersionTask = loadable(() => componentLoader(() => import('../pages/version/VersionTask')), {
	fallback: <Fallback />,
	resolveComponent: (mod: any) => mod.default,
});

const VersionNotifications = loadable(
	() => componentLoader(() => import('../pages/version/VersionNotifications')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const VersionMiddlewares = loadable(
	() => componentLoader(() => import('../pages/version/VersionMiddlewares')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const VersionSettings = loadable(
	() => componentLoader(() => import('../pages/version/settings/VersionSettings')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const VersionSettingsGeneral = loadable(
	() => componentLoader(() => import('../pages/version/settings/VersionSettingsGeneral')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const VersionSettingsEnvironment = loadable(
	() => componentLoader(() => import('../pages/version/settings/VersionSettingsEnvironment')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const VersionSettingsEnvironmentVariables = loadable(
	() =>
		componentLoader(() => import('../pages/version/settings/VersionSettingsEnvironmentVariables')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const VersionSettingsAuthentications = loadable(
	() => componentLoader(() => import('../pages/version/settings/VersionSettingsAuthentications')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const VersionSettingsAPIKeys = loadable(
	() => componentLoader(() => import('../pages/version/settings/VersionSettingsAPIKeys')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const VersionSettingsRateLimits = loadable(
	() => componentLoader(() => import('../pages/version/settings/VersionSettingsRateLimits')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const VersionSettingsRealTime = loadable(
	() => componentLoader(() => import('../pages/version/settings/VersionSettingsRealTime')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const VersionSettingsNPMPackages = loadable(
	() => componentLoader(() => import('../pages/version/settings/VersionSettingsNPMPackages')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);
// endpoint
const Endpoint = loadable(() => componentLoader(() => import('../pages/endpoint/Endpoint')), {
	fallback: <Fallback />,
	resolveComponent: (mod: any) => mod.default,
});

const EditEndpointLoadable = loadable(
	() => componentLoader(() => import('../pages/endpoint/EditEndpoint')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const EndpointLogs = loadable(
	() => componentLoader(() => import('../pages/endpoint/EndpointLogs')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

// queue
const MessageQueue = loadable(() => componentLoader(() => import('../pages/queue/MessageQueue')), {
	fallback: <Fallback />,
	resolveComponent: (mod: any) => mod.default,
});

const EditMessageQueueLoadable = loadable(
	() => componentLoader(() => import('../pages/queue/EditMessageQueue')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const MessageQueueLogs = loadable(
	() => componentLoader(() => import('../pages/queue/MessageQueueLogs')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

// task
const Task = loadable(() => componentLoader(() => import('../pages/task/Task')), {
	fallback: <Fallback />,
	resolveComponent: (mod: any) => mod.default,
});

const EditTaskLoadable = loadable(() => componentLoader(() => import('../pages/task/EditTask')), {
	fallback: <Fallback />,
	resolveComponent: (mod: any) => mod.default,
});

const TaskLogs = loadable(() => componentLoader(() => import('../pages/task/TaskLogs')), {
	fallback: <Fallback />,
	resolveComponent: (mod: any) => mod.default,
});

// function
const Function = loadable(() => componentLoader(() => import('../pages/function/Function')), {
	fallback: <Fallback />,
	resolveComponent: (mod: any) => mod.default,
});

const EditFunctionLoadable = loadable(
	() => componentLoader(() => import('../pages/function/EditFunction')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

// middleware
const Middleware = loadable(() => componentLoader(() => import('../pages/middleware/Middleware')), {
	fallback: <Fallback />,
	resolveComponent: (mod: any) => mod.default,
});

const EditMiddlewareLoadable = loadable(
	() => componentLoader(() => import('../pages/middleware/EditMiddleware')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

// storage
const Storage = loadable(() => componentLoader(() => import('../pages/storage/Storage')), {
	fallback: <Fallback />,
	resolveComponent: (mod: any) => mod.default,
});

const BucketLoadable = loadable(() => componentLoader(() => import('../pages/storage/Bucket')), {
	fallback: <Fallback />,
	resolveComponent: (mod: any) => mod.default,
});

const FilesLoadable = loadable(() => componentLoader(() => import('../pages/storage/Files')), {
	fallback: <Fallback />,
	resolveComponent: (mod: any) => mod.default,
});

// profileSettings
const ProfileSettings = loadable(
	() => componentLoader(() => import('../pages/profile/ProfileSettings')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const ProfileSettingsGeneral = loadable(
	() => componentLoader(() => import('../pages/profile/ProfileSettingsGeneral')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const ProfileSettingsNotifications = loadable(
	() => componentLoader(() => import('../pages/profile/ProfileSettingsNotifications')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const ClusterManagement = loadable(
	() => componentLoader(() => import('../pages/profile/ClusterManagement')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

// onboarding
const OnboardingLoadable = loadable(
	() => componentLoader(() => import('../pages/onboarding/Onboarding')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const AccountInformationLoadable = loadable(
	() => componentLoader(() => import('../pages/onboarding/AccountInformation')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const CreateOrganization = loadable(
	() => componentLoader(() => import('../pages/onboarding/CreateOrganization')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const CreateApp = loadable(() => componentLoader(() => import('../pages/onboarding/CreateApp')), {
	fallback: <Fallback />,
	resolveComponent: (mod: any) => mod.default,
});

const InviteTeamMembersLoadable = loadable(
	() => componentLoader(() => import('../pages/onboarding/InviteTeamMembers')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const SMTPConfiguration = loadable(
	() => componentLoader(() => import('../pages/onboarding/SMTPConfiguration')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

// others
const RedirectHandleLoadable = loadable(
	() => componentLoader(() => import('../pages/redirect-handle/RedirectHandle')),
	{
		fallback: <Fallback />,
		resolveComponent: (mod: any) => mod.default,
	},
);

const NotFound = loadable(() => componentLoader(() => import('../pages/errors/404')), {
	fallback: <Fallback />,
	resolveComponent: (mod: any) => mod.default,
});

const Unauthorized = loadable(() => componentLoader(() => import('../pages/errors/401')), {
	fallback: <Fallback />,
	resolveComponent: (mod: any) => mod.default,
});

const router = createBrowserRouter([
	{
		path: '/',
		element: <Root />,
		children: [
			{
				index: true,
				element: <HomeLoadable />,
				loader: Home.loader,
			},
			{
				path: '/login',
				element: <Login />,
			},
			{
				path: '/forgot-password',
				element: <ForgotPassword />,
			},
			{
				path: '/confirm-change-email',
				element: <ConfirmChangeEmailLoadable />,
				loader: ConfirmChangeEmail.loader,
			},
			{
				path: '/change-password',
				element: <ChangePasswordWithTokenLoadable />,
				loader: ChangePasswordWithToken.loader,
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
				element: <CompleteAccountSetupVerifyEmailLoadable />,
				loader: CompleteAccountSetupVerifyEmail.loader,
			},
			{
				path: '/organization',
				element: <Organization />,
				children: [
					{
						path: '',
						element: <OrganizationSelect />,
					},
					{
						path: ':orgId',
						element: <OrganizationDetailsLoadable />,
						loader: OrganizationDetails.loader,
						children: [
							{
								path: 'apps',
								children: [
									{
										index: true,
										element: <OrganizationApps />,
									},
									{
										path: ':appId/version/:versionId',

										element: <Version />,
										children: [
											{
												path: '',

												element: <Dashboard />,
												loader: VersionDashboard.loader,
											},
											{
												path: 'database',
												children: [
													{
														index: true,
														element: <VersionDatabase />,
													},
													{
														path: ':dbId/navigator',
														element: <NavigatorLoadable />,
														loader: Navigator.loader,
													},
													{
														path: ':dbId/models',
														element: <ModelsOutletLoadable />,
														loader: ModelsOutlet.loader,
														children: [
															{
																index: true,
																element: <Models />,
															},
															{
																path: ':modelId/fields',
																element: <FieldsLoadable />,
																loader: Fields.loader,
															},
														],
													},
												],
											},
											{
												path: 'endpoint',
												element: <VersionEndpoint />,
												children: [
													{
														index: true,
														element: <Endpoint />,
													},
													{
														path: ':endpointId',
														element: <EditEndpointLoadable />,
														loader: EditEndpoint.loader,
													},
													{
														path: 'logs',
														element: <EndpointLogs />,
													},
												],
											},
											{
												path: 'function',
												element: <VersionFunction />,
												children: [
													{
														index: true,
														element: <Function />,
													},
													{
														path: ':funcId',
														element: <EditFunctionLoadable />,
														loader: EditFunction.loader,
													},
												],
											},
											{
												path: 'storage',
												element: <VersionStorage />,
												children: [
													{
														index: true,
														element: <Storage />,
													},
													{
														path: ':storageId',
														element: <BucketLoadable />,
														loader: Buckets.loader,
													},
													{
														path: ':storageId/bucket/:bucketName',
														element: <FilesLoadable />,
														loader: Files.loader,
													},
												],
											},
											{
												path: 'middleware',
												element: <VersionMiddlewares />,
												children: [
													{
														index: true,
														element: <Middleware />,
													},
													{
														path: ':middlewareId',
														element: <EditMiddlewareLoadable />,
														loader: EditMiddleware.loader,
													},
												],
											},
											{
												path: 'cache',
												element: <VersionCache />,
											},
											{
												path: 'queue',
												element: <VersionMessageQueue />,
												children: [
													{
														index: true,
														element: <MessageQueue />,
													},
													{
														path: ':queueId',
														element: <EditMessageQueueLoadable />,
														loader: EditMessageQueue.loader,
													},
													{
														path: 'logs',
														element: <MessageQueueLogs />,
													},
												],
											},
											{
												path: 'task',
												element: <VersionTask />,
												children: [
													{
														index: true,
														element: <Task />,
													},
													{
														path: ':taskId',
														element: <EditTaskLoadable />,
														loader: EditTask.loader,
													},
													{
														path: 'logs',
														element: <TaskLogs />,
													},
												],
											},
											{
												path: 'notifications',
												element: <VersionNotifications />,
											},
											{
												path: 'settings',
												element: <VersionSettings />,
												children: [
													{
														index: true,
														element: <VersionSettingsGeneral />,
													},
													{
														path: 'environment',
														element: <VersionSettingsEnvironment />,
													},
													{
														path: 'npm-packages',
														element: <VersionSettingsNPMPackages />,
													},
													{
														path: 'environment-variables',
														element: <VersionSettingsEnvironmentVariables />,
													},
													{
														path: 'rate-limits',
														element: <VersionSettingsRateLimits />,
													},
													{
														path: 'authentications',
														element: <VersionSettingsAuthentications />,
													},
													{
														path: 'api-keys',
														element: <VersionSettingsAPIKeys />,
													},
													{
														path: 'real-time',
														element: <VersionSettingsRealTime />,
													},
												],
											},
										],
									},
								],
							},
							{
								path: 'resources',
								element: <OrganizationResources />,
							},
							{
								path: 'settings',
								children: [
									{
										index: true,
										path: '',
										element: <OrganizationSettingsGeneral />,
									},
									{
										path: 'members',
										element: <OrganizationSettingsMembers />,
									},
								],
							},
						],
					},
				],
			},
			{
				path: '/profile/settings',
				element: <ProfileSettings />,
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
						element: <ClusterManagement />,
					},
				],
			},
		],
		errorElement: <ErrorBoundary />,
	},
	{
		path: '/onboarding',
		element: <OnboardingLoadable />,
		loader: Onboarding.loader,
		errorElement: <ErrorBoundary />,
		children: [
			{
				path: '',
				element: <AccountInformationLoadable />,
				loader: AccountInformation.loader,
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
				element: <InviteTeamMembersLoadable />,
				loader: InviteTeamMembers.loader,
			},
		],
	},
	{
		path: '/redirect-handle',
		element: <RedirectHandleLoadable />,
		loader: RedirectHandle.loader,
		errorElement: <ErrorBoundary />,
	},
	{
		path: '/*',
		element: <NotFound />,
		errorElement: <ErrorBoundary />,
	},
	{
		path: '/401',
		element: <Unauthorized />,
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
