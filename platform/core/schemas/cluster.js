import mongoose from "mongoose";

/**
 * Account is the top level model which will hold the list of organizations, under organization there will be users and apps etc.
 * Whenever a new users signs up a personal account with 'Admin' role will be creted. When a user joins to an organization, a new account entry
 * will be added for the user with the specified role type
 */
export const ClusterModel = mongoose.model(
	"cluster",
	new mongoose.Schema(
		{
			clusterAccesssToken: {
				type: String,
				required: true,
				index: true,
			},
			masterToken: {
				type: String,
				required: true,
				index: true,
			},
			accessToken: {
				type: String,
				required: true,
				index: true,
			},
			smtp: {
				host: {
					type: String,
				},
				port: {
					type: Number,
				},
				useTLS: {
					type: Boolean,
				},
				user: {
					type: String,
				},
				// Password is encrypted when stored in database
				password: {
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
