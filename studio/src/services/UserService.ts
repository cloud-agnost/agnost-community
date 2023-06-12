import { axios } from '@/helpers';

export default class UserService {
	static url = '/v1/user';

	static async resetPassword({ email, uiBaseURL }: { email: string; uiBaseURL: string }) {
		return (await axios.post(`${this.url}/reset-pwd`, { email, uiBaseURL })).data;
	}
}
