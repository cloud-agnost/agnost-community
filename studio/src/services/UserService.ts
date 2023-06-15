import { axios } from '@/helpers';
import { User } from '@/types/type.ts';

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

	static async changeName(name: string): Promise<string> {
		return (await axios.put(`${this.url}/name`, { name })).data.name;
	}

	static async changeEmail(data: {
		email: string;
		password: string;
		uiBaseURL: string;
	}): Promise<string> {
		return (await axios.post(`${this.url}/login-email`, data)).data.email;
	}

	static async changeAvatar(avatar: File): Promise<string> {
		const formData = new FormData();
		formData.append('picture', avatar, avatar.name);
		return (
			await axios.put(`${this.url}/picture`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					selam: 's',
				},
			})
		).data?.pictureUrl;
	}

	static async removeAvatar(): Promise<User> {
		return (await axios.delete(`${this.url}/picture`)).data;
	}
}
