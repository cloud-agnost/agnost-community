import { axios } from '@/helpers';

export default class VersionService {
	static url = '/v1/org';

	// TODO: Add types for page and size
	static async getAllVersionsVisibleToUser(orgId: string, appId: string) {
		return (await axios.get(`${this.url}/${orgId}/app/${appId}/version?page=1&size=50`)).data;
	}
}
