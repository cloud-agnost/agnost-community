import mongoose from "mongoose";

/**
 * An project environment is where containers are deployed and run. It can be a development, staging, or production environment.
 */
export const ProjectEnvModel = mongoose.model(
	"project_environment",
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
			// Whether other team members with the right access can see the project environment or not
			// Team members with 'Admin' role can always view even the private versions
			private: {
				type: Boolean,
				default: false,
			},
			// Whether other team members can edit the environment or not
			readOnly: {
				type: Boolean,
				default: true,
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
