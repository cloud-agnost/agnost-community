import { create } from '@/helpers';
import { VersionService } from '@/services';
import {
	APIError,
	APIKey,
	AddNPMPackageParams,
	AddVersionVariableParams,
	AuthMessageTemplateParams,
	CreateAPIKeyParams,
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
	DeleteVersionVariableParams,
	EditRateLimitParams,
	Param,
	RateLimit,
	SaveEmailAuthParams,
	SaveEmailPhoneParams,
	SaveRedirectURLsParams,
	SaveUserDataModelInfoParams,
	SearchNPMPackages,
	SearchNPMPackagesParams,
	UpdateAPIKeyParams,
	UpdateOAuthConfigParams,
	UpdateVersionRealtimePropertiesParams,
	UpdateVersionVariableParams,
	Version,
} from '@/types';
import { notify, translate } from '@/utils';
import { devtools } from 'zustand/middleware';
import useUtilsStore from './utilsStore';
import useVersionStore from './versionStore';

interface SettingsStore {
	param: Param;
	rateLimit: RateLimit;
	editParamDrawerIsOpen: boolean;
	editRateLimitDrawerIsOpen: boolean;
	editAPIKeyDrawerIsOpen: boolean;
	selectedAPIKey: APIKey;
}

type Actions = {
	searchNPMPackages: (params: SearchNPMPackagesParams) => Promise<SearchNPMPackages[]>;
	addNPMPackage: (params: AddNPMPackageParams) => Promise<Version>;
	deleteNPMPackage: (params: DeleteNPMPackageParams) => Promise<Version>;
	deleteMultipleNPMPackages: (params: DeleteMultipleNPMPackagesParams) => Promise<Version>;
	setParam: (param: Param) => void;
	addParam: (params: AddVersionVariableParams) => Promise<Version>;
	deleteParam: (params: DeleteVersionVariableParams) => Promise<Version>;
	deleteMultipleParams: (params: DeleteMultipleVersionVariablesParams) => Promise<Version>;
	updateParam: (params: UpdateVersionVariableParams) => Promise<Version>;
	setEditParamDrawerIsOpen: (isOpen: boolean) => void;
	setEditRateLimitDrawerIsOpen: (isOpen: boolean) => void;
	setRateLimit: (rateLimit: RateLimit) => void;
	editRateLimit: (params: EditRateLimitParams) => Promise<Version>;
	deleteMultipleRateLimits: (params: DeleteMultipleRateLimitsParams) => Promise<Version>;
	createAPIKey: (params: CreateAPIKeyParams) => Promise<Version>;
	editAPIKey: (params: UpdateAPIKeyParams) => Promise<Version>;
	deleteAPIKey: (params: DeleteAPIKeyParams) => Promise<Version>;
	deleteMultipleAPIKeys: (params: DeleteMultipleAPIKeys) => Promise<Version>;
	updateVersionRealtimeProperties: (
		params: UpdateVersionRealtimePropertiesParams,
	) => Promise<Version>;
	saveUserDataModelInfo: (params: SaveUserDataModelInfoParams) => Promise<void>;
	addMissingUserDataModelFields: (params: SaveUserDataModelInfoParams) => Promise<void>;
	saveRedirectURLs: (params: SaveRedirectURLsParams) => Promise<void>;
	saveEmailAuthSettings: (params: SaveEmailAuthParams) => Promise<void>;
	savePhoneAuthSettings: (params: SaveEmailPhoneParams) => Promise<void>;
	createOAuthConfig: (params: CreateOAuthConfigParams) => Promise<void>;
	updateOAuthConfig: (params: UpdateOAuthConfigParams) => Promise<void>;
	deleteOAuthConfig: (params: DeleteOAuthConfigParams) => Promise<void>;
	setAuthMessageTemplate: (params: AuthMessageTemplateParams) => Promise<void>;
	setSelectedAPIKey: (key: APIKey) => void;
	setEditAPIKeyDrawerIsOpen: (isOpen: boolean) => void;
	createRateLimit: (params: CreateRateLimitParams) => Promise<RateLimit>;
	deleteRateLimit: (params: DeleteRateLimitParams) => Promise<Version>;
	orderEndpointRateLimits: (limits: string[]) => void;
	orderRealtimeRateLimits: (limits: string[]) => void;
	reset: () => void;
};

const initialState: SettingsStore = {
	param: {} as Param,
	rateLimit: {} as RateLimit,
	editParamDrawerIsOpen: false,
	editRateLimitDrawerIsOpen: false,
	editAPIKeyDrawerIsOpen: false,
	selectedAPIKey: {} as APIKey,
};

const useSettingsStore = create<SettingsStore & Actions>()(
	devtools((set) => ({
		...initialState,
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
				useUtilsStore.getState().fetchTypes({
					[params.name]: params.version,
				});
				useVersionStore.setState((prev) => ({
					version,
					packages: {
						...prev.packages,
						[params.name]: params.version,
					},
				}));

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

				useVersionStore.setState({
					version,
				});

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
				useVersionStore.setState({ version });
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
		setParam: (param: Param) => {
			set({ param });
		},
		addParam: async (params: AddVersionVariableParams) => {
			try {
				const version = await VersionService.addVersionVariable(params);
				useVersionStore.setState({ version });

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
				useVersionStore.setState({ version });

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
				useVersionStore.setState({ version });

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
				useVersionStore.setState({ version });

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
		setEditRateLimitDrawerIsOpen: (isOpen: boolean) => {
			set({ editRateLimitDrawerIsOpen: isOpen });
		},
		setRateLimit: (rateLimit) => {
			set({ rateLimit });
		},
		editRateLimit: async (params: EditRateLimitParams) => {
			try {
				const version = await VersionService.editRateLimit(params);
				useVersionStore.setState({ version });

				notify({
					type: 'success',
					title: translate('general.success'),
					description: translate('version.rate_limiter_updated'),
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
		deleteMultipleRateLimits: async (params: DeleteMultipleRateLimitsParams) => {
			try {
				const version = await VersionService.deleteMultipleRateLimits(params);
				useVersionStore.setState({ version });

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
		createAPIKey: async (params) => {
			try {
				const version = await VersionService.createAPIKey(params);
				useVersionStore.setState({ version });

				notify({
					type: 'success',
					title: translate('general.success'),
					description: translate('version.api_key.success'),
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
		deleteAPIKey: async (params) => {
			try {
				const version = await VersionService.deleteAPIKey(params);
				useVersionStore.setState({ version });

				notify({
					type: 'success',
					title: translate('general.success'),
					description: translate('version.api_key.deleted'),
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
		editAPIKey: async (params) => {
			try {
				const version = await VersionService.editAPIKey(params);
				useVersionStore.setState({ version });

				notify({
					type: 'success',
					title: translate('general.success'),
					description: translate('version.api_key.update_success'),
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
		deleteMultipleAPIKeys: async (params) => {
			try {
				const version = await VersionService.deleteMultipleAPIKeys(params);
				useVersionStore.setState({ version });

				notify({
					type: 'success',
					title: translate('general.success'),
					description: translate('version.api_key.update_success'),
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
		updateVersionRealtimeProperties: async (params) => {
			try {
				const version = useVersionStore.getState().version;
				const updatedVersion = await VersionService.updateVersionRealtimeProperties(params);
				useVersionStore.setState({ version: updatedVersion });
				return version;
			} catch (error) {
				throw error as APIError;
			}
		},
		saveUserDataModelInfo: async (params) => {
			try {
				const version = await VersionService.saveUserDataModelInfo(params);
				useVersionStore.setState({ version });
			} catch (error) {
				throw error as APIError;
			}
		},
		addMissingUserDataModelFields: async (params) => {
			try {
				await VersionService.addMissingUserDataModelFields(params);
			} catch (error) {
				throw error as APIError;
			}
		},
		saveRedirectURLs: async (params) => {
			try {
				const version = await VersionService.saveRedirectURLs(params);
				useVersionStore.setState({ version });
			} catch (error) {
				throw error as APIError;
			}
		},
		saveEmailAuthSettings: async (params) => {
			try {
				const version = await VersionService.saveEmailAuthSettings(params);
				useVersionStore.setState({ version });
			} catch (error) {
				throw error as APIError;
			}
		},
		savePhoneAuthSettings: async (params) => {
			try {
				const version = await VersionService.savePhoneAuthSettings(params);
				useVersionStore.setState({ version });
			} catch (error) {
				throw error as APIError;
			}
		},
		createOAuthConfig: async (params) => {
			try {
				const version = await VersionService.createOAuthConfig(params);
				useVersionStore.setState({ version });
			} catch (error) {
				throw error as APIError;
			}
		},
		updateOAuthConfig: async (params) => {
			try {
				await VersionService.updateOAuthConfig(params);
			} catch (error) {
				throw error as APIError;
			}
		},
		deleteOAuthConfig: async (params) => {
			try {
				await VersionService.deleteOAuthConfig(params);
				useVersionStore.setState((prev) => ({
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
			} catch (error) {
				throw error as APIError;
			}
		},
		setAuthMessageTemplate: async (params) => {
			try {
				const version = await VersionService.setAuthMessageTemplate(params);
				useVersionStore.setState({ version });
			} catch (error) {
				throw error as APIError;
			}
		},
		setSelectedAPIKey: (key: APIKey) => {
			set({ selectedAPIKey: key });
		},
		setEditAPIKeyDrawerIsOpen: (isOpen: boolean) => {
			set({ editAPIKeyDrawerIsOpen: isOpen });
		},
		createRateLimit: async (params: CreateRateLimitParams) => {
			const version = await VersionService.createRateLimit(params);
			useVersionStore.setState({ version });
			return version.limits.at(-1);
		},
		deleteRateLimit: async (params: DeleteRateLimitParams) => {
			try {
				const version = await VersionService.deleteRateLimit(params);
				useVersionStore.setState({ version });
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
			useVersionStore.setState((prev) => {
				if (!prev.version) return prev;
				prev.version.defaultEndpointLimits = limits;
				return {
					version: prev.version,
				};
			});
		},
		orderRealtimeRateLimits: (limits: string[]) => {
			useVersionStore.setState((prev) => ({
				version: {
					...prev.version,
					realtime: {
						...prev.version.realtime,
						defaultLimits: limits,
					},
				},
			}));
		},
		reset: () => set(initialState),
	})),
);

export default useSettingsStore;
