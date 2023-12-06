import { UI_BASE_URL } from '@/constants';
import { axios } from '@/helpers';
import useApplicationStore from '@/store/app/applicationStore';
import useOrganizationStore from '@/store/organization/organizationStore';
import {
	AppPermissions,
	Application,
	ApplicationMember,
	GetInvitationRequest,
	Invitation,
} from '@/types';
import { AppInviteRequest } from '@/types/application';
import { arrayToQueryString } from '@/utils';
export default class ApplicationService {
	static url = '/v1/org/:orgId/app/:appId';

	static getUrl() {
		const orgId = useOrganizationStore.getState().organization?._id;
		const appId = useApplicationStore.getState().application?._id;
		return this.url.replace(':orgId', orgId as string).replace(':appId', appId as string);
	}

	static async getAppById(orgId: string, appId: string): Promise<Application> {
		return (await axios.get(`v1/org/${orgId}/app/${appId}`)).data;
	}
	static async changeAppName(name: string): Promise<Application> {
		return (await axios.put(`${this.getUrl()}`, { name })).data;
	}
	static async setAppAvatar(picture: File): Promise<Application> {
		const formData = new FormData();
		formData.append('picture', picture, picture.name);
		return (
			await axios.put(`${this.getUrl()}/picture`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			})
		).data;
	}
	static async removeAppAvatar(): Promise<Application> {
		return (await axios.delete(`${this.getUrl()}/picture`)).data;
	}
	static async transferAppOwnership(userId: string): Promise<Application> {
		return (
			await axios.post(`${this.getUrl()}/transfer/${userId}`, {
				userId,
			})
		).data;
	}

	static async getAppMembers(): Promise<ApplicationMember[]> {
		return (await axios.get(`${this.getUrl()}/team`)).data;
	}

	static async changeMemberRole(userId: string, role: string): Promise<ApplicationMember> {
		return (
			await axios.put(`${this.getUrl()}/team/${userId}`, {
				role,
			})
		).data;
	}

	static async removeAppMember(userId: string) {
		return (
			await axios.delete(`${this.getUrl()}/team/${userId}`, {
				data: {},
			})
		).data;
	}
	static async removeMultipleAppMembers(userIds: string[]): Promise<void> {
		return (
			await axios.delete(`${this.getUrl()}/team/delete-multi`, {
				data: {
					userIds,
				},
			})
		).data;
	}
	static async inviteUsersToApp(req: AppInviteRequest): Promise<Invitation[]> {
		return (await axios.post(`${this.getUrl()}/invite?uiBaseURL=${req.uiBaseURL}`, req.members))
			.data;
	}
	static async getAppInvitations(req: GetInvitationRequest): Promise<Invitation[]> {
		const { page, size, status, email, roles, start, end, sortBy, sortDir } = req;
		const role = arrayToQueryString(roles, 'role');
		return (
			await axios.get(`${this.getUrl()}/invite?${role}`, {
				params: {
					page,
					size,
					sortBy,
					sortDir,
					status,
					email,
					start,
					end,
				},
			})
		).data;
	}

	static async resendInvitation(token: string): Promise<Invitation> {
		return (
			await axios.post(`${this.getUrl()}/invite/resend?token=${token}&uiBaseURL=${UI_BASE_URL}`, {
				token,
			})
		).data;
	}

	static async updateInvitationUserRole(token: string, role: string): Promise<Invitation> {
		return (
			await axios.put(`${this.getUrl()}/invite?token=${token}`, {
				role,
			})
		).data;
	}
	static async deleteInvitation(token: string): Promise<Invitation> {
		return (
			await axios.delete(`${this.getUrl()}/invite?token=${token}`, {
				data: {},
			})
		).data;
	}

	static async deleteMultipleInvitations(tokens: string[] | undefined): Promise<Invitation[]> {
		return (
			await axios.delete(`${this.getUrl()}/invite/multi`, {
				data: {
					tokens,
				},
			})
		).data;
	}

	static async getAllAppRoleDefinitions(): Promise<AppPermissions> {
		return (
			await axios.get(`v1/org/${useOrganizationStore.getState().organization?._id}/app/roles`)
		).data;
	}

	static async searchApps(query: string): Promise<Application[]> {
		return useApplicationStore
			.getState()
			.temp.filter((app) => app.name.toLowerCase().includes(query.toLowerCase()));
	}
}
