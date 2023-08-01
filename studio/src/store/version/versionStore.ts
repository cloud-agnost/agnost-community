import { VersionService } from '@/services';
import {
	AddNPMPackageParams,
	AddVersionVariableParams,
	APIError,
	APIKey,
	CreateAPIKeyParams,
	CreateCopyOfVersionParams,
	CreateRateLimitParams,
	DeleteAPIKeyParams,
	DeleteMultipleAPIKeys,
	DeleteMultipleNPMPackagesParams,
	DeleteMultipleRateLimitsParams,
	DeleteMultipleVersionVariablesParams,
	DeleteNPMPackageParams,
	DeleteRateLimitParams,
	DeleteVersionVariableParams,
	EditRateLimitParams,
	GetVersionByIdParams,
	GetVersionRequest,
	Param,
	RateLimit,
	SearchNPMPackages,
	SearchNPMPackagesParams,
	UpdateAPIKeyParams,
	UpdateVersionVariableParams,
	Version,
	VersionParamsWithoutEnvId,
	VersionProperties,
	VersionRealtimeProperties,
} from '@/types';
import { history, joinChannel, notify, translate } from '@/utils';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface VersionStore {
	loading: boolean;
	error: APIError | null;
	version: Version | null;
	versions: Version[];
	param: Param | null;
	rateLimit: RateLimit | null;
	versionPage: number;
	editParamDrawerIsOpen: boolean;
	editRateLimitDrawerIsOpen: boolean;
	createCopyVersionDrawerIsOpen: boolean;
	editAPIKeyDrawerIsOpen: boolean;
	selectedAPIKey: APIKey | null;
	setSelectedAPIKey: (key: APIKey | null) => void;
	setEditAPIKeyDrawerIsOpen: (isOpen: boolean) => void;
	getVersionById: (req: GetVersionByIdParams) => Promise<Version>;
	getAllVersionsVisibleToUser: (req: GetVersionRequest) => Promise<void>;
	setVersionPage: (page: number) => void;
	updateVersionProperties: (
		params: VersionParamsWithoutEnvId & Partial<VersionProperties>,
	) => Promise<Version>;
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
	setParam: (param: Param | null) => void;
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
	setRateLimit: (rateLimit: RateLimit | null) => void;
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
		version: VersionParamsWithoutEnvId & Partial<VersionRealtimeProperties>,
		showAlert?: boolean,
	) => Promise<Version>;
}

const useVersionStore = create<VersionStore>()(
	devtools(
		(set, get) => ({
			loading: false,
			editAPIKeyDrawerIsOpen: false,
			selectedAPIKey: null,
			error: null,
			version: null,
			versions: [],
			versionPage: 0,
			param: null,
			rateLimit: null,
			editParamDrawerIsOpen: false,
			editRateLimitDrawerIsOpen: false,
			createCopyVersionDrawerIsOpen: false,
			setSelectedAPIKey: (key: APIKey | null) => {
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
					versions.forEach((version: Version) => {
						joinChannel(version._id);
					});
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
			}: VersionParamsWithoutEnvId & Partial<VersionProperties>) => {
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
			setParam: (param: Param | null) => {
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
			createCopyOfVersion: async (params: CreateCopyOfVersionParams, returnRedirect?: boolean) => {
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
			updateVersionRealtimeProperties: async ({ orgId, versionId, appId, ...data }, showAlert) => {
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
		}),
		{
			name: 'version-storage',
		},
	),
);

export default useVersionStore;
