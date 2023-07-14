import { VersionParams } from '@/types/version.ts';
import { PaginationOptions } from '@/types/database.ts';

export interface Environment {
	orgId: string;
	appId: string;
	versionId: string;
	iid: string;
	name: string;
	autoDeploy: boolean;
	suspended: boolean;
	mappings: Mapping[];
	deploymentDtm: string;
	dbStatus: string;
	serverStatus: ServerStatus[];
	schedulerStatus: string;
	createdBy: string;
	updatedBy: string;
	_id: string;
	createdAt: string;
	updatedAt: string;
	__v: number;
}

interface Mapping {
	design: Design;
	resource: EnvironmentResource;
	_id: string;
	createdAt: string;
	updatedAt: string;
}

interface Design {
	iid: string;
	type: string;
	name: string;
}

interface EnvironmentResource {
	iid: string;
	name: string;
	type: string;
	instance: string;
}

interface ServerStatus {
	pod: string;
	status: string;
	_id: string;
}
export interface EnvLog {
	orgId: string;
	appId: string;
	versionId: string;
	envId: string;
	action: string;
	dbStatus: string;
	serverStatus: [
		{
			pod: string;
			status: string;
			_id: string;
		},
	];
	schedulerStatus: string;
	dbLogs: [];
	serverLogs: [];
	schedulerLogs: [];
	createdBy: string;
	_id: string;
	createdAt: string;
	updatedAt: string;
	__v: number;
}

export type UpdateEnvironmentTelemetryLogsParams = VersionParams & {
	logId: string;
};

export type ToggleAutoDeployParams = VersionParams & {
	autoDeploy: boolean;
};

export type GetEnvironmentLogsParams = VersionParams & {
	actor?: string;
	status?: string;
} & PaginationOptions;

export type getAppVersionEnvironmentParams = Omit<VersionParams, 'envId'>;
export type GetEnvironmentResourcesParams = VersionParams;
