import { axios } from '@/helpers';
import useOrganizationStore from '@/store/organization/organizationStore';
import {
	AddNPMPackageParams,
	AddVersionVariableParams,
	CreateAPIKeyParams,
	CreateCopyOfVersionParams,
	CreateRateLimitParams,
	DeleteAPIKeyParams,
	DeleteMultipleAPIKeys,
	DeleteMultipleNPMPackagesParams,
	DeleteMultipleRateLimitsParams,
	DeleteMultipleVersionVariablesParams,
	DeleteNPMPackageParams,
	DeleteRateLimitParams,
	DeleteVersionVariableParams,
	EditRateLimitParams,
	EnvLog,
	Environment,
	GetVersionByIdParams,
	GetVersionLogBucketsParams,
	GetVersionLogsParams,
	GetVersionRequest,
	ResLog,
	Resource,
	SearchNPMPackages,
	SearchNPMPackagesParams,
	UpdateAPIKeyParams,
	UpdateVersionPropertiesParams,
	UpdateVersionRealtimePropertiesParams,
	UpdateVersionVariableParams,
	Version,
	VersionLog,
	VersionLogBucket,
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
			await axios.delete(
				`${this.url}/${orgId}/app/${appId}/version/${versionId}/limits/${limitId}`,
				{
					data: {},
				},
			)
		).data;
	}

	static async deleteMultipleRateLimits({
		orgId,
		appId,
		versionId,
		...data
	}: DeleteMultipleRateLimitsParams) {
		return (
			await axios.delete(`${this.url}/${orgId}/app/${appId}/version/${versionId}/limits`, {
				data,
			})
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

	static async addNPMPackage({
		orgId,
		appId,
		versionId,
		...data
	}: AddNPMPackageParams): Promise<Version> {
		return (
			await axios.post(`${this.url}/${orgId}/app/${appId}/version/${versionId}/packages`, data)
		).data;
	}

	static async deleteNPMPackage({
		orgId,
		appId,
		versionId,
		packageId,
	}: DeleteNPMPackageParams): Promise<Version> {
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
	}: DeleteMultipleNPMPackagesParams): Promise<Version> {
		return (
			await axios.delete(`${this.url}/${orgId}/app/${appId}/version/${versionId}/packages`, {
				data,
			})
		).data;
	}

	static async addVersionVariable({
		orgId,
		appId,
		versionId,
		...data
	}: AddVersionVariableParams): Promise<Version> {
		return (await axios.post(`${this.url}/${orgId}/app/${appId}/version/${versionId}/params`, data))
			.data;
	}

	static async deleteVersionVariable({
		orgId,
		appId,
		versionId,
		paramId,
	}: DeleteVersionVariableParams): Promise<Version> {
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
	}: DeleteMultipleVersionVariablesParams): Promise<Version> {
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
	}: UpdateVersionVariableParams): Promise<Version> {
		return (
			await axios.put(
				`${this.url}/${orgId}/app/${appId}/version/${versionId}/params/${paramId}`,
				data,
			)
		).data;
	}

	static async createCopyOfVersion({ orgId, appId, ...data }: CreateCopyOfVersionParams): Promise<{
		version: Version;
		resource: Resource;
		env: Environment;
		envLog: EnvLog;
		resLog: ResLog;
	}> {
		return (await axios.post(`${this.url}/${orgId}/app/${appId}/version/copy`, data)).data;
	}

	static async editRateLimit({ orgId, appId, versionId, limitId, ...data }: EditRateLimitParams) {
		return (
			await axios.put(
				`${this.url}/${orgId}/app/${appId}/version/${versionId}/limits/${limitId}`,
				data,
			)
		).data;
	}

	static async createAPIKey({
		orgId,
		appId,
		versionId,
		...data
	}: CreateAPIKeyParams): Promise<Version> {
		return (await axios.post(`${this.url}/${orgId}/app/${appId}/version/${versionId}/keys`, data))
			.data;
	}
	static async editAPIKey({
		orgId,
		appId,
		versionId,
		keyId,
		...data
	}: UpdateAPIKeyParams): Promise<Version> {
		return (
			await axios.put(`${this.url}/${orgId}/app/${appId}/version/${versionId}/keys/${keyId}`, data)
		).data;
	}
	static async deleteAPIKey({
		orgId,
		appId,
		versionId,
		keyId,
	}: DeleteAPIKeyParams): Promise<Version> {
		return (
			await axios.delete(`${this.url}/${orgId}/app/${appId}/version/${versionId}/keys/${keyId}`, {
				data: {},
			})
		).data;
	}
	static async deleteMultipleAPIKeys({
		orgId,
		appId,
		versionId,
		...data
	}: DeleteMultipleAPIKeys): Promise<Version> {
		return (
			await axios.delete(`${this.url}/${orgId}/app/${appId}/version/${versionId}/keys/`, {
				data,
			})
		).data;
	}

	static async updateVersionRealtimeProperties({
		orgId,
		appId,
		versionId,
		...data
	}: UpdateVersionRealtimePropertiesParams): Promise<Version> {
		return (
			await axios.put(`${this.url}/${orgId}/app/${appId}/version/${versionId}/realtime`, data)
		).data;
	}

	static async getVersionLogBuckets({
		orgId,
		appId,
		versionId,
		...params
	}: GetVersionLogBucketsParams): Promise<VersionLogBucket> {
		return (
			await axios.get(`${this.url}/${orgId}/app/${appId}/version/${versionId}/log-buckets`, {
				params,
			})
		).data;
	}

	static async getVersionLogs({
		orgId,
		appId,
		versionId,
		...params
	}: GetVersionLogsParams): Promise<VersionLog[]> {
		return (
			await axios.get(`${this.url}/${orgId}/app/${appId}/version/${versionId}/logs`, {
				params,
			})
		).data;
	}
}
