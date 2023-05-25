import BaseController from "./base.js";
import { EndpointModel } from "../schemas/endpoint.js";
import { deleteKey } from "../init/cache.js";

class EndpointController extends BaseController {
	constructor() {
		super(EndpointModel);
	}

	/**
	 * Remove matching rate limiters from endpoints when the provided rate limiters are deleted from the version
	 * @param  {Object} session The database session object
	 * @param  {Object} version The version object
	 * @param  {Object} version The array of deleted rate limiter objects
	 * @param  {Object} user The user who is performing the rate limiter deletion
	 */
	async removeRateLimiters(session, version, limits, user) {
		if (limits.length === 0) return;

		// First find matching endpoints
		let endpoints = await this.getManyByQuery(
			{
				versionId: version._id,
				rateLimits: { $in: limits.map((entry) => entry.iid) },
			},
			{ projection: "-code" }
		);

		// If no matching endpoints then return
		if (endpoints.length === 0) return;

		await EndpointModel.updateMany(
			{
				versionId: version._id,
				rateLimits: { $in: limits.map((entry) => entry.iid) },
			},
			{
				$pull: { rateLimits: { $in: limits.map((entry) => entry.iid) } },
				$set: {
					updatedBy: user._id,
				},
			},
			{ session }
		);

		// Clear cache for endpoints
		endpoints.forEach((element) => {
			deleteKey(element._id.toString());
		});
	}

	/**
	 * Remove matching middlewares from endpoints when the provided middlewares are deleted from the version
	 * @param  {Object} session The database session object
	 * @param  {Object} version The version object
	 * @param  {Object} version The array of deleted middleware objects
	 * @param  {Object} user The user who is performing the middleware deletion
	 */
	async removeMiddlewares(session, version, middlewares, user) {
		if (middlewares.length === 0) return;

		// First find matching endpoints
		let endpoints = await this.getManyByQuery(
			{
				versionId: version._id,
				middlewares: { $in: middlewares.map((entry) => entry.iid) },
			},
			{ projection: "-code" }
		);

		// If no matching endpoints then return
		if (endpoints.length === 0) return;

		await EndpointModel.updateMany(
			{
				versionId: version._id,
				middlewares: { $in: middlewares.map((entry) => entry.iid) },
			},
			{
				$pull: { middlewares: { $in: middlewares.map((entry) => entry.iid) } },
				$set: {
					updatedBy: user._id,
				},
			},
			{ session }
		);

		// Clear cache for endpoints
		endpoints.forEach((element) => {
			deleteKey(element._id.toString());
		});
	}
}

export default new EndpointController();
