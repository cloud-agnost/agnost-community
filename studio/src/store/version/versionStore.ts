import {
	AddNPMPackageParams,
	AddVersionVariableParams,
	APIError,
	CreateRateLimitParams,
	DeleteMultipleNPMPackagesParams,
	DeleteMultipleVersionVariablesParams,
	DeleteNPMPackageParams,
	DeleteRateLimitParams,
	DeleteVersionVariableParams,
	GetVersionByIdParams,
	GetVersionRequest,
	Param,
	RateLimit,
	SearchNPMPackages,
	SearchNPMPackagesParams,
	UpdateVersionVariableParams,
	Version,
	VersionParamsWithoutEnvId,
	VersionProperties,
} from '@/types';
import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import { VersionService } from '@/services';
import { notify, translate } from '@/utils';

interface VersionStore {
	loading: boolean;
	error: APIError | null;
	version: Version | null;
	versions: Version[];
	param: Param | null;
	versionPage: number;
	editParamDrawerIsOpen: boolean;
	getVersionById: (req: GetVersionByIdParams) => Promise<Version>;
	getAllVersionsVisibleToUser: (req: GetVersionRequest) => Promise<void>;
	setVersionPage: (page: number) => void;
	updateVersionProperties: (
		params: VersionParamsWithoutEnvId & Partial<VersionProperties>,
	) => Promise<Version>;
	createRateLimit: (params: CreateRateLimitParams) => Promise<RateLimit>;
	deleteRateLimit: (params: DeleteRateLimitParams) => Promise<Version>;
	orderLimits: (limits: string[]) => void;
	searchNPMPackages: (params: SearchNPMPackagesParams) => Promise<SearchNPMPackages[]>;
	addNPMPackage: (params: AddNPMPackageParams) => Promise<Version>;
	deleteNPMPackage: (params: DeleteNPMPackageParams) => Promise<Version>;
	deleteMultipleNPMPackages: (params: DeleteMultipleNPMPackagesParams) => Promise<Version>;
	setParam: (param: Param | null) => void;
	addParam: (params: AddVersionVariableParams) => Promise<Version>;
	deleteParam: (params: DeleteVersionVariableParams) => Promise<Version>;
	deleteMultipleParams: (params: DeleteMultipleVersionVariablesParams) => Promise<Version>;
	updateParam: (params: UpdateVersionVariableParams) => Promise<Version>;
	setEditParamDrawerIsOpen: (isOpen: boolean) => void;
}

const useVersionStore = create<VersionStore>()(
	devtools(
		(set, get) => ({
			loading: false,
			error: null,
			version: null,
			versions: [],
			versionPage: 0,
			param: null,
			editParamDrawerIsOpen: false,
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
			},
			createRateLimit: async (params: CreateRateLimitParams) => {
				const version = await VersionService.createRateLimit(params);
				set({ version });
				return version.limits.at(-1);
			},
			deleteRateLimit: async (params: DeleteRateLimitParams) => {
				const version = await VersionService.deleteRateLimit(params);
				set({ version });
				return version;
			},
			orderLimits: (limits: string[]) => {
				set((prev) => {
					if (!prev.version) return prev;
					prev.version.defaultEndpointLimits = limits;
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
			addNPMPackage: async (params: AddNPMPackageParams) => {
				try {
					const version = await VersionService.addNPMPackage(params);
					set({ version });
					notify({
						type: 'success',
						title: translate('general.success'),
						description: translate('version.npm.success'),
					});
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
			deleteNPMPackage: async (params: DeleteNPMPackageParams) => {
				try {
					const version = await VersionService.deleteNPMPackage(params);
					set({ version });
					notify({
						type: 'success',
						title: translate('general.success'),
						description: translate('version.npm.deleted'),
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
			deleteMultipleNPMPackages: async (params: DeleteMultipleNPMPackagesParams) => {
				try {
					const version = await VersionService.deleteMultipleNPMPackages(params);
					set({ version });
					notify({
						type: 'success',
						title: translate('general.success'),
						description: translate('version.npm.deleted'),
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
			setParam: (param: Param | null) => {
				set({ param });
			},
			addParam: async (params: AddVersionVariableParams) => {
				try {
					const version = await VersionService.addVersionVariable(params);
					set({ version });
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
						notify({
							type: 'error',
							title: error.error,
							description: field.msg,
						});
					}
					throw e;
				}
			},
			deleteParam: async (params: DeleteVersionVariableParams) => {
				try {
					const version = await VersionService.deleteVersionVariable(params);
					set({ version });
					notify({
						type: 'success',
						title: translate('general.success'),
						description: translate('version.variable.deleted'),
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
			deleteMultipleParams: async (params: DeleteMultipleVersionVariablesParams) => {
				try {
					const version = await VersionService.deleteMultipleVersionVariables(params);
					set({ version });
					notify({
						type: 'success',
						title: translate('general.success'),
						description: translate('version.variable.deleted'),
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
			updateParam: async (params: UpdateVersionVariableParams) => {
				try {
					const version = await VersionService.updateVersionVariable(params);
					set({ version });
					notify({
						type: 'success',
						title: translate('general.success'),
						description: translate('version.variable.update_success'),
					});
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
		}),
		{
			name: 'version-storage',
		},
	),
);

export default useVersionStore;
