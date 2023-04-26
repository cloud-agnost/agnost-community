import envCtrl from "./environment.js";
import dbCtrl from "./database.js";
import resourceCtrl from "./resource.js";

class MappingController {
	constructor() {}

	/**
	 * Returns the app design element information
	 * @param  {string} type The resource type (e.g., engine, database)
	 * @param  {string} orgId The organization id
	 * @param  {string} appId The app id
	 * @param  {string} versionId The version id
	 * @param  {string} designiid The design element id
	 */
	async getDesignElement(type, orgId, appId, versionId, designiid) {
		switch (type) {
			// If the design element is an engine then we use the environment iid as designiid
			case "engine":
				{
					let item = await envCtrl.getOneByQuery({ iid: designiid });
					if (
						item?.orgId.toString() === orgId.toString() &&
						item?.appId.toString() === appId.toString() &&
						item?.versionId.toString() === versionId.toString()
					)
						return item;
				}
				return null;
			case "database":
				{
					let item = await dbCtrl.getOneByQuery({ iid: designiid });

					if (
						item?.orgId.toString() === orgId.toString() &&
						item?.appId.toString() === appId.toString() &&
						item?.versionId.toString() === versionId.toString()
					)
						return item;
				}
				return null;
			case "cache":
				return null;
			case "storage":
				return null;
			case "queue":
				return null;
			case "scheduler":
				return null;
			default:
				return null;
		}
	}

	/**
	 * Returns the organization resource information
	 * @param  {string} type The resource type (e.g., engine, database)
	 * @param  {string} orgId The organization id
	 * @param  {string} resourceId The resource id
	 */
	async getResource(type, orgId, resourceId) {
		let item = await resourceCtrl.getOneById(resourceId, {
			cacheKey: resourceId,
		});

		if (item?.orgId.toString() === orgId.toString() && item?.type === type)
			return item;

		return null;
	}

	isValidMapping(type, designElement, resource) {
		if (type === "database") {
			// Check the specific database technology
			if (designElement.type !== resource.instance)
				return {
					result: "error",
					message: t(
						"The database type of the design element '%s' is not matching to the database type of the resource '%s'",
						designElement.type,
						resource.instance
					),
				};
		}

		return { result: "success" };
	}
}

export default new MappingController();
