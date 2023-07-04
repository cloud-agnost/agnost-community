import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
	Environment,
	getAppVersionEnvironmentParams,
	GetEnvironmentLogsParams,
	ToggleAutoDeployParams,
	UpdateEnvironmentTelemetryLogsParams,
	VersionParams,
} from '@/types';
import EnvironmentService from 'services/EnvironmentService.ts';

interface EnvironmentStore {
	environments: Environment[];
	environment: Environment | null;
	getAppVersionEnvironment: (params: getAppVersionEnvironmentParams) => Promise<Environment>;
	getEnvironmentLogs: (params: GetEnvironmentLogsParams) => Promise<any>;
	toggleAutoDeploy: (params: ToggleAutoDeployParams) => Promise<any>;
	suspendEnvironment: (params: VersionParams) => Promise<any>;
	activateEnvironment: (params: VersionParams) => Promise<any>;
	redeployAppVersionToEnvironment: (params: VersionParams) => Promise<any>;
	updateEnvironmentTelemetryLogs: (params: UpdateEnvironmentTelemetryLogsParams) => Promise<any>;
}

const useEnvironmentStore = create<EnvironmentStore>()(
	devtools(
		persist(
			(set) => ({
				environments: [],
				environment: null,
				getAppVersionEnvironment: async (params: getAppVersionEnvironmentParams) => {
					const environment = await EnvironmentService.getAppVersionEnvironment(params);
					set({ environment });
					return environment;
				},
				getEnvironmentLogs: (params: GetEnvironmentLogsParams) => {
					return EnvironmentService.getEnvironmentLogs(params);
				},
				toggleAutoDeploy: (params: ToggleAutoDeployParams) => {
					return EnvironmentService.toggleAutoDeploy(params);
				},
				suspendEnvironment: (params: VersionParams) => {
					return EnvironmentService.suspendEnvironment(params);
				},
				activateEnvironment: (params: VersionParams) => {
					return EnvironmentService.suspendEnvironment(params);
				},
				redeployAppVersionToEnvironment: (params: VersionParams) => {
					return EnvironmentService.redeployAppVersionToEnvironment(params);
				},
				updateEnvironmentTelemetryLogs: (params: UpdateEnvironmentTelemetryLogsParams) => {
					return EnvironmentService.updateEnvironmentTelemetryLogs(params);
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
