import {
	APIError,
	EnvLog,
	Environment,
	EnvironmentStatus,
	GetEnvironmentLogsParams,
	GetEnvironmentResourcesParams,
	Resource,
	SelectedEnvLog,
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
	environment: Environment;
	resources: Resource[];
	envStatus: EnvironmentStatus;
	envLogs: EnvLog[];
	selectedLog: SelectedEnvLog;
	isLogDetailsOpen: boolean;
	openLogDetails: (log: SelectedEnvLog) => void;
	closeLogDetails: () => void;
	getAppVersionEnvironment: (params: getAppVersionEnvironmentParams) => Promise<Environment>;
	getEnvironmentLogs: (params: GetEnvironmentLogsParams) => Promise<void>;
	toggleAutoDeploy: (params: ToggleAutoDeployParams) => Promise<Environment>;
	suspendEnvironment: (params: VersionParams) => Promise<void>;
	activateEnvironment: (params: VersionParams) => Promise<void>;
	redeployAppVersionToEnvironment: (params: VersionParams) => Promise<void>;
	updateEnvironmentTelemetryLogs: (params: UpdateEnvironmentTelemetryLogsParams) => Promise<any>;
	getEnvironmentResources: (params: GetEnvironmentResourcesParams) => Promise<Resource[]>;
	setEnvStatus: (env: Environment) => EnvironmentStatus;
}

const useEnvironmentStore = create<EnvironmentStore>()(
	devtools(
		persist(
			(set, get) => ({
				environments: [],
				environment: {} as Environment,
				resources: [],
				envStatus: '' as EnvironmentStatus,
				envLogs: [],
				selectedLog: {} as SelectedEnvLog,
				isLogDetailsOpen: false,
				getAppVersionEnvironment: async (params: getAppVersionEnvironmentParams) => {
					const environment = await EnvironmentService.getAppVersionEnvironment(params);
					set({ environment, envStatus: get().setEnvStatus(environment) });
					return environment;
				},
				getEnvironmentLogs: async (params: GetEnvironmentLogsParams) => {
					const logs = await EnvironmentService.getEnvironmentLogs(params);
					set({ envLogs: logs });
				},
				toggleAutoDeploy: async (params: ToggleAutoDeployParams) => {
					try {
						const environment = await EnvironmentService.toggleAutoDeploy(params);
						set({ environment, envStatus: get().setEnvStatus(environment) });
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
						set({ environment, envStatus: get().setEnvStatus(environment) });
						notify({
							type: 'success',
							title: translate('general.success'),
							description: translate('version.suspended_successfully'),
						});
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
						set({ environment, envStatus: get().setEnvStatus(environment) });
						notify({
							type: 'success',
							title: translate('general.success'),
							description: translate('version.reactivated_successfully'),
						});
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
						set({ environment, envStatus: get().setEnvStatus(environment) });
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
				openLogDetails: (log: SelectedEnvLog) => {
					set({ selectedLog: log, isLogDetailsOpen: true });
				},
				closeLogDetails: () => {
					set({ selectedLog: {} as SelectedEnvLog, isLogDetailsOpen: false });
				},
				setEnvStatus: (env: Environment) => {
					const statuses = [
						{ check: () => env.suspended, value: 'Suspended' },
						{
							check: () =>
								Object.values(env).some(
									(status) => status === 'Deploying' || status === 'Redeploying',
								),
							value: 'Deploying',
						},
						{
							check: () =>
								Object.values(env).some((status) => status === 'error') ||
								get().resources.some((resource) => resource.status === 'Error'),
							value: 'Error',
						},
						{
							check: () =>
								get()
									.resources.map((resource) => resource.status)
									.includes('Idle'),
							value: 'Idle',
						},
					];

					for (const status of statuses) {
						if (status.check()) {
							return status.value as EnvironmentStatus;
						}
					}

					return 'OK' as EnvironmentStatus;
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
