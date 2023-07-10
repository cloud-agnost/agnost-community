import { axios } from '@/helpers';
import useOrganizationStore from '@/store/organization/organizationStore';
import {
	AddNPMPackageParams,
	CreateRateLimitParams,
	DeleteRateLimitParams,
	GetVersionByIdParams,
	GetVersionRequest,
	SearchNPMPackages,
	SearchNPMPackagesParams,
	UpdateVersionPropertiesParams,
	Version,
} from '@/types';

export default class VersionService {
	static url = '/v1/org';

	static async getVersionById({ orgId, versionId, appId }: GetVersionByIdParams): Promise<Version> {
		return (await axios.get(`${this.url}/${orgId}/app/${appId}/version/${versionId}`)).data;
	}

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

	static async updateVersionProperties({
		orgId,
		appId,
		versionId,
		...data
	}: UpdateVersionPropertiesParams): Promise<Version> {
		return (await axios.put(`${this.url}/${orgId}/app/${appId}/version/${versionId}`, data)).data;
	}

	static async createRateLimit({ orgId, versionId, appId, ...data }: CreateRateLimitParams) {
		return (await axios.post(`${this.url}/${orgId}/app/${appId}/version/${versionId}/limits`, data))
			.data;
	}

	static async deleteRateLimit({ orgId, versionId, appId, limitId }: DeleteRateLimitParams) {
		return (
			await axios.delete(`${this.url}/${orgId}/app/${appId}/version/${versionId}/limits/${limitId}`)
		).data;
	}

	static async searchNPMPackages({
		orgId,
		appId,
		versionId,
		...params
	}: SearchNPMPackagesParams): Promise<SearchNPMPackages[]> {
		return (
			await axios.get(`${this.url}/${orgId}/app/${appId}/version/${versionId}/npm-search`, {
				params,
			})
		).data;
	}

	static async addNPMPackage({ orgId, appId, versionId, ...data }: AddNPMPackageParams) {
		return (
			await axios.post(`${this.url}/${orgId}/app/${appId}/version/${versionId}/packages`, data)
		).data;
	}
}
