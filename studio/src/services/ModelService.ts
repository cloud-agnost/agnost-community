import { axios } from '@/helpers';
import {
	AddNewFieldParams,
	CreateModelParams,
	GetModelsOfDatabaseParams,
	Model,
	UpdateNameAndDescriptionParams,
} from '@/types';

export default class ModelService {
	static url = '/v1/org';

	static async getModelsOfDatabase({
		orgId,
		appId,
		versionId,
		dbId,
	}: GetModelsOfDatabaseParams): Promise<Model[]> {
		return (
			await axios.get(`${this.url}/${orgId}/app/${appId}/version/${versionId}/db/${dbId}/model`)
		).data;
	}

	static async createModel({ orgId, appId, versionId, dbId, ...data }: CreateModelParams) {
		return (
			await axios.post(
				`${this.url}/${orgId}/app/${appId}/version/${versionId}/db/${dbId}/model`,
				data,
			)
		).data;
	}

	static async updateNameAndDescription({
		orgId,
		appId,
		versionId,
		dbId,
		modelId,
		...data
	}: UpdateNameAndDescriptionParams) {
		return (
			await axios.put(
				`${this.url}/${orgId}/app/${appId}/version/${versionId}/db/${dbId}/model/${modelId}`,
				data,
			)
		).data;
	}

	static async addNewField({ orgId, appId, versionId, dbId, modelId, ...data }: AddNewFieldParams) {
		return (
			await axios.post(
				`${this.url}/${orgId}/app/${appId}/version/${versionId}/db/${dbId}/model/${modelId}/fields`,
				data,
			)
		).data;
	}
}
