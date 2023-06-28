import BaseController from "./base.js";
import auditCtrl from "./audit.js";
import { EndpointModel } from "../schemas/endpoint.js";

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
			{ projection: "-logic" }
		);

		// If no matching endpoints then return
		if (endpoints.length === 0) return;

		for (let i = 0; i < endpoints.length; i++) {
			const ep = endpoints[i];
			const updatedEp = await this.updateOneById(
				ep._id,
				{
					rateLimits: ep.rateLimits.filter(
						(entry) => !limits.find((entry2) => entry2.iid === entry)
					),
					updatedBy: user._id,
				},
				{},
				{ session, cacheKey: ep._id }
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.endpoint",
				"update",
				t(
					"Removed rate limit(s) from endpoint '%s' '%s:%s'",
					ep.name,
					ep.method,
					ep.path
				),
				updatedEp,
				{
					orgId: ep.orgId,
					appId: ep.appId,
					versionId: ep.versionId,
					endpointId: ep._id,
				}
			);
		}
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
			{ projection: "-logic" }
		);

		// If no matching endpoints then return
		if (endpoints.length === 0) return;

		for (let i = 0; i < endpoints.length; i++) {
			const ep = endpoints[i];
			const updatedEp = await this.updateOneById(
				ep._id,
				{
					middlewares: ep.middlewares.filter(
						(entry) => !middlewares.find((entry2) => entry2.iid === entry)
					),
					updatedBy: user._id,
				},
				{},
				{ session, cacheKey: ep._id }
			);

			// Log action
			auditCtrl.logAndNotify(
				version._id,
				user,
				"org.app.version.endpoint",
				"update",
				t(
					"Removed middleware(s) from endpoint '%s' '%s:%s'",
					ep.name,
					ep.method,
					ep.path
				),
				updatedEp,
				{
					orgId: ep.orgId,
					appId: ep.appId,
					versionId: ep.versionId,
					endpointId: ep._id,
				}
			);
		}
	}
}

export default new EndpointController();
