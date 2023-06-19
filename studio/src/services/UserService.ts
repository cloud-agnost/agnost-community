import { axios } from '@/helpers';
import { UpdateNotificationsData, User } from '@/types/type.ts';

export default class UserService {
	static url = '/v1/user';

	static async resetPassword({ email, uiBaseURL }: { email: string; uiBaseURL: string }) {
		return (await axios.post(`${this.url}/reset-pwd`, { email, uiBaseURL })).data;
	}

	static async changePasswordWithToken({
		newPassword,
		token,
	}: {
		newPassword: string;
		token: string;
	}) {
		return (await axios.post(`${this.url}/reset-pwd/${token}`, { newPassword })).data;
	}

	static async acceptInvite(token: string) {
		return (await axios.post(`${this.url}/app-invite-accept?token=${token}`, { token })).data;
	}

	static async changeName(name: string): Promise<User> {
		return (await axios.put(`${this.url}/name`, { name })).data;
	}

	static async changeEmail(data: {
		email: string;
		password: string;
		uiBaseURL: string;
	}): Promise<string> {
		return (await axios.post(`${this.url}/login-email`, data)).data;
	}

	static async changeAvatar(avatar: File): Promise<User> {
		const formData = new FormData();
		formData.append('picture', avatar, avatar.name);
		return (
			await axios.put(`${this.url}/picture`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					selam: 's',
				},
			})
		).data;
	}

	static async removeAvatar(): Promise<User> {
		return (await axios.delete(`${this.url}/picture`)).data;
	}

	static async changePassword(currentPassword: string, newPassword: string) {
		return (await axios.put(`${this.url}/password`, { password: currentPassword, newPassword }))
			.data;
	}

	static async deleteAccount() {
		return (await axios.delete(`${this.url}`)).data;
	}

	static async updateNotifications(data: UpdateNotificationsData): Promise<User> {
		return (await axios.put(`${this.url}/notifications`, data)).data;
	}
}
