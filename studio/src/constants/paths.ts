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
	home: `${path}/home/Home`,
	auth: {
		login: `${authPath}/Login`,
		forgetPassword: `${authPath}/ForgotPassword`,
		confirmChangeEmail: `${authPath}/ConfirmChangeEmail`,
		verifyEmail: `${authPath}/VerifyEmail`,
		completeAccountSetup: `${authPath}/CompleteAccountSetup`,
		completeAccountSetupVerifyEmail: `${authPath}/CompleteAccountSetupVerifyEmail`,
	},
	organization: {
		organization: `${organizationPath}/Organization`,
		select: `${organizationPath}/OrganizationSelect`,
		details: `${organizationPath}/OrganizationDetails`,
		apps: `${organizationPath}/OrganizationApps`,
		resources: `${organizationPath}/OrganizationResources`,
		settings: {
			general: `${organizationPath}/OrganizationSettings/OrganizationSettingsGeneral`,
			members: `${organizationPath}/OrganizationSettings/OrganizationSettingsMembers`,
		},
	},
	version: {
		version: `${versionPath}/Version`,
		dashboard: `${versionPath}/VersionDashboard`,
		database: `${versionPath}/VersionDatabase`,
		navigator: `${versionPath}/navigator/Navigator`,
		models: `${versionPath}/models/Models`,
		modelsOutlet: `${versionPath}/models/ModelsOutlet`,
		fields: `${versionPath}/models/fields/Fields`,
		endpoint: `${versionPath}/VersionEndpoint`,
		storage: `${versionPath}/VersionStorage`,
		function: `${versionPath}/VersionFunction`,
		cache: `${versionPath}/VersionCache`,
		messageQueue: `${versionPath}/VersionMessageQueue`,
		task: `${versionPath}/VersionTask`,
		notifications: `${versionPath}/VersionNotifications`,
		middlewares: `${versionPath}/VersionMiddlewares`,
		settings: {
			versionSettings: `${versionPath}/settings/VersionSettings`,
			general: `${versionPath}/settings/VersionSettingsGeneral`,
			environment: `${versionPath}/settings/VersionSettingsEnvironment`,
			environmentVariables: `${versionPath}/settings/VersionSettingsEnvironmentVariables`,
			authentications: `${versionPath}/settings/VersionSettingsAuthentications`,
			apiKeys: `${versionPath}/settings/VersionSettingsAPIKeys`,
			rateLimits: `${versionPath}/settings/VersionSettingsRateLimits`,
			realTime: `${versionPath}/settings/VersionSettingsRealTime`,
			npmPackages: `${versionPath}/settings/VersionSettingsNPMPackages`,
		},
	},
	endpoint: {
		endpoint: `${endpointPath}/Endpoint`,
		editEndpoint: `${endpointPath}/EditEndpoint`,
		endpointLogs: `${endpointPath}/EndpointLogs`,
	},
	queue: {
		queue: `${queuePath}/MessageQueue`,
		editQueue: `${queuePath}/EditMessageQueue`,
		queueLogs: `${queuePath}/MessageQueueLogs`,
	},
	task: {
		task: `${path}/task/Task`,
		editTask: `${path}/task/EditTask`,
		taskLogs: `${path}/task/TaskLogs`,
	},
	function: {
		function: `${path}/function/Function`,
		editFunction: `${path}/function/EditFunction`,
	},
	middleware: {
		middlewares: `${path}/middleware/Middleware`,
		editMiddleware: `${path}/middleware/EditMiddleware`,
	},
	storage: {
		storage: `${storagePath}/Storage`,
		bucket: `${storagePath}/Bucket`,
		files: `${storagePath}/Files`,
	},
	profileSettings: {
		profileSettings: `${profilePath}/ProfileSettings`,
		account: `${profilePath}/ProfileSettingsGeneral`,
		notifications: `${profilePath}/ProfileSettingsNotifications`,
		clusterManagement: `${profilePath}/ClusterManagement`,
	},
	onboarding: {
		onboarding: `${onboardingPath}/Onboarding`,
		accountInformation: `${onboardingPath}/AccountInformation`,
		createOrganization: `${onboardingPath}/CreateOrganization`,
		createApp: `${onboardingPath}/CreateApp`,
		inviteTeamMembers: `${onboardingPath}/InviteTeamMembers`,
		smtpConfiguration: `${onboardingPath}/SMTPConfiguration`,
	},
	redirectHandle: `${path}/redirect-handle/RedirectHandle`,
	notFound: `${path}/errors/404`,
	unauthorized: `${path}/errors/401`,
};
