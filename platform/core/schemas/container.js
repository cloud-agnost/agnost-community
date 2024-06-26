import mongoose from "mongoose";
import { body } from "express-validator";
import deploymentRules from "./containers/deployment.js";
import statefulSetRules from "./containers/statefulSet.js";
import cronJobRules from "./containers/cronJob.js";
import knativeServiceRules from "./containers/knativeService.js";

const containerTypes = [
	"deployment",
	"stateful set",
	"cron job",
	"knative service",
];

/**
 * A container is an entitiy created in the Kubernetes cluster this can be a deployment, stateful set, cron job or a knative service
 */
export const ContainerModel = mongoose.model(
	"container",
	new mongoose.Schema(
		{
			orgId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "organization",
				index: true,
			},
			projectId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "project",
				index: true,
			},
			environmentId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "project_environment",
				index: true,
			},
			iid: {
				// Internal identifier
				type: String,
				required: true,
				index: true,
				immutable: true,
			},
			name: {
				type: String,
				required: true,
				index: true,
			},
			type: {
				type: String,
				required: true,
				index: true,
				immutable: true,
				enum: containerTypes,
			},
			status: {
				type: mongoose.Schema.Types.Mixed,
			},
			pipelineStatus: {
				type: String,
				default: "Connected",
			},
			variables: [
				{
					name: {
						type: String,
					},
					value: {
						type: String,
					},
				},
			],
			repoOrRegistry: {
				type: String,
				required: true,
				index: true,
				immutable: true,
				enum: ["repo", "registry"],
			},
			repo: {
				type: {
					type: String,
					enum: ["github", "gitlab", "bitbucket"],
				},
				// Whether the repo is connected or not
				connected: {
					type: Boolean,
				},
				// Full name of the repo
				name: {
					type: String,
				},
				url: {
					type: String,
				},
				branch: {
					type: String,
				},
				// For monorepos the directory path to the container
				path: {
					type: String,
					default: "/",
				},
				// The name of the docker file in the repository
				dockerfile: {
					type: String,
					default: "Dockerfile",
				},
				gitProviderId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "git_provider",
					index: true,
				},
				webHookId: {
					type: String,
				},
			},
			registry: {
				// Internal iid or the image registry
				registryiid: {
					type: String,
				},
				image: {
					type: String,
				},
			},
			networking: {
				// The port number the container listens on
				containerPort: {
					type: Number,
				},
				// Flag specifies whether the container is accessible from the public internet or not through a TCP proxy
				ingress: {
					enabled: {
						type: Boolean,
						default: false,
					},
				},
				customDomain: {
					enabled: {
						type: Boolean,
						default: false,
					},
					domain: {
						type: String,
					},
				},
				tcpProxy: {
					enabled: {
						type: Boolean,
						default: false,
					},
					// The port number the container is exposed on the host, populated only if the container is public
					publicPort: {
						type: Number,
					},
				},
			},
			podConfig: {
				restartPolicy: {
					type: String,
					enum: ["Always", "OnFailure", "Never"],
					default: "Always",
				},
				cpuRequest: {
					type: Number,
					default: 100,
				},
				cpuRequestType: {
					type: String,
					enum: ["millicores", "cores"],
					default: "millicores",
				},
				memoryRequest: {
					type: Number,
					default: 128,
				},
				memoryRequestType: {
					type: String,
					enum: ["mebibyte", "gibibyte"],
					default: "mebibyte",
				},
				cpuLimit: {
					type: Number,
					default: 1,
					default: "cores",
				},
				cpuLimitType: {
					type: String,
					enum: ["millicores", "cores"],
				},
				memoryLimit: {
					type: Number,
					default: 1024,
				},
				memoryLimitType: {
					type: String,
					enum: ["mebibyte", "gibibyte"],
					default: "mebibyte",
				},
			},
			storageConfig: {
				enabled: {
					type: Boolean,
					default: false,
				},
				mountPath: {
					type: String,
				},
				size: {
					type: Number,
					default: 1,
				},
				sizeType: {
					type: String,
					enum: ["mebibyte", "gibibyte"],
					default: "gibibyte",
				},
				accessModes: {
					type: [String],
					enum: ["ReadWriteOnce", "ReadOnlyMany", "ReadWriteMany"],
					default: ["ReadWriteOnce"],
				},
			},
			deploymentConfig: {
				desiredReplicas: {
					type: Number,
					default: 1,
				},
				minReplicas: {
					type: Number,
					default: 1,
				},
				maxReplicas: {
					type: Number,
					default: 1,
				},
				cpuMetric: {
					enabled: {
						type: Boolean,
						default: false,
					},
					metricType: {
						type: String,
						enum: [
							"AverageUtilization",
							"AverageValueMillicores",
							"AverageValueCores",
						],
					},
					metricValue: {
						type: Number,
					},
				},
				memoryMetric: {
					enabled: {
						type: Boolean,
						default: false,
					},
					metricType: {
						type: String,
						enum: ["AverageValueMebibyte", "AverageValueGibibyte"],
					},
					metricValue: {
						type: Number,
					},
				},
				strategy: {
					type: String,
					enum: ["RollingUpdate", "Recreate"],
					default: "RollingUpdate",
				},
				rollingUpdate: {
					maxSurge: {
						type: Number,
						default: 30,
					},
					maxSurgeType: {
						type: String,
						enum: ["number", "percentage"],
						default: "percentage",
					},
					maxUnavailable: {
						type: Number,
						default: 0,
					},
					maxUnavailableType: {
						type: String,
						enum: ["number", "percentage"],
						default: "number",
					},
				},
				revisionHistoryLimit: {
					type: Number,
					default: 10,
				},
			},
			statefulSetConfig: {
				desiredReplicas: {
					type: Number,
					default: 1,
				},
				strategy: {
					type: String,
					enum: ["RollingUpdate", "Recreate"],
				},
				rollingUpdate: {
					maxUnavailable: {
						type: Number,
						default: 1,
					},
					maxUnavailableType: {
						type: String,
						enum: ["number", "percentage"],
					},
					partition: {
						type: Number,
						default: 0,
					},
				},
				revisionHistoryLimit: {
					type: Number,
					default: 10,
				},
				podManagementPolicy: {
					type: String,
					enum: ["OrderedReady", "Parallel"],
					default: "OrderedReady",
				},
				persistentVolumeClaimRetentionPolicy: {
					whenDeleted: {
						type: String,
						enum: ["Retain", "Delete"],
						default: "Retain",
					},
					whenScaled: {
						type: String,
						enum: ["Retain", "Delete"],
						default: "Delete",
					},
				},
			},
			cronJobConfig: {
				schedule: {
					type: String,
				},
				timeZone: {
					type: String,
					defaykt: "UTC",
				},
				concurrencyPolicy: {
					type: String,
					enum: ["Allow", "Forbid", "Replace"],
					default: "Allow",
				},
				suspend: {
					type: Boolean,
					default: false,
				},
				successfulJobsHistoryLimit: {
					type: Number,
					default: 3,
				},
				failedJobsHistoryLimit: {
					type: Number,
					default: 3,
				},
			},
			knativeConfig: {
				concurrency: {
					type: Number,
					default: 100,
				},
				scalingMetric: {
					type: String,
					enum: ["concurrency", "rps", "cpu", "memory"],
					default: "concurrency",
				},
				scalingMetricTarget: {
					// "Concurrency" specifies a percentage value, e.g. "70"
					// "Requests per second" specifies an integer value,  e.g. "150"
					// "CPU" specifies the integer value in millicore, e.g. "100m"
					// "Memory" specifies the integer value in Mi, e.g. "75"
					type: Number,
					default: 70,
				},
				initialScale: {
					type: Number,
					default: 1,
				},
				maxScale: {
					type: Number,
					default: 1,
				},
				minScale: {
					type: Number,
					default: 0,
				},
				scaleDownDelay: {
					type: Number,
					default: 300,
				},
				scaleToZeroPodRetentionPeriod: {
					type: Number,
					default: 600,
				},
				revisionHistoryLimit: {
					type: Number,
					default: 10,
				},
			},
			probes: {
				startup: {
					enabled: {
						type: Boolean,
						default: false,
					},
					checkMechanism: {
						type: String,
						enum: ["exec", "httpGet", "tcpSocket"],
						defau: ["httpGet"],
					},
					execCommand: {
						type: String,
					},
					httpPath: {
						type: String,
					},
					httpPort: {
						type: Number,
					},
					tcpPort: {
						type: Number,
					},
					initialDelaySeconds: {
						type: Number,
						default: 30,
					},
					periodSeconds: {
						type: Number,
						default: 30,
					},
					timeoutSeconds: {
						type: Number,
						default: 60,
					},
					failureThreshold: {
						type: Number,
						default: 3,
					},
				},
				readiness: {
					enabled: {
						type: Boolean,
						default: false,
					},
					checkMechanism: {
						type: String,
						enum: ["exec", "httpGet", "tcpSocket"],
						defau: ["httpGet"],
					},
					execCommand: {
						type: String,
					},
					httpPath: {
						type: String,
					},
					httpPort: {
						type: Number,
					},
					tcpPort: {
						type: Number,
					},
					initialDelaySeconds: {
						type: Number,
						default: 0,
					},
					periodSeconds: {
						type: Number,
						default: 10,
					},
					timeoutSeconds: {
						type: Number,
						default: 1,
					},
					failureThreshold: {
						type: Number,
						default: 3,
					},
				},
				liveness: {
					enabled: {
						type: Boolean,
						default: false,
					},
					checkMechanism: {
						type: String,
						enum: ["exec", "httpGet", "tcpSocket"],
						defau: ["httpGet"],
					},
					execCommand: {
						type: String,
					},
					httpPath: {
						type: String,
					},
					httpPort: {
						type: Number,
					},
					tcpPort: {
						type: Number,
					},
					initialDelaySeconds: {
						type: Number,
						default: 30,
					},
					periodSeconds: {
						type: Number,
						default: 30,
					},
					timeoutSeconds: {
						type: Number,
						default: 5,
					},
					failureThreshold: {
						type: Number,
						default: 3,
					},
				},
			},
			createdBy: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "user",
			},
			updatedBy: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "user",
			},
			__v: {
				type: Number,
				select: false,
			},
		},
		{ timestamps: true }
	)
);

// Function to execute an array of middleware
const executeMiddlewareArray = (middlewares, req, res, next) => {
	const execute = (index) => {
		if (index < middlewares.length) {
			middlewares[index](req, res, () => execute(index + 1));
		} else {
			next();
		}
	};
	execute(0);
};

export const applyRules = (actionType) => {
	return function (req, res, next) {
		if (req.body.type === "deployment")
			executeMiddlewareArray(deploymentRules(actionType), req, res, next);
		else if (req.body.type === "stateful set")
			executeMiddlewareArray(statefulSetRules(actionType), req, res, next);
		else if (req.body.type === "cron job")
			executeMiddlewareArray(cronJobRules(actionType), req, res, next);
		else if (req.body.type === "knative service")
			executeMiddlewareArray(knativeServiceRules(actionType), req, res, next);
		else
			executeMiddlewareArray(
				[
					body("type")
						.trim()
						.notEmpty()
						.withMessage(t("Required field, cannot be left empty"))
						.bail()
						.isIn(containerTypes)
						.withMessage(t("Unsupported resource type")),
				],
				req,
				res,
				next
			);
	};
};
