const path = '../pages';
const authPath = `${path}/auth`;
const organizationPath = `${path}/organization`;
const versionPath = `${path}/version`;
const profilePath = `${path}/profile`;
const onboardingPath = `${path}/onboarding`;
const endpointPath = `${path}/endpoint`;
const queuePath = `${path}/queue`;
const storagePath = `${path}/storage`;

export const PATHS = {
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
		modelsOutlet: `${versionPath}/models/ModelsOutlet.tsx`,
		fields: `${versionPath}/models/fields/Fields.tsx`,
		endpoint: `${versionPath}/VersionEndpoint.tsx`,
		storage: `${versionPath}/VersionStorage.tsx`,
		middlewareOutlet: `${versionPath}/VersionMiddlewaresOutlet.tsx`,
		middlewares: `${versionPath}/VersionMiddlewares.tsx`,
		editMiddleware: `${versionPath}/VersionEditMiddlewares.tsx`,
		cache: `${versionPath}/VersionCache.tsx`,
		messageQueue: `${versionPath}/VersionMessageQueue.tsx`,
		task: `${versionPath}/VersionTask.tsx`,
		notifications: `${versionPath}/VersionNotifications.tsx`,
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
		endpointLogs: `${endpointPath}/EndpointLogs.tsx`,
	},
	queue: {
		queue: `${queuePath}/MessageQueue.tsx`,
		editQueue: `${queuePath}/EditMessageQueue.tsx`,
		queueLogs: `${queuePath}/MessageQueueLogs.tsx`,
	},
	task: {
		task: `${path}/task/Task.tsx`,
		editTask: `${path}/task/EditTask.tsx`,
		taskLogs: `${path}/task/TaskLogs.tsx`,
	},
	storage: {
		storage: `${storagePath}/Storage.tsx`,
		bucket: `${storagePath}/Bucket.tsx`,
		files: `${storagePath}/Files.tsx`,
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
	notFound: `${path}/errors/404.tsx`,
	unauthorized: `${path}/errors/401.tsx`,
};
