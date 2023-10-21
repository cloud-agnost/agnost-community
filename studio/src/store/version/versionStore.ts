import { VersionService } from '@/services';
import {
	APIError,
	APIKey,
	AddNPMPackageParams,
	AddVersionVariableParams,
	AuthMessageTemplateParams,
	BaseParams,
	CreateAPIKeyParams,
	CreateCopyOfVersionParams,
	CreateOAuthConfigParams,
	CreateRateLimitParams,
	DeleteAPIKeyParams,
	DeleteMultipleAPIKeys,
	DeleteMultipleNPMPackagesParams,
	DeleteMultipleRateLimitsParams,
	DeleteMultipleVersionVariablesParams,
	DeleteNPMPackageParams,
	DeleteOAuthConfigParams,
	DeleteRateLimitParams,
	DeleteVersionParams,
	DeleteVersionVariableParams,
	DesignElement,
	EditRateLimitParams,
	GetVersionByIdParams,
	GetVersionLogBucketsParams,
	GetVersionLogsParams,
	GetVersionNotificationParams,
	GetVersionRequest,
	Notification,
	Param,
	RateLimit,
	SaveEmailAuthParams,
	SaveEmailPhoneParams,
	SaveRedirectURLsParams,
	SaveUserDataModelInfoParams,
	SearchDesignElementParams,
	SearchNPMPackages,
	SearchNPMPackagesParams,
	UpdateAPIKeyParams,
	UpdateOAuthConfigParams,
	UpdateVersionVariableParams,
	Version,
	VersionLog,
	VersionLogBucket,
	VersionRealtimeProperties,
} from '@/types';
import { history, notify, translate } from '@/utils';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import useAuthStore from '../auth/authStore';

interface VersionStore {
	loading: boolean;
	error: APIError;
	version: Version;
	versions: Version[];
	param: Param;
	rateLimit: RateLimit;
	versionPage: number;
	editParamDrawerIsOpen: boolean;
	editRateLimitDrawerIsOpen: boolean;
	createCopyVersionDrawerIsOpen: boolean;
	editAPIKeyDrawerIsOpen: boolean;
	selectedAPIKey: APIKey;
	logBuckets: VersionLogBucket;
	deleteVersionDrawerIsOpen: boolean;
	logs: VersionLog[];
	notifications: Notification[];
	notificationsPreview: Notification[];
	lastFetchedLogCount: number;
	log: VersionLog;
	showLogDetails: boolean;
	notificationLastSeen: Date;
	notificationLastFetchedCount: number;
	designElements: DesignElement[];
	selectVersion: (version: Version) => void;
	setSelectedAPIKey: (key: APIKey) => void;
	setEditAPIKeyDrawerIsOpen: (isOpen: boolean) => void;
	getVersionById: (req: GetVersionByIdParams) => Promise<Version>;
	getAllVersionsVisibleToUser: (req: GetVersionRequest) => Promise<Version[]>;
	setVersionPage: (page: number) => void;
	updateVersionProperties: (params: BaseParams & Partial<Version>) => Promise<Version>;
	createRateLimit: (params: CreateRateLimitParams) => Promise<RateLimit>;
	deleteRateLimit: (params: DeleteRateLimitParams) => Promise<Version>;
	orderEndpointRateLimits: (limits: string[]) => void;
	orderRealtimeRateLimits: (limits: string[]) => void;
	searchNPMPackages: (params: SearchNPMPackagesParams) => Promise<SearchNPMPackages[]>;
	addNPMPackage: (params: AddNPMPackageParams, showAlert?: boolean) => Promise<Version>;
	deleteNPMPackage: (params: DeleteNPMPackageParams, showAlert?: boolean) => Promise<Version>;
	deleteMultipleNPMPackages: (
		params: DeleteMultipleNPMPackagesParams,
		showAlert?: boolean,
	) => Promise<Version>;
	setParam: (param: Param) => void;
	addParam: (params: AddVersionVariableParams, showAlert?: boolean) => Promise<Version>;
	deleteParam: (params: DeleteVersionVariableParams, showAlert?: boolean) => Promise<Version>;
	deleteMultipleParams: (
		params: DeleteMultipleVersionVariablesParams,
		showAlert?: boolean,
	) => Promise<Version>;
	updateParam: (params: UpdateVersionVariableParams, showAlert?: boolean) => Promise<Version>;
	setEditParamDrawerIsOpen: (isOpen: boolean) => void;
	createCopyOfVersion: (
		params: CreateCopyOfVersionParams,
		returnRedirect?: boolean,
	) => Promise<Version | void>;
	setEditRateLimitDrawerIsOpen: (isOpen: boolean) => void;
	setRateLimit: (rateLimit: RateLimit) => void;
	editRateLimit: (params: EditRateLimitParams, showAlert?: boolean) => Promise<Version>;
	deleteMultipleRateLimits: (
		params: DeleteMultipleRateLimitsParams,
		showAlert?: boolean,
	) => Promise<Version>;
	getVersionDashboardPath: (appendPath?: string, version?: Version) => string;
	setCreateCopyVersionDrawerIsOpen: (isOpen: boolean) => void;
	createAPIKey: (params: CreateAPIKeyParams, showAlert?: boolean) => Promise<Version>;
	editAPIKey: (params: UpdateAPIKeyParams, showAlert?: boolean) => Promise<Version>;
	deleteAPIKey: (params: DeleteAPIKeyParams, showAlert?: boolean) => Promise<Version>;
	deleteMultipleAPIKeys: (params: DeleteMultipleAPIKeys, showAlert?: boolean) => Promise<Version>;
	updateVersionRealtimeProperties: (
		version: BaseParams & Partial<VersionRealtimeProperties>,
		showAlert?: boolean,
	) => Promise<Version>;
	getVersionLogs: (params: GetVersionLogsParams) => Promise<void>;
	getVersionLogBuckets: (params: GetVersionLogBucketsParams) => Promise<void>;
	openVersionLogDetails: (log: VersionLog) => void;
	closeVersionLogDetails: () => void;
	deleteVersion: (params: DeleteVersionParams, showAlert?: boolean) => Promise<void>;
	getVersionNotifications: (params: GetVersionNotificationParams) => Promise<void>;
	updateNotificationLastSeen: () => void;
	searchDesignElements: (params: SearchDesignElementParams) => Promise<DesignElement[]>;
	resetDesignElements: () => void;
	saveUserDataModelInfo: (params: SaveUserDataModelInfoParams) => Promise<void>;
	addMissingUserDataModelFields: (params: SaveUserDataModelInfoParams) => Promise<void>;
	saveRedirectURLs: (params: SaveRedirectURLsParams) => Promise<void>;
	saveEmailAuthSettings: (params: SaveEmailAuthParams) => Promise<void>;
	savePhoneAuthSettings: (params: SaveEmailPhoneParams) => Promise<void>;
	createOAuthConfig: (params: CreateOAuthConfigParams) => Promise<void>;
	updateOAuthConfig: (params: UpdateOAuthConfigParams) => Promise<void>;
	deleteOAuthConfig: (params: DeleteOAuthConfigParams) => Promise<void>;
	setAuthMessageTemplate: (params: AuthMessageTemplateParams) => Promise<void>;
}

const useVersionStore = create<VersionStore>()(
	devtools(
		persist(
			(set, get) => ({
				notificationLastFetchedCount: 0,
				loading: false,
				editAPIKeyDrawerIsOpen: false,
				selectedAPIKey: {} as APIKey,
				error: {} as APIError,
				deleteVersionDrawerIsOpen: false,
				version: {} as Version,
				versions: [],
				versionPage: 0,
				param: {} as Param,
				rateLimit: {} as RateLimit,
				editParamDrawerIsOpen: false,
				editRateLimitDrawerIsOpen: false,
				createCopyVersionDrawerIsOpen: false,
				logBuckets: {} as VersionLogBucket,
				logs: [],
				notifications: [],
				notificationsPreview: [],
				log: {} as VersionLog,
				lastFetchedLogCount: 0,
				showLogDetails: false,
				notificationLastSeen: new Date(),
				designElements: [],
				selectVersion: (version: Version) => {
					set({ version });
					history.navigate?.(get().getVersionDashboardPath());
				},
				setSelectedAPIKey: (key: APIKey) => {
					set({ selectedAPIKey: key });
				},
				setEditAPIKeyDrawerIsOpen: (isOpen: boolean) => {
					set({ editAPIKeyDrawerIsOpen: isOpen });
				},
				setCreateCopyVersionDrawerIsOpen: (isOpen: boolean) => {
					set({ createCopyVersionDrawerIsOpen: isOpen });
				},
				getVersionById: async (params: GetVersionByIdParams) => {
					const version = await VersionService.getVersionById(params);
					set({ version });
					return version;
				},
				getAllVersionsVisibleToUser: async (req: GetVersionRequest) => {
					set({ loading: true });
					try {
						const versions = await VersionService.getAllVersionsVisibleToUser(req);
						if (!get().versionPage) set({ versions });
						else set((prev) => ({ versions: [...prev.versions, ...versions] }));
						return versions;
					} catch (error) {
						set({ error: error as APIError });
					} finally {
						set({ loading: false });
					}
				},
				setVersionPage: (page: number) => {
					set({ versionPage: page });
				},
				updateVersionProperties: async ({
					orgId,
					versionId,
					appId,
					...data
				}: BaseParams & Partial<Version>) => {
					try {
						const version = await VersionService.updateVersionProperties({
							orgId,
							versionId,
							appId,
							private: get().version?.private ?? false,
							defaultEndpointLimits: get().version?.defaultEndpointLimits ?? [],
							readOnly: get().version?.readOnly ?? false,
							name: get().version?.name ?? '',
							...data,
						});
						set({ version });
						return version;
					} catch (e) {
						const error = e as APIError;
						notify({
							type: 'error',
							title: error.error,
							description: error.details,
						});
						throw e;
					}
				},
				createRateLimit: async (params: CreateRateLimitParams) => {
					const version = await VersionService.createRateLimit(params);
					set({ version });
					return version.limits.at(-1);
				},
				deleteRateLimit: async (params: DeleteRateLimitParams) => {
					try {
						const version = await VersionService.deleteRateLimit(params);
						set({ version });
						notify({
							type: 'success',
							title: translate('general.success'),
							description: translate('version.limiter_deleted'),
						});
						return version;
					} catch (e) {
						const error = e as APIError;
						notify({
							type: 'error',
							title: error.error,
							description: error.details,
						});
						throw e;
					}
				},
				orderEndpointRateLimits: (limits: string[]) => {
					set((prev) => {
						if (!prev.version) return prev;
						prev.version.defaultEndpointLimits = limits;
						return {
							version: prev.version,
						};
					});
				},
				orderRealtimeRateLimits: (limits: string[]) => {
					set((prev) => {
						if (!prev.version) return prev;
						prev.version.realtime.rateLimits = limits;
						return {
							version: prev.version,
						};
					});
				},
				searchNPMPackages: async (params: SearchNPMPackagesParams) => {
					try {
						return VersionService.searchNPMPackages(params);
					} catch (e) {
						const error = e as APIError;
						notify({
							type: 'error',
							title: error.error,
							description: error.details,
						});
						throw e;
					}
				},
				addNPMPackage: async (params: AddNPMPackageParams, showAlert) => {
					try {
						const version = await VersionService.addNPMPackage(params);
						set({ version });
						if (showAlert) {
							notify({
								type: 'success',
								title: translate('general.success'),
								description: translate('version.npm.success'),
							});
						}
						return version;
					} catch (e) {
						const error = e as APIError;
						const errorArray = error.fields ? error.fields : [{ msg: error.details }];
						for (const field of errorArray) {
							notify({
								type: 'error',
								title: error.error,
								description: field.msg,
							});
						}
						throw e;
					}
				},
				deleteNPMPackage: async (params: DeleteNPMPackageParams, showAlert) => {
					try {
						const version = await VersionService.deleteNPMPackage(params);
						set({ version });
						if (showAlert) {
							notify({
								type: 'success',
								title: translate('general.success'),
								description: translate('version.npm.deleted'),
							});
						}
						return version;
					} catch (e) {
						const error = e as APIError;
						notify({
							type: 'error',
							title: error.error,
							description: error.details,
						});
						throw e;
					}
				},
				deleteMultipleNPMPackages: async (params: DeleteMultipleNPMPackagesParams, showAlert) => {
					try {
						const version = await VersionService.deleteMultipleNPMPackages(params);
						set({ version });
						if (showAlert) {
							notify({
								type: 'success',
								title: translate('general.success'),
								description: translate('version.npm.deleted'),
							});
						}
						return version;
					} catch (e) {
						const error = e as APIError;
						notify({
							type: 'error',
							title: error.error,
							description: error.details,
						});
						throw e;
					}
				},
				setParam: (param: Param) => {
					set({ param });
				},
				addParam: async (params: AddVersionVariableParams, showAlert) => {
					try {
						const version = await VersionService.addVersionVariable(params);
						set({ version });
						showAlert &&
							notify({
								type: 'success',
								title: translate('general.success'),
								description: translate('version.variable.success'),
							});
						return version;
					} catch (e) {
						const error = e as APIError;
						const errorArray = error.fields ? error.fields : [{ msg: error.details }];
						for (const field of errorArray) {
							showAlert &&
								notify({
									type: 'error',
									title: error.error,
									description: field.msg,
								});
						}
						throw e;
					}
				},
				deleteParam: async (params: DeleteVersionVariableParams, showAlert) => {
					try {
						const version = await VersionService.deleteVersionVariable(params);
						set({ version });
						if (showAlert) {
							notify({
								type: 'success',
								title: translate('general.success'),
								description: translate('version.variable.deleted'),
							});
						}
						return version;
					} catch (e) {
						const error = e as APIError;
						notify({
							type: 'error',
							title: error.error,
							description: error.details,
						});
						throw e;
					}
				},
				deleteMultipleParams: async (params: DeleteMultipleVersionVariablesParams, showAlert) => {
					try {
						const version = await VersionService.deleteMultipleVersionVariables(params);
						set({ version });
						if (showAlert) {
							notify({
								type: 'success',
								title: translate('general.success'),
								description: translate('version.variable.deleted'),
							});
						}
						return version;
					} catch (e) {
						const error = e as APIError;
						notify({
							type: 'error',
							title: error.error,
							description: error.details,
						});
						throw e;
					}
				},
				updateParam: async (params: UpdateVersionVariableParams, showAlert) => {
					try {
						const version = await VersionService.updateVersionVariable(params);
						set({ version });
						if (showAlert) {
							notify({
								type: 'success',
								title: translate('general.success'),
								description: translate('version.variable.update_success'),
							});
						}
						return version;
					} catch (e) {
						const error = e as APIError;
						const errorArray = error.fields ? error.fields : [{ msg: error.details }];
						for (const field of errorArray) {
							notify({
								type: 'error',
								title: error.error,
								description: field.msg,
							});
						}
						throw e;
					}
				},
				setEditParamDrawerIsOpen: (isOpen: boolean) => {
					set({ editParamDrawerIsOpen: isOpen });
				},
				createCopyOfVersion: async (
					params: CreateCopyOfVersionParams,
					returnRedirect?: boolean,
				) => {
					try {
						const { version } = await VersionService.createCopyOfVersion(params);
						set((prev) => ({ versions: [...prev.versions, version] }));
						notify({
							type: 'success',
							title: translate('general.success'),
							description: translate('version.copied'),
						});
						if (returnRedirect) {
							history.navigate?.(
								`/organization/${version.orgId}/apps/${version.appId}/version/${version._id}`,
							);
						} else {
							return version;
						}
					} catch (e) {
						const error = e as APIError;
						notify({
							type: 'error',
							title: error.error,
							description: error.details,
						});
						throw e;
					}
				},
				setEditRateLimitDrawerIsOpen: (isOpen: boolean) => {
					set({ editRateLimitDrawerIsOpen: isOpen });
				},
				setRateLimit: (rateLimit) => {
					set({ rateLimit });
				},
				editRateLimit: async (params: EditRateLimitParams, showAlert) => {
					try {
						const version = await VersionService.editRateLimit(params);
						set({ version });
						if (showAlert) {
							notify({
								type: 'success',
								title: translate('general.success'),
								description: translate('version.rate_limiter_updated'),
							});
						}
						return version;
					} catch (e) {
						const error = e as APIError;
						notify({
							type: 'error',
							title: error.error,
							description: error.details,
						});
						throw e;
					}
				},
				deleteMultipleRateLimits: async (params: DeleteMultipleRateLimitsParams, showAlert) => {
					try {
						const version = await VersionService.deleteMultipleRateLimits(params);
						set({ version });
						if (showAlert) {
							notify({
								type: 'success',
								title: translate('general.success'),
								description: translate('version.limiter_deleted'),
							});
						}
						return version;
					} catch (e) {
						const error = e as APIError;
						notify({
							type: 'error',
							title: error.error,
							description: error.details,
						});
						throw e;
					}
				},
				getVersionDashboardPath: (path?: string, version?: Version) => {
					const _version = version ?? get().version;
					if (!_version) return '/organization';
					const { orgId, appId, _id } = _version;
					path = path ? `/${path.replace(/^\//, '')}` : '';
					return `/organization/${orgId}/apps/${appId}/version/${_id}` + path;
				},
				createAPIKey: async (params, showAlert) => {
					try {
						const version = await VersionService.createAPIKey(params);
						set({ version });
						if (showAlert) {
							notify({
								type: 'success',
								title: translate('general.success'),
								description: translate('version.api_key.success'),
							});
						}
						return version;
					} catch (e) {
						const error = e as APIError;
						const errorArray = error.fields ? error.fields : [{ msg: error.details }];
						for (const field of errorArray) {
							notify({
								type: 'error',
								title: error.error,
								description: field.msg,
							});
						}
						throw e;
					}
				},
				deleteAPIKey: async (params, showAlert) => {
					try {
						const version = await VersionService.deleteAPIKey(params);
						set({ version });
						if (showAlert) {
							notify({
								type: 'success',
								title: translate('general.success'),
								description: translate('version.api_key.deleted'),
							});
						}
						return version;
					} catch (e) {
						const error = e as APIError;
						notify({
							type: 'error',
							title: error.error,
							description: error.details,
						});
						throw e;
					}
				},
				editAPIKey: async (params, showAlert) => {
					try {
						const version = await VersionService.editAPIKey(params);
						set({ version });
						if (showAlert) {
							notify({
								type: 'success',
								title: translate('general.success'),
								description: translate('version.api_key.update_success'),
							});
						}
						return version;
					} catch (e) {
						const error = e as APIError;
						const errorArray = error.fields ? error.fields : [{ msg: error.details }];
						for (const field of errorArray) {
							notify({
								type: 'error',
								title: error.error,
								description: field.msg,
							});
						}
						throw e;
					}
				},
				deleteMultipleAPIKeys: async (params, showAlert) => {
					try {
						const version = await VersionService.deleteMultipleAPIKeys(params);
						set({ version });
						if (showAlert) {
							notify({
								type: 'success',
								title: translate('general.success'),
								description: translate('version.api_key.update_success'),
							});
						}
						return version;
					} catch (e) {
						const error = e as APIError;
						notify({
							type: 'error',
							title: error.error,
							description: error.details,
						});
						throw e;
					}
				},
				updateVersionRealtimeProperties: async (
					{ orgId, versionId, appId, ...data },
					showAlert,
				) => {
					try {
						const version = await VersionService.updateVersionRealtimeProperties({
							orgId,
							versionId,
							appId,
							enabled: get().version?.realtime?.enabled ?? false,
							rateLimits: get().version?.realtime?.rateLimits ?? [],
							apiKeyRequired: get().version?.realtime?.apiKeyRequired ?? false,
							sessionRequired: get().version?.realtime?.sessionRequired ?? false,
							...data,
						});
						set({ version });
						if (showAlert) {
							notify({
								type: 'success',
								title: translate('general.success'),
								description: translate('version.realtime.update_success'),
							});
						}
						return version;
					} catch (e) {
						const error = e as APIError;
						const errorArray = error.fields ? error.fields : [{ msg: error.details }];
						for (const field of errorArray) {
							notify({
								type: 'error',
								title: error.error,
								description: field.msg,
							});
						}
						throw e;
					}
				},
				getVersionLogBuckets: async (params) => {
					try {
						const logBuckets = await VersionService.getVersionLogBuckets(params);
						set({ logBuckets });
					} catch (error) {
						throw error as APIError;
					}
				},
				getVersionLogs: async (params) => {
					try {
						const logs = await VersionService.getVersionLogs(params);
						set({ lastFetchedLogCount: logs.length });
						if (params.initialFetch) {
							set({ logs: logs });
						} else {
							set({ logs: [...get().logs, ...logs] });
						}
					} catch (error) {
						throw error as APIError;
					}
				},
				openVersionLogDetails(log) {
					set({ log, showLogDetails: true });
				},
				closeVersionLogDetails() {
					set({ log: {} as VersionLog, showLogDetails: false });
				},
				deleteVersion: async (params, showAlert) => {
					try {
						await VersionService.deleteVersion(params);
						set((prev) => ({
							versions: prev.versions.filter((v) => v._id !== params.versionId),
						}));
					} catch (e) {
						if (showAlert) {
							const error = e as APIError;
							notify({
								type: 'error',
								title: error.error,
								description: error.details,
							});
						}
						throw e;
					}
				},
				getVersionNotifications: async (params) => {
					try {
						const notifications = await VersionService.getVersionNotifications(params);
						const user = useAuthStore.getState().user;

						const allowedNotifications = user?.notifications.map((ntf) => {
							if (ntf === 'org') return ntf;
							if (ntf === 'app') return `org.${ntf}`;
							if (ntf === 'version') return `org.app.${ntf}`;
							return `org.app.version.${ntf}`;
						});
						const filteredNotifications = notifications.filter(
							(ntf) => allowedNotifications?.includes(ntf.object),
						);
						if (params.initialFetch) {
							set({ notifications, notificationsPreview: filteredNotifications });
						} else {
							set((prev) => ({
								notifications: [...prev.notifications, ...notifications],
								notificationsPreview: [
									...prev.notificationsPreview,
									...filteredNotifications,
								].splice(0, 100),
								notificationLastFetchedCount: notifications.length,
							}));
						}
					} catch (error) {
						throw error as APIError;
					}
				},
				updateNotificationLastSeen: () => {
					set({ notificationLastSeen: new Date() });
				},
				searchDesignElements: async (params) => {
					try {
						const designElements = await VersionService.searchDesignElement(params);
						set({ designElements });
						return designElements;
					} catch (error) {
						throw error as APIError;
					}
				},
				resetDesignElements: () => {
					set({ designElements: [] });
				},
				saveUserDataModelInfo: async (params) => {
					try {
						const version = await VersionService.saveUserDataModelInfo(params);
						set({ version });
						if (params.onSuccess) params?.onSuccess();
					} catch (error) {
						if (params.onError) params?.onError(error as APIError);
						throw error as APIError;
					}
				},
				addMissingUserDataModelFields: async (params) => {
					try {
						await VersionService.addMissingUserDataModelFields(params);
						if (params.onSuccess) params?.onSuccess();
					} catch (error) {
						if (params.onError) params?.onError(error as APIError);
						throw error as APIError;
					}
				},
				saveRedirectURLs: async (params) => {
					try {
						const version = await VersionService.saveRedirectURLs(params);
						set({ version });
						if (params.onSuccess) params?.onSuccess();
					} catch (error) {
						if (params.onError) params?.onError(error as APIError);
						throw error as APIError;
					}
				},
				saveEmailAuthSettings: async (params) => {
					try {
						const version = await VersionService.saveEmailAuthSettings(params);
						set({ version });
						if (params.onSuccess) params?.onSuccess();
					} catch (error) {
						if (params.onError) params?.onError(error as APIError);
						throw error as APIError;
					}
				},
				savePhoneAuthSettings: async (params) => {
					try {
						const version = await VersionService.savePhoneAuthSettings(params);
						set({ version });
						if (params.onSuccess) params?.onSuccess();
					} catch (error) {
						if (params.onError) params?.onError(error as APIError);
						throw error as APIError;
					}
				},
				createOAuthConfig: async (params) => {
					try {
						const version = await VersionService.createOAuthConfig(params);
						set({ version });
						if (params.onSuccess) params?.onSuccess();
					} catch (error) {
						if (params.onError) params?.onError(error as APIError);
						throw error as APIError;
					}
				},
				updateOAuthConfig: async (params) => {
					try {
						await VersionService.updateOAuthConfig(params);
						if (params.onSuccess) params?.onSuccess();
					} catch (error) {
						if (params.onError) params?.onError(error as APIError);
						throw error as APIError;
					}
				},
				deleteOAuthConfig: async (params) => {
					try {
						await VersionService.deleteOAuthConfig(params);
						set((prev) => ({
							version: {
								...prev.version,
								authentication: {
									...prev.version.authentication,
									providers: prev.version.authentication.providers.filter(
										(p) => p._id !== params.providerId,
									),
								},
							},
						}));
						if (params.onSuccess) params?.onSuccess();
					} catch (error) {
						if (params.onError) params?.onError(error as APIError);
						throw error as APIError;
					}
				},
				setAuthMessageTemplate: async (params) => {
					try {
						const version = await VersionService.setAuthMessageTemplate(params);
						set({ version });
						if (params.onSuccess) params?.onSuccess();
					} catch (error) {
						if (params.onError) params?.onError(error as APIError);
						throw error as APIError;
					}
				},
			}),
			{
				name: 'version-storage',
			},
		),
	),
);

export default useVersionStore;
