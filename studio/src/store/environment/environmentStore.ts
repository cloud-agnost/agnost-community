import {
	APIError,
	Environment,
	GetEnvironmentLogsParams,
	GetEnvironmentResourcesParams,
	Resource,
	ToggleAutoDeployParams,
	UpdateEnvironmentTelemetryLogsParams,
	VersionParams,
	getAppVersionEnvironmentParams,
} from '@/types';
import { notify, translate } from '@/utils';
import EnvironmentService from 'services/EnvironmentService.ts';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface EnvironmentStore {
	environments: Environment[];
	environment: Environment | null;
	resources: Resource[];
	getAppVersionEnvironment: (params: getAppVersionEnvironmentParams) => Promise<Environment>;
	getEnvironmentLogs: (params: GetEnvironmentLogsParams) => Promise<any>;
	toggleAutoDeploy: (params: ToggleAutoDeployParams) => Promise<Environment>;
	suspendEnvironment: (params: VersionParams) => Promise<any>;
	activateEnvironment: (params: VersionParams) => Promise<any>;
	redeployAppVersionToEnvironment: (params: VersionParams) => Promise<any>;
	updateEnvironmentTelemetryLogs: (params: UpdateEnvironmentTelemetryLogsParams) => Promise<any>;
	getEnvironmentResources: (params: GetEnvironmentResourcesParams) => Promise<Resource[]>;
}

const useEnvironmentStore = create<EnvironmentStore>()(
	devtools(
		persist(
			(set) => ({
				environments: [],
				environment: null,
				resources: [],
				getAppVersionEnvironment: async (params: getAppVersionEnvironmentParams) => {
					const environment = await EnvironmentService.getAppVersionEnvironment(params);
					set({ environment });
					return environment;
				},
				getEnvironmentLogs: (params: GetEnvironmentLogsParams) => {
					return EnvironmentService.getEnvironmentLogs(params);
				},
				toggleAutoDeploy: async (params: ToggleAutoDeployParams) => {
					try {
						const environment = await EnvironmentService.toggleAutoDeploy(params);
						set({ environment });
						return environment;
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
				suspendEnvironment: async (params: VersionParams) => {
					try {
						const environment = await EnvironmentService.suspendEnvironment(params);
						set({ environment });
						notify({
							type: 'success',
							title: translate('general.success'),
							description: translate('version.suspended_successfully'),
						});
						return environment;
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
				activateEnvironment: async (params: VersionParams) => {
					try {
						const environment = await EnvironmentService.activateEnvironment(params);
						set({ environment });
						notify({
							type: 'success',
							title: translate('general.success'),
							description: translate('version.reactivated_successfully'),
						});
						return environment;
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
				redeployAppVersionToEnvironment: async (params: VersionParams) => {
					try {
						const environment = await EnvironmentService.redeployAppVersionToEnvironment(params);
						set({ environment });
						return environment;
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
				updateEnvironmentTelemetryLogs: (params: UpdateEnvironmentTelemetryLogsParams) => {
					return EnvironmentService.updateEnvironmentTelemetryLogs(params);
				},
				getEnvironmentResources: async (params: GetEnvironmentResourcesParams) => {
					const resources = await EnvironmentService.getEnvironmentResources(params);
					set({ resources });
					return resources;
				},
			}),
			{
				name: 'environment-storage',
			},
		),
		{
			name: 'environment',
		},
	),
);

export default useEnvironmentStore;
