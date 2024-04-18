import mongoose from "mongoose";

/**
 * Message cron job and its handler definition
 */
export const VersionBackupModel = mongoose.model(
	"version_backup",
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
			versionContents: {
				type: mongoose.Schema.Types.Mixed,
			},
			createdBy: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "user",
			},
			createdAt: { type: Date, default: Date.now, immutable: true },
			__v: {
				type: Number,
				select: false,
			},
		},
		{ timestamps: false }
	)
);
