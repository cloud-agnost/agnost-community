import { axios } from '@/helpers';
import {
	CreateDatabaseParams,
	DeleteDatabaseParams,
	GetDatabaseOfAppByIdParams,
	GetDatabasesOfAppParams,
	UpdateDatabaseNameParams,
} from '@/types';

export default class DatabaseService {
	static url = '/v1/org';

	static async getDatabasesOfApp({ orgId, appId, versionId }: GetDatabasesOfAppParams) {
		return (await axios.get(`${this.url}/${orgId}/app/${appId}/version/${versionId}`)).data;
	}

	static async getDatabaseOfAppById({ orgId, appId, versionId, dbId }: GetDatabaseOfAppByIdParams) {
		return (await axios.get(`${this.url}/${orgId}/app/${appId}/version/${versionId}/db/${dbId}`))
			.data;
	}

	static async createDatabase({ orgId, appId, versionId, ...data }: CreateDatabaseParams) {
		return (await axios.post(`${this.url}/${orgId}/app/${appId}/version/${versionId}/db`, data))
			.data;
	}

	static async updateDatabaseName({
		orgId,
		appId,
		versionId,
		dbId,
		...data
	}: UpdateDatabaseNameParams) {
		return (
			await axios.put(`${this.url}/${orgId}/app/${appId}/version/${versionId}/db/${dbId}`, data)
		).data;
	}

	static async deleteDatabase({ orgId, appId, versionId, dbId }: DeleteDatabaseParams) {
		return (await axios.delete(`${this.url}/${orgId}/app/${appId}/version/${versionId}/db/${dbId}`))
			.data;
	}
}
