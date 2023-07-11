import { axios } from '@/helpers';
import useOrganizationStore from '@/store/organization/organizationStore';
import {
	AddNPMPackageParams,
	AddVersionVariableParams,
	CreateRateLimitParams,
	DeleteMultipleNPMPackagesParams,
	DeleteMultipleVersionVariablesParams,
	DeleteNPMPackageParams,
	DeleteRateLimitParams,
	DeleteVersionVariableParams,
	GetVersionByIdParams,
	GetVersionRequest,
	SearchNPMPackages,
	SearchNPMPackagesParams,
	UpdateVersionPropertiesParams,
	UpdateVersionVariableParams,
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

	static async deleteNPMPackage({ orgId, appId, versionId, packageId }: DeleteNPMPackageParams) {
		return (
			await axios.delete(
				`${this.url}/${orgId}/app/${appId}/version/${versionId}/packages/${packageId}`,
				{
					data: {},
				},
			)
		).data;
	}
	static async deleteMultipleNPMPackages({
		orgId,
		appId,
		versionId,
		...data
	}: DeleteMultipleNPMPackagesParams) {
		return (
			await axios.delete(`${this.url}/${orgId}/app/${appId}/version/${versionId}/packages`, {
				data,
			})
		).data;
	}

	static async addVersionVariable({ orgId, appId, versionId, ...data }: AddVersionVariableParams) {
		return (await axios.post(`${this.url}/${orgId}/app/${appId}/version/${versionId}/params`, data))
			.data;
	}

	static async deleteVersionVariable({
		orgId,
		appId,
		versionId,
		paramId,
	}: DeleteVersionVariableParams) {
		return (
			await axios.delete(
				`${this.url}/${orgId}/app/${appId}/version/${versionId}/params/${paramId}`,
				{ data: {} },
			)
		).data;
	}
	static async deleteMultipleVersionVariables({
		orgId,
		appId,
		versionId,
		...data
	}: DeleteMultipleVersionVariablesParams) {
		return (
			await axios.delete(`${this.url}/${orgId}/app/${appId}/version/${versionId}/params/`, { data })
		).data;
	}

	static async updateVersionVariable({
		orgId,
		appId,
		versionId,
		paramId,
		...data
	}: UpdateVersionVariableParams) {
		return (
			await axios.put(
				`${this.url}/${orgId}/app/${appId}/version/${versionId}/params/${paramId}`,
				data,
			)
		).data;
	}
}
