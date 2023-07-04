import { axios } from '@/helpers';
import useOrganizationStore from '@/store/organization/organizationStore';
import { GetVersionRequest } from '@/types';

export default class VersionService {
	static url = '/v1/org';

	// TODO: Add types for page and size
	static async getAllVersionsVisibleToUser(req: GetVersionRequest) {
		const { name, page, size, search, sortBy, sortDir, appId } = req;
		return (
			await axios.get(
				`${this.url}/${useOrganizationStore.getState().organization?._id}/app/${appId}/version`,
				{
					params: {
						name,
						page,
						size,
						search,
						sortBy,
						sortDir,
					},
				},
			)
		).data;
	}
}
