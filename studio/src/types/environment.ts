import { VersionParams } from '@/types/version.ts';
import { BaseGetRequest, Log } from '.';

export type EnvironmentStatus =
	| 'OK'
	| 'Error'
	| 'Deploying'
	| 'Redeploying'
	| 'Deleting'
	| 'Suspended'
	| 'Idle';
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
	dbStatus: EnvironmentStatus;
	serverStatus: EnvironmentStatus;
	schedulerStatus: EnvironmentStatus;
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

export interface EnvLogDetail {
	startedAt: string;
	status: EnvironmentStatus;
	message: string;
	_id: string;
}
export interface EnvLog {
	orgId: string;
	appId: string;
	versionId: string;
	envId: string;
	action: string;
	dbStatus: EnvironmentStatus;
	serverStatus: EnvironmentStatus;
	schedulerStatus: EnvironmentStatus;
	dbLogs: EnvLogDetail[];
	serverLogs: EnvLogDetail[];
	schedulerLogs: EnvLogDetail[];
	createdBy: string;
	_id: string;
	createdAt: string;
	updatedAt: string;
	__v: number;
}

export interface SelectedEnvLog {
	dbLogs: Log[];
	serverLogs: Log[];
	schedulerLogs: Log[];
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
} & BaseGetRequest;

export type getAppVersionEnvironmentParams = Omit<VersionParams, 'envId'>;
export type GetEnvironmentResourcesParams = VersionParams;
