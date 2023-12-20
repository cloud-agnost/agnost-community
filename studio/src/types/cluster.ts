import { Application } from './application';
import { Environment } from './environment';
import { Organization } from './organization';
import { BaseRequest } from './type';
import { Version } from './version';

export type ClusterComponentsType =
	| 'Node.js'
	| 'React'
	| 'MongoDB'
	| 'RabbitMQ'
	| 'Redis'
	| 'MinIO';
export type ClusterK8sType = 'Deployment' | 'StatefulSet';

export interface ClusterComponent {
	hpaName: string;
	deploymentName: string;
	title: string;
	hasHpa: boolean;
	editable: boolean;
	type: ClusterComponentsType;
	k8sType: ClusterK8sType;
	description: string;
	info: {
		version: string;
		configuredReplicas: number;
		runningReplicas: number;
		minReplicas: number;
		maxReplicas: number;
	};
}

export interface UpdateClusterComponentParams extends BaseRequest {
	deploymentName: string;
	hpaName: string;
	replicas: number;
	minReplicas: number;
	maxReplicas: number;
}

export interface TransferClusterOwnershipParams extends BaseRequest {
	userId: string;
}
export interface ClusterSetupResponse {
	org: Organization;
	app: Application;
	version: Version;
	env: Environment;
}

interface ModuleVersions {
	'engine-core': string;
	'engine-monitor': string;
	'engine-realtime': string;
	'engine-scheduler': string;
	'engine-worker': string;
	'platform-core': string;
	'platform-sync': string;
	'platform-worker': string;
	studio: string;
}

interface ReleaseInfo {
	release: string;
	modules: ModuleVersions;
}

interface ClusterReleaseHistory {
	release: string;
	timestamp: string;
	_id: string;
}

interface ClusterResourceStatus {
	name: string;
	status: string;
	_id: string;
	lastUpdateAt: string;
}

interface Cluster {
	_id: string;
	clusterAccesssToken: string;
	masterToken: string;
	accessToken: string;
	release: string;
	releaseHistory: ClusterReleaseHistory[];
	createdBy: string;
	domains: string[];
	enforceSSLAccess: boolean;
	ips: string[];
	clusterResourceStatus: ClusterResourceStatus[];
	createdAt: string;
	updatedAt: string;
}

export interface ClusterReleaseInfo {
	current: {
		release: string;
		modules: ModuleVersions;
	};
	latest: ReleaseInfo;
	cluster: Cluster;
}
