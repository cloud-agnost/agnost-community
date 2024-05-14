import { z } from 'zod';
import { NameSchema } from './schema';

interface Variable {
	name: string;
	value: string;
}

interface SourceConfig {
	repoType: 'github' | 'gitlab' | 'bitbucket';
	repo: string;
	branch?: string;
	rootDirectory?: string;
	dockerFile?: string;
}

interface RegistryConfig {
	registryId?: string;
	image?: string;
}

// Specific Configurations
interface DeploymentConfig {
	desiredReplicas?: number;
	minReplicas?: number;
	maxReplicas?: number;
	cpuMetric?: {
		enabled?: boolean;
		metricType?: 'AverageUtilization' | 'AverageValueMillicores' | 'AverageValueCores';
		metricValue?: number;
	};
	memoryMetric?: {
		enabled?: boolean;
		metricType?: 'AverageValueMillicores' | 'AverageValueCores';
		metricValue?: number;
	};
	strategy?: 'RollingUpdate' | 'Recreate';
	rollingUpdate?: {
		maxSurge?: number | string;
		maxSurgeType?: 'number' | 'percentage';
		maxUnavailable?: number | string;
		maxUnavailableType?: 'number' | 'percentage';
	};
	revisionHistoryLimit?: number;
}

interface StatefulSetConfig {
	desiredReplicas?: number;
	strategy?: 'RollingUpdate' | 'Recreate';
	rollingUpdate?: {
		maxUnavailable?: number | string;
		maxUnavailableType?: 'number' | 'percentage';
		partition?: number;
	};
	revisionHistoryLimit?: number;
	podManagementPolicy?: 'OrderedReady' | 'Parallel';
	persistentVolumeClaimRetentionPolicy?: {
		whenDeleted?: 'Retain' | 'Delete';
		whenScaled?: 'Retain' | 'Delete';
	};
}

interface CronJobConfig {
	schedule?: string;
	timeZone?: string;
	concurrencyPolicy?: 'Allow' | 'Forbid' | 'Replace';
	suspend?: boolean;
	successfulJobsHistoryLimit?: number;
	failedJobsHistoryLimit?: number;
}

interface KnativeConfig {
	scalingMetric?: 'concurrency' | 'rps' | 'cpu' | 'memory';
	scalingMetricTarget?: string;
	maxScale?: number;
	minScale?: number;
	scaleDownDelay?: string;
	scaleToZeroPodRetentionPeriod?: string;
	revisionHistoryLimit?: number;
}
interface IngressConfig {
	enabled?: boolean;
	url?: string;
}

interface CustomDomainConfig {
	enabled?: boolean;
	domainAdded?: boolean;
	domain?: string;
}

interface TcpProxyConfig {
	enabled?: boolean;
	publicPort?: number;
}

interface Networking {
	containerPort?: number;
	ingress?: IngressConfig;
	customDomain?: CustomDomainConfig;
	tcpProxy?: TcpProxyConfig;
}

// Probe Interfaces
interface ProbeCheckMechanism {
	type: 'exec' | 'httpGet' | 'tcpSocket';
}

interface Probe {
	enabled?: boolean;
	checkMechanism: ProbeCheckMechanism;
	execCommand?: string;
	httpPath?: string;
	httpPort?: number;
	tcpPort?: number;
	initialDelaySeconds?: number;
	periodSeconds?: number;
	timeoutSeconds?: number;
	failureThreshold?: number;
}

interface Probes {
	startup?: Probe;
	readiness?: Probe;
	liveness?: Probe;
}

interface PodConfig {
	restartPolicy?: 'Always' | 'OnFailure' | 'Never';
	cpuRequest?: number;
	cpuRequestType?: 'millicores' | 'cores';
	cpuLimit?: number;
	cpuLimitType?: 'millicores' | 'cores';
	memoryRequest?: number;
	memoryRequestType?: 'mebibyte' | 'gibibyte';
	memoryLimit?: number;
	memoryLimitType?: 'mebibyte' | 'gibibyte';
}

export type ContainerType = 'deployment' | 'stateful set' | 'cron job' | 'knative service';

export interface Container {
	orgId: string;
	projectId: string;
	envId: string;
	iid: string;
	name: string;
	type: ContainerType;
	variables?: Variable[];
	sourceOrRegistry: 'source' | 'registry';
	source?: SourceConfig;
	registry?: RegistryConfig;
	deploymentConfig?: DeploymentConfig;
	statefulSetConfig?: StatefulSetConfig;
	cronJobConfig?: CronJobConfig;
	knativeConfig?: KnativeConfig;
	networking?: Networking;
	probes?: Probes;
	podConfig: PodConfig;
	createdBy: string;
	updatedBy: string;
	createdAt: string;
	updatedAt: string;
}

export const DeploymentConfigSchema = z.object({
	desiredReplicas: z.number().optional(),
	minReplicas: z.number().optional(),
	maxReplicas: z.number().optional(),
	cpuMetric: z
		.object({
			enabled: z.boolean().optional(),
			metricType: z
				.enum(['AverageUtilization', 'AverageValueMillicores', 'AverageValueCores'])
				.optional(),
			metricValue: z.number().optional(),
		})
		.optional(),
	memoryMetric: z
		.object({
			enabled: z.boolean().optional(),
			metricType: z.enum(['AverageValueMillicores', 'AverageValueCores']).optional(),
			metricValue: z.number().optional(),
		})
		.optional(),
	strategy: z.enum(['RollingUpdate', 'Recreate']).optional(),
	rollingUpdate: z
		.object({
			maxSurge: z.union([z.number(), z.string()]).optional(),
			maxSurgeType: z.enum(['number', 'percentage']).optional(),
			maxUnavailable: z.union([z.number(), z.string()]).optional(),
			maxUnavailableType: z.enum(['number', 'percentage']).optional(),
		})
		.optional(),
	revisionHistoryLimit: z.number().optional(),
});

export const StatefulSetConfigSchema = z.object({
	desiredReplicas: z.number().optional(),
	strategy: z.enum(['RollingUpdate', 'Recreate']).optional(),
	rollingUpdate: z
		.object({
			maxUnavailable: z.union([z.number(), z.string()]).optional(),
			maxUnavailableType: z.enum(['number', 'percentage']).optional(),
			partition: z.number().optional(),
		})
		.optional(),
	revisionHistoryLimit: z.number().optional(),
	podManagementPolicy: z.enum(['OrderedReady', 'Parallel']).optional(),
	persistentVolumeClaimRetentionPolicy: z
		.object({
			whenDeleted: z.enum(['Retain', 'Delete']).optional(),
			whenScaled: z.enum(['Retain', 'Delete']).optional(),
		})
		.optional(),
});

export const CronJobConfigSchema = z.object({
	schedule: z.string().optional(),
	timeZone: z.string().optional(),
	concurrencyPolicy: z.enum(['Allow', 'Forbid', 'Replace']).optional(),
	suspend: z.boolean().optional(),
	successfulJobsHistoryLimit: z.number().optional(),
	failedJobsHistoryLimit: z.number().optional(),
});

export const KnativeConfigSchema = z.object({
	scalingMetric: z.enum(['concurrency', 'rps', 'cpu', 'memory']).optional(),
	scalingMetricTarget: z.string().optional(),
	maxScale: z.number().optional(),
	minScale: z.number().optional(),
	scaleDownDelay: z.string().optional(),
	scaleToZeroPodRetentionPeriod: z.string().optional(),
	revisionHistoryLimit: z.number().optional(),
});

export const NetworkingSchema = z.object({
	containerPort: z.number().optional(),
	ingress: z.object({
		enabled: z.boolean().optional(),
		url: z.string().optional(),
	}),
	customDomain: z.object({
		enabled: z.boolean().optional(),
		domainAdded: z.boolean().optional(),
		domain: z.string().optional(),
	}),
	tcpProxy: z.object({
		enabled: z.boolean().optional(),
		publicPort: z.number().optional(),
	}),
});

export const ProbesSchema = z.object({
	startup: z.object({
		enabled: z.boolean().optional(),
		checkMechanism: z.object({
			type: z.enum(['exec', 'httpGet', 'tcpSocket']),
		}),
		execCommand: z.string().optional(),
		httpPath: z.string().optional(),
		httpPort: z.number().optional(),
		tcpPort: z.number().optional(),
		initialDelaySeconds: z.number().optional(),
		periodSeconds: z.number().optional(),
		timeoutSeconds: z.number().optional(),
		failureThreshold: z.number().optional(),
	}),
	readiness: z.object({
		enabled: z.boolean().optional(),
		checkMechanism: z.object({
			type: z.enum(['exec', 'httpGet', 'tcpSocket']),
		}),
		execCommand: z.string().optional(),
		httpPath: z.string().optional(),
		httpPort: z.number().optional(),
		tcpPort: z.number().optional(),
		initialDelaySeconds: z.number().optional(),
		periodSeconds: z.number().optional(),
		timeoutSeconds: z.number().optional(),
		failureThreshold: z.number().optional(),
	}),
	liveness: z.object({
		enabled: z.boolean().optional(),
		checkMechanism: z.object({
			type: z.enum(['exec', 'httpGet', 'tcpSocket']),
		}),
		execCommand: z.string().optional(),
		httpPath: z.string().optional(),
		httpPort: z.number().optional(),
		tcpPort: z.number().optional(),
		initialDelaySeconds: z.number().optional(),
		periodSeconds: z.number().optional(),
		timeoutSeconds: z.number().optional(),
		failureThreshold: z.number().optional(),
	}),
});

export const PodConfigSchema = z.object({
	restartPolicy: z.enum(['Always', 'OnFailure', 'Never']).optional(),
	cpuRequest: z.number().optional().default(100),
	cpuRequestType: z.enum(['millicores', 'cores']).optional().default('millicores'),
	cpuLimit: z.number().optional().default(1),
	cpuLimitType: z.enum(['millicores', 'cores']).optional().default('cores'),
	memoryRequest: z.number().optional().default(128),
	memoryRequestType: z.enum(['mebibyte', 'gibibyte']).optional().default('mebibyte'),
	memoryLimit: z.number().optional().default(1),
	memoryLimitType: z.enum(['mebibyte', 'gibibyte']).optional().default('gibibyte'),
});

export const ContainerSchema = z.object({
	orgId: z.string(),
	projectId: z.string(),
	envId: z.string(),
	name: NameSchema,
	type: z.enum(['deployment', 'stateful set', 'cron job', 'knative service']),
	variables: z.array(z.object({ name: z.string(), value: z.string() })),
	sourceOrRegistry: z.enum(['source', 'registry']),
	source: z.object({
		repoType: z.enum(['github', 'gitlab', 'bitbucket']),
		repo: z.string().url(),
		branch: z.string().optional(),
		rootDirectory: z.string().optional(),
		dockerFile: z.string().optional(),
	}),
	registry: z.object({
		registryId: z.string().optional(),
		image: z.string().url().optional(),
	}),
	deploymentConfig: DeploymentConfigSchema.optional(),
	statefulSetConfig: StatefulSetConfigSchema.optional(),
	cronJobConfig: CronJobConfigSchema.optional(),
	knativeConfig: KnativeConfigSchema.optional(),
	networking: NetworkingSchema.optional(),
	probes: ProbesSchema.optional(),
	podConfig: PodConfigSchema.optional(),
});

export type CreateContainerParams = z.infer<typeof ContainerSchema>;
export const ContainerUpdateSchema = ContainerSchema.partial();
export type UpdateContainerParams = z.infer<typeof ContainerUpdateSchema>;
