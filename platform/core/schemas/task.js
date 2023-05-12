import mongoose from "mongoose";
import { schedulTypes, intervalTypes } from "../config/constants.js";

/**
 * Message cron job and its handler definition
 */
export const TaskModel = mongoose.model(
	"task",
	new mongoose.Schema(
		{
			orgId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "organization",
				index: true,
			},
			appId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "app",
				index: true,
			},
			versionId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "version",
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
			logExecution: {
				type: Boolean,
				default: true,
			},
			code: {
				type: String,
				index: true,
				default: "",
			},
			schedule: {
				type: {
					type: String,
					enum: schedulTypes,
				},
				every: {
					intervalType: {
						type: String,
						enum: intervalTypes,
					},
					duration: {
						type: Number,
					},
				},
				day: {
					hour: {
						type: Number,
					},
					minute: {
						type: Number,
					},
					timezone: {
						type: String,
					},
				},
				week: {
					weekdays: {
						type: [Number], // Array of weekday numbers staring with 1 on Monday to 7 Sunday
					},
					hour: {
						type: Number,
					},
					minute: {
						type: Number,
					},
					timezone: {
						type: String,
					},
				},
				month: {
					monthday: {
						// Last day of the month is "L" first day of the month 1
						type: mongoose.Schema.Types.Mixed,
					},
					hour: {
						type: Number,
					},
					minute: {
						type: Number,
					},
					timezone: {
						type: String,
					},
				},
				cronExpression: {
					type: String,
				},
				humanReadable: {
					type: String,
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
		case "update":
		case "create":
			return [];
		default:
			return [];
	}
};
