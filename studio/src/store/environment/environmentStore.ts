import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
	getAppVersionEnvironmentParams,
	GetEnvironmentLogsParams,
	ToggleAutoDeployParams,
	UpdateEnvironmentTelemetryLogsParams,
	VersionParams,
} from '@/types';
import EnvironmentService from 'services/EnvironmentService.ts';

interface EnvironmentStore {
	getAppVersionEnvironment: (params: getAppVersionEnvironmentParams) => Promise<any>;
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
			(_) => ({
				getAppVersionEnvironment: (params: getAppVersionEnvironmentParams) => {
					return EnvironmentService.getAppVersionEnvironment(params);
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
