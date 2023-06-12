import { axios } from '@/helpers';

export default class ClusterService {
	static url = '/v1/cluster';

	static async checkCompleted(): Promise<{ status: boolean }> {
		return (await axios.get(`${this.url}/setup-status`)).data;
	}

	static async canClusterSendEmail() {
		return (await axios.get(`${this.url}/smtp-status`)).data;
	}

	static async getSMTPSettings() {
		return (await axios.get(`${this.url}/smtp`)).data;
	}
}
