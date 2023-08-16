import { axios } from '@/helpers';
import useOrganizationStore from '@/store/organization/organizationStore';
import { AddExistingResourceRequest, GetResourcesRequest, Resource } from '@/types';
export default class ResourceService {
	static url = 'v1/org/:orgId/resource';

	static getUrl() {
		const orgId = useOrganizationStore.getState().organization?._id;
		return this.url.replace(':orgId', orgId as string);
	}

	static async getResources(req: GetResourcesRequest): Promise<Resource[]> {
		const { appId, instance, search, type, sortBy, sortDir } = req;
		return (
			await axios.get(`${this.getUrl()}`, {
				params: {
					appId,
					instance,
					search,
					type,
					sortBy,
					sortDir,
				},
			})
		).data;
	}

	static async testExistingResourceConnection(req: AddExistingResourceRequest) {
		return (await axios.post(`${this.getUrl()}/test`, req)).data;
	}
	static async addExistingResource(req: AddExistingResourceRequest) {
		return (await axios.post(`${this.getUrl()}/add`, req)).data;
	}
	static async deleteResource(resourceId: string) {
		return (
			await axios.delete(`${this.getUrl()}/${resourceId}`, {
				data: { resourceId },
			})
		).data;
	}
}
