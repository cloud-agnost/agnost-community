import { axios } from '@/helpers';
import { Organization } from '@/types';

export default class OrganizationService {
	static url = '/v1/org';

	static async getAllOrganizationsByUser(): Promise<Organization[]> {
		return (await axios.get(`${this.url}`)).data;
	}

	static async createOrganization(name: string): Promise<Organization> {
		return (await axios.post(`${this.url}`, { name })).data;
	}

	static async leaveOrganization(organizationId: string): Promise<void> {
		return (
			await axios.delete(`${this.url}/${organizationId}/member`, {
				data: {
					organizationId,
				},
			})
		).data;
	}
}
