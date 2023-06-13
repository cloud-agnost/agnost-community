import { axios } from '@/helpers';

export default class OrganizationService {
	static url = '/v1/org';

	static async getAllOrganizationsByUser(): Promise<any> {
		return (await axios.get(`${this.url}`)).data;
	}
}
