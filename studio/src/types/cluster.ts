import { Application, BaseRequest, Environment, Organization, Version } from '.';

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
