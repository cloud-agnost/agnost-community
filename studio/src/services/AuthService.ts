import { axios } from '@/helpers';
import { OnboardingData, User, UserDataToRegister } from '@/types/type.ts';

export default class AuthService {
	static url = '/v1/auth';

	static async initializeClusterSetup(data: UserDataToRegister): Promise<User> {
		return (await axios.post(`${this.url}/init-cluster-setup`, data)).data;
	}
	static async finalizeClusterSetup(data: OnboardingData) {
		return (await axios.post(`${this.url}/finalize-cluster-setup`, data)).data;
	}
	static async initiateAccountSetup(email: string) {
		return (await axios.post(`${this.url}/init-account-setup`, { email })).data;
	}

	static async resendEmailVerificationCode(email: string) {
		return (await axios.post(`${this.url}/resend-code`, { email })).data;
	}

	static async finalizeAccountSetup(data: {
		email: string;
		verificationCode: number;
		password: string;
		name: string;
	}) {
		return (await axios.post(`${this.url}/finalize-account-setup`, data)).data;
	}

	static async completeAccountSetupFollowingInviteAccept(data: {
		email: string;
		token: string;
		inviteType: string;
		name: string;
		password: string;
	}) {
		return (await axios.post(`${this.url}/complete-setup`, data)).data;
	}

	static async login(email: string, password: string): Promise<User> {
		return (
			await axios.post(`${this.url}/login`, {
				email,
				password,
			})
		).data;
	}

	static async validateEmail(email: string, code: number) {
		return (
			await axios.post(`${this.url}/validate-email`, {
				email,
				code,
			})
		).data;
	}

	static async logout() {
		return (await axios.post(`${this.url}/logout`)).data;
	}

	static async renewAccessToken() {
		return (await axios.post(`${this.url}/renew`)).data;
	}
}
