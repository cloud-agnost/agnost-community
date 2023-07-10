import useOrganizationStore from '@/store/organization/organizationStore';
import { axios } from '@/helpers';
import { Resource, GetResourcesRequest } from '@/types';
export default class ResourceService {
	static url = 'v1/org/:orgId/resource';

	static getUrl() {
		const orgId = useOrganizationStore.getState().organization?._id;
		return this.url.replace(':orgId', orgId as string);
	}

	static async getResources(req: GetResourcesRequest): Promise<Resource[]> {
		const { appId, page, size, instance, search, type, sortBy, sortDir, start, end } = req;
		return (
			await axios.get(`${this.getUrl()}`, {
				params: {
					appId,
					page,
					size,
					instance,
					search,
					type,
					sortBy,
					sortDir,
					start,
					end,
				},
			})
		).data;
	}
}
