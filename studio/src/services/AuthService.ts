import { axios } from '@/helpers';
import { APIError, User, UserDataToRegister } from '@/types/type.ts';

export default class AuthService {
	static url = '/v1/auth';

	static async initializeClusterSetup(data: UserDataToRegister): Promise<User | APIError> {
		return (await axios.post(`${this.url}/init-cluster-setup`, data)).data;
	}
	static async finalizeClusterSetup() {
		return (await axios.post(`${this.url}/finalize-cluster-setup`)).data;
	}
	static async initializeAccountSetup() {
		return (await axios.get(`${this.url}/init-account-setup`)).data;
	}

	static async finalizeAccountSetup() {
		return (await axios.get(`${this.url}/finalize-account-setup`)).data;
	}

	static async completeAccountSetupFollowingInviteAccept() {
		return (await axios.get(`${this.url}/complete-setup`)).data;
	}

	static async login() {
		return (await axios.get(`${this.url}/login`)).data;
	}

	static async logout() {
		return (await axios.get(`${this.url}/logout`)).data;
	}

	static async renewAccessToken() {
		return (await axios.get(`${this.url}/renew`)).data;
	}
}
