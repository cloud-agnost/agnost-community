export interface Resource {
	orgId: string;
	iid: string;
	appId: string;
	versionId: string;
	name: string;
	type: string;
	instance: string;
	managed: boolean;
	deletable: boolean;
	allowedRoles: string[];
	config: {
		replicas: number;
		hpa: {
			avgCPU: number;
			avgMemory: number;
			minReplicas: number;
			maxReplicas: number;
		};
		cpu: {
			request: string;
			limit: string;
		};
		memory: {
			request: string;
			limit: string;
		};
	};
	access: {
		name: string;
		versionId: string;
		envId: string;
	};
	accessReadOnly: any[];
	status: string;
	createdBy: string;
	_id: string;
	createdAt: string;
	updatedAt: string;
	__v: number;
}
export interface ResLog {
	orgId: string;
	appId: string;
	versionId: string;
	resourceId: string;
	action: string;
	status: string;
	createdBy: string;
	_id: string;
	logs: [];
	createdAt: string;
	updatedAt: string;
	__v: number;
}
