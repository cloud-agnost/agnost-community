import useOrganizationStore from '@/store/organization/organizationStore';
import { axios } from '@/helpers';
import { Application } from '@/types';
import useApplicationStore from '@/store/app/applicationStore';
import { ApplicationMember } from '@/types';
export default class ApplicationService {
	static url = '/v1/org/:orgId/app/:appId';

	static getUrl() {
		const orgId = useOrganizationStore.getState().organization?._id;
		const appId = useApplicationStore.getState().application?._id;
		return this.url.replace(':orgId', orgId as string).replace(':appId', appId as string);
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
}
