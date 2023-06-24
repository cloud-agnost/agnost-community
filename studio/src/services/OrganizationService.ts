import { axios } from '@/helpers';
import {
	Application,
	CreateApplicationResponse,
	Organization,
	CreateApplicationRequest,
	GetOrganizationMembersRequest,
	ChangeOrganizationAvatarRequest,
	OrganizationMember,
} from '@/types';

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

	static async changeOrganizationName(name: string, organizationId: string): Promise<Organization> {
		return (
			await axios.put(`${this.url}/${organizationId}`, {
				name,
			})
		).data;
	}

	static async changeOrganizationAvatar(
		req: ChangeOrganizationAvatarRequest,
	): Promise<Organization> {
		const formData = new FormData();
		formData.append('picture', req.picture, req.picture.name);
		return (
			await axios.put(`${this.url}/${req.organizationId}/picture`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			})
		).data;
	}
	static async removeOrganizationAvatar(organizationId: string): Promise<Organization> {
		return (await axios.delete(`${this.url}/${organizationId}/picture`)).data;
	}

	static async getOrganizationMembers(
		req: GetOrganizationMembersRequest,
	): Promise<OrganizationMember[]> {
		const { page, size, role, sortBy, sortDir, search, organizationId, excludeSelf } = req;
		return (
			await axios.get(
				`${this.url}/${organizationId}/member${excludeSelf ? '/exclude-current' : ''}`,
				{
					params: {
						page,
						size,
						role,
						sortBy,
						sortDir,
						search,
					},
				},
			)
		).data;
	}

	static async transferOrganization(organizationId: string, userId: string) {
		return (await axios.post(`${this.url}/${organizationId}/transfer/${userId}`, { userId })).data;
	}
	static async deleteOrganization(organizationId: string) {
		return (await axios.delete(`${this.url}/${organizationId}`, { data: {} })).data;
	}
	static async getOrganizationApps(organizationId: string): Promise<Application[]> {
		return (await axios.get(`${this.url}/${organizationId}/app`)).data;
	}

	static async createApplication({
		orgId,
		name,
	}: CreateApplicationRequest): Promise<CreateApplicationResponse> {
		return (await axios.post(`${this.url}/${orgId}/app`, { name })).data;
	}

	static async deleteApplication(appId: string, orgId: string): Promise<void> {
		return (
			await axios.delete(`${this.url}/${orgId}/app/${appId}`, {
				data: {},
			})
		).data;
	}
	static async leaveAppTeam(appId: string, orgId: string): Promise<void> {
		return (
			await axios.delete(`${this.url}/${orgId}/app/${appId}/team`, {
				data: {},
			})
		).data;
	}
}
