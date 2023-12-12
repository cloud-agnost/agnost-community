import { create } from '@/helpers/store';
import {
	APIError,
	EnvLog,
	Environment,
	GetEnvironmentLogsParams,
	GetEnvironmentResourcesParams,
	Resource,
	SelectedEnvLog,
	ToggleAutoDeployParams,
	UpdateAPIServerConfParams,
	UpdateEnvironmentTelemetryLogsParams,
	VersionParams,
	getAppVersionEnvironmentParams,
} from '@/types';
import EnvironmentService from 'services/EnvironmentService.ts';
import { devtools } from 'zustand/middleware';

interface EnvironmentStore {
	environments: Environment[];
	environment: Environment;
	resources: Resource[];
	envLogs: EnvLog[];
	selectedLog: SelectedEnvLog;
	isLogDetailsOpen: boolean;
}

type Actions = {
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
	updateApiServerConf: (params: UpdateAPIServerConfParams) => Promise<void>;
	reset: () => void;
};

const initialState: EnvironmentStore = {
	environments: [],
	environment: {} as Environment,
	resources: [],
	envLogs: [],
	selectedLog: {} as SelectedEnvLog,
	isLogDetailsOpen: false,
};

const useEnvironmentStore = create<EnvironmentStore & Actions>()(
	devtools(
		(set) => ({
			...initialState,
			getAppVersionEnvironment: async (params: getAppVersionEnvironmentParams) => {
				const environment = await EnvironmentService.getAppVersionEnvironment(params);
				set({ environment });
				return environment;
			},
			getEnvironmentLogs: async (params: GetEnvironmentLogsParams) => {
				const logs = await EnvironmentService.getEnvironmentLogs(params);
				set({ envLogs: logs });
			},
			toggleAutoDeploy: async (params: ToggleAutoDeployParams) => {
				try {
					const environment = await EnvironmentService.toggleAutoDeploy(params);
					set({ environment });
					return environment;
				} catch (e) {
					throw e as APIError;
				}
			},
			suspendEnvironment: async (params: VersionParams) => {
				try {
					const environment = await EnvironmentService.suspendEnvironment(params);
					set({ environment });
				} catch (e) {
					throw e as APIError;
				}
			},
			activateEnvironment: async (params: VersionParams) => {
				try {
					const environment = await EnvironmentService.activateEnvironment(params);
					set({ environment });
				} catch (e) {
					throw e as APIError;
				}
			},
			redeployAppVersionToEnvironment: async (params: VersionParams) => {
				try {
					const environment = await EnvironmentService.redeployAppVersionToEnvironment(params);
					set({ environment });
				} catch (error) {
					throw error as APIError;
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
			updateApiServerConf: async (params: UpdateAPIServerConfParams) => {
				try {
					const apiServer = await EnvironmentService.updateAPIServerConf(params);
					set((prev) => ({
						resources: prev.resources.map((resource) => {
							if (resource._id === apiServer._id) {
								return { ...resource, ...apiServer };
							}
							return resource;
						}),
					}));
					if (params.onSuccess) params.onSuccess();
				} catch (e) {
					if (params.onError) params.onError(e as APIError);
					throw e;
				}
			},
			reset: () => set(initialState),
		}),

		{
			name: 'environment',
		},
	),
);

export default useEnvironmentStore;
