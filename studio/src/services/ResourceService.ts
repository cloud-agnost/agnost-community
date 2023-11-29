import { axios } from '@/helpers';
import useOrganizationStore from '@/store/organization/organizationStore';
import {
	AddExistingResourceRequest,
	CreateResourceRequest,
	GetResourceRequest,
	GetResourcesRequest,
	Resource,
	UpdateManagedResourceConfigurationRequest,
	UpdateResourceAccessSettingsRequest,
	UpdateResourceAllowedRolesRequest,
} from '@/types';
export default class ResourceService {
	static url = 'v1/org/:orgId/resource';

	static getUrl() {
		const orgId = useOrganizationStore.getState().organization?._id;
		return this.url.replace(':orgId', orgId as string);
	}

	static async getResources(req: GetResourcesRequest): Promise<Resource[]> {
		const { instance, search, type, sortBy, sortDir } = req;
		return (
			await axios.get(`${this.getUrl()}`, {
				params: {
					instance,
					search,
					type,
					sortBy,
					sortDir,
				},
			})
		).data;
	}
	static async getResource(req: GetResourceRequest): Promise<Resource> {
		return (await axios.get(`${this.getUrl()}/iid/${req.iid}`)).data;
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

	static async createNewResource(req: CreateResourceRequest): Promise<Resource> {
		return (await axios.post(`${this.getUrl()}/create`, req)).data;
	}

	static async updateResourceAllowedRoles(
		req: UpdateResourceAllowedRolesRequest,
	): Promise<Resource> {
		return (await axios.put(`${this.getUrl()}/${req.resourceId}`, req)).data;
	}

	static async updateResourceAccessSettings(
		req: UpdateResourceAccessSettingsRequest,
	): Promise<Resource> {
		return (await axios.put(`${this.getUrl()}/${req.resourceId}/access`, req)).data;
	}
	static async updateManagedResourceConfiguration(
		req: UpdateManagedResourceConfigurationRequest,
	): Promise<Resource> {
		return (await axios.put(`${this.getUrl()}/${req.resourceId}/config`, req)).data;
	}

	static async getOrganizationResources(params: GetResourcesRequest) {
		return (
			await axios.get(`${this.getUrl()}/edit-list`, {
				params,
			})
		).data;
	}
}
