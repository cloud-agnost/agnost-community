import { axios } from '@/helpers';
import {
	CreateStorageParams,
	DeleteMultipleStoragesParams,
	DeleteStorageParams,
	GetStorageByIdParams,
	GetStoragesParams,
	UpdateStorageParams,
} from '@/types';

export default class StorageService {
	static url = 'v1/org/';

	static async getStorages({ orgId, appId, versionId, ...params }: GetStoragesParams) {
		return (
			await axios.get(`${this.url}${orgId}/app/${appId}/version/${versionId}/storage`, {
				params,
			})
		).data;
	}

	static async getStorage({ orgId, appId, versionId, storageId }: GetStorageByIdParams) {
		return (
			await axios.get(`${this.url}${orgId}/app/${appId}/version/${versionId}/storage/${storageId}`)
		).data;
	}
	static async createStorage({ orgId, appId, versionId, ...data }: CreateStorageParams) {
		return (await axios.post(`${this.url}${orgId}/app/${appId}/version/${versionId}/storage`, data))
			.data;
	}

	static async updateStorage({ orgId, appId, versionId, storageId, ...data }: UpdateStorageParams) {
		return (
			await axios.put(
				`${this.url}${orgId}/app/${appId}/version/${versionId}/storage/${storageId}`,
				data,
			)
		).data;
	}

	static async deleteStorage({ orgId, appId, versionId, storageId }: DeleteStorageParams) {
		return (
			await axios.delete(
				`${this.url}${orgId}/app/${appId}/version/${versionId}/storage/${storageId}`,
			)
		).data;
	}

	static async deleteMultipleStorage({
		orgId,
		appId,
		versionId,
		storageIds,
	}: DeleteMultipleStoragesParams) {
		return (
			await axios.delete(
				`${this.url}${orgId}/app/${appId}/version/${versionId}/storage/delete-multi`,
				{ data: { storageIds } },
			)
		).data;
	}
}
