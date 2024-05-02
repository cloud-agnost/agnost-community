import mongoose from "mongoose";
import { body, param, query } from "express-validator";
import { projectRoles } from "../config/constants.js";

/**
 * An project is your workspace that packages all project environments and associated containers.
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
			envId: {
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
				enum: ["deployment", "stateful_set", "cronjob", "knative_service"],
			},
			source: {
				repoType: {
					type: String,
					enum: ["github", "gitlab", "bitbucket"],
				},
				repo: {
					type: String,
				},
				branch: {
					type: String,
				},
				// For monorepos the directory path to the container
				rootDirectory: {
					type: String,
					default: "/",
				},
			},
			networking: {
				// Flag specifies whether the container is accessible from the public internet or not
				public: {
					type: Boolean,
					default: false,
				},
				// Flag specifies whether the container is accessible from the internal network or not
				internal: {
					type: Boolean,
					default: false,
				},
				// The port number the container listens on
				containerPort: {
					type: Number,
				},
				// The port number the container is exposed on the host, populated only if the container is public
				publicPort: {
					type: Number,
				},
				// Whether an ingress is created for the container or not
				ingress: {
					type: Boolean,
					default: false,
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
				cpuAverageUtization: {
					type: Number,
				},
				cpuAverageValue: {
					type: Number,
				},
				cpuAverageValueType: {
					type: String,
					enum: ["millicores", "cores"],
				},
				memoryAverageUtization: {
					type: Number,
				},
				memoryAverageValue: {
					type: Number,
				},
				memoryAverageValueType: {
					type: String,
					enum: ["mebibyte", "gibibyte"],
				},
				strategy: {
					type: String,
					enum: ["RollingUpdate", "Recreate"],
				},
				rollingUpdate: {
					maxSurge: {
						type: Number,
						default: 1,
					},
					maxSurgeType: {
						type: String,
						enum: ["number", "percentage"],
					},
					maxUnavailable: {
						type: Number,
						default: 0,
					},
					maxUnavailableType: {
						type: String,
						enum: ["number", "percentage"],
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
						default: "Retain",
					},
				},
			},
			cronJobConfig: {
				schedule: {
					type: String,
				},
				timeZone: {
					type: String,
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
					default: 10,
				},
				failedJobsHistoryLimit: {
					type: Number,
					default: 10,
				},
			},
			knativeConfig: {
				scalingMetric: {
					type: String,
					enum: ["concurrency", "rps", "cpu", "memory"],
				},
				scalingMetricTarget: {
					// "Concurrency" specifies a percentage value, e.g. "70"
					// "Requests per second" specifies an integer value,  e.g. "150"
					// "CPU" specifies the integer value in millicore, e.g. "100m"
					// "Memory" specifies the integer value in Mi, e.g. "75"
					type: String,
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
					type: String,
				},
				scaleToZeroPodRetentionPeriod: {
					type: String,
				},
				revisionHistoryLimit: {
					type: Number,
					default: 10,
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

export const applyRules = (type) => {
	switch (type) {
		case "create":
		case "update":
			return [
				body("name")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isLength({
						min: config.get("general.minNameLength"),
						max: config.get("general.maxTextLength"),
					})
					.withMessage(
						t(
							"Name must be minimum %s and maximum %s characters long",
							config.get("general.minNameLength"),
							config.get("general.maxTextLength")
						)
					)
					.bail()
					.custom((value) => {
						let regex = /^[A-Za-z0-9 _.-]+$/;
						if (!regex.test(value)) {
							throw new AgnostError(
								t(
									"Project names can include only numbers, letters, spaces, dash, dot and underscore characters"
								)
							);
						}

						let regex2 = /^[ _-].*$/;
						if (regex2.test(value)) {
							throw new AgnostError(
								t(
									"Project names cannot start with a dash or underscore character"
								)
							);
						}

						//Indicates the success of this synchronous custom validator
						return true;
					}),
				body("envName")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isLength({
						min: config.get("general.minNameLength"),
						max: config.get("general.maxTextLength"),
					})
					.withMessage(
						t(
							"Name must be minimum %s and maximum %s characters long",
							config.get("general.minNameLength"),
							config.get("general.maxTextLength")
						)
					)
					.bail()
					.custom((value) => {
						let regex = /^[A-Za-z0-9 _.-]+$/;
						if (!regex.test(value)) {
							throw new AgnostError(
								t(
									"Project environment names can include only numbers, letters, spaces, dash, dot and underscore characters"
								)
							);
						}

						let regex2 = /^[ _-].*$/;
						if (regex2.test(value)) {
							throw new AgnostError(
								t(
									"Project environment names cannot start with a dash or underscore character"
								)
							);
						}

						//Indicates the success of this synchronous custom validator
						return true;
					}),
			];
		case "update-member-role":
			return [
				param("userId")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom(async (value, { req }) => {
						if (!helper.isValidId(value))
							throw new AgnostError(t("Not a valid user identifier"));

						return true;
					}),
				body("role")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.isIn(projectRoles)
					.withMessage(t("Unsupported team member role")),
			];
		case "remove-member":
			return [
				param("userId")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom(async (value, { req }) => {
						if (!helper.isValidId(value))
							throw new AgnostError(t("Not a valid user identifier"));

						return true;
					}),
			];
		case "remove-members":
			return [
				body("userIds")
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.isArray()
					.withMessage(t("User identifiers need to be an array of strings")),
				body("userIds.*")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom(async (value, { req }) => {
						if (!helper.isValidId(value))
							throw new AgnostError(t("Not a valid user identifier"));

						return true;
					}),
			];
		case "transfer":
			return [
				param("userId")
					.trim()
					.notEmpty()
					.withMessage(t("Required field, cannot be left empty"))
					.bail()
					.custom(async (value, { req }) => {
						if (!helper.isValidId(value))
							throw new AgnostError(t("Not a valid user identifier"));

						return true;
					})
					.bail()
					.custom((value, { req }) => {
						// Check whether email is unique or not
						let projectMember = req.project.team.find(
							(entry) => entry.userId.toString() === value
						);

						if (!projectMember) {
							throw new AgnostError(
								t(
									"The user identified with id '%s' is not a member of project '%s'. Project ownership can only be transferred to an existing project member with 'Admin' role.",
									value,
									req.project.name
								)
							);
						}

						if (projectMember.role !== "Admin") {
							throw new AgnostError(
								t(
									"Project ownership can only be transferred to an existing project member with 'Admin' role."
								)
							);
						}

						return true;
					}),
			];
		case "upload-picture":
			return [
				query("width")
					.trim()
					.optional({ nullable: true })
					.isInt({ min: 1 })
					.withMessage(t("Width needs to be a positive integer"))
					.toInt(),
				query("height")
					.trim()
					.optional({ nullable: true })
					.isInt({ min: 1 })
					.withMessage(t("Height needs to be a positive integer"))
					.toInt(),
			];
		default:
			return [];
	}
};
