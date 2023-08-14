import { axios } from '@/helpers';
import {
	AddNewFieldParams,
	CreateModelParams,
	DeleteFieldParams,
	DeleteModelParams,
	DeleteMultipleFieldParams,
	DeleteMultipleModelParams,
	GetModelsOfDatabaseParams,
	GetSpecificModelOfDatabaseParams,
	Model,
	UpdateFieldParams,
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

	static async getSpecificModelByIidOfDatabase({
		orgId,
		appId,
		versionId,
		dbId,
		modelIid,
	}: GetSpecificModelOfDatabaseParams) {
		return (
			await axios.get(
				`${this.url}/${orgId}/app/${appId}/version/${versionId}/db/${dbId}/model/iid/${modelIid}`,
			)
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
	}: UpdateNameAndDescriptionParams): Promise<Model> {
		return (
			await axios.put(
				`${this.url}/${orgId}/app/${appId}/version/${versionId}/db/${dbId}/model/${modelId}`,
				data,
			)
		).data;
	}

	static async deleteModel({ orgId, appId, versionId, dbId, modelId }: DeleteModelParams) {
		return (
			await axios.delete(
				`${this.url}/${orgId}/app/${appId}/version/${versionId}/db/${dbId}/model/${modelId}`,
				{
					data: {},
				},
			)
		).data;
	}

	static async deleteMultipleModel({
		orgId,
		appId,
		versionId,
		dbId,
		...data
	}: DeleteMultipleModelParams) {
		return (
			await axios.delete(
				`${this.url}/${orgId}/app/${appId}/version/${versionId}/db/${dbId}/model/delete-multi`,
				{
					data,
				},
			)
		).data;
	}

	static async addNewField({
		orgId,
		appId,
		versionId,
		dbId,
		modelId,
		...data
	}: AddNewFieldParams): Promise<Model> {
		return (
			await axios.post(
				`${this.url}/${orgId}/app/${appId}/version/${versionId}/db/${dbId}/model/${modelId}/fields`,
				data,
			)
		).data;
	}

	static async deleteField({
		orgId,
		appId,
		versionId,
		dbId,
		modelId,
		fieldId,
	}: DeleteFieldParams): Promise<Model> {
		return (
			await axios.delete(
				`${this.url}/${orgId}/app/${appId}/version/${versionId}/db/${dbId}/model/${modelId}/fields/${fieldId}`,
				{
					data: {},
				},
			)
		).data;
	}

	static async deleteMultipleField({
		orgId,
		appId,
		versionId,
		dbId,
		modelId,
		...data
	}: DeleteMultipleFieldParams): Promise<Model> {
		return (
			await axios.delete(
				`${this.url}/${orgId}/app/${appId}/version/${versionId}/db/${dbId}/model/${modelId}/fields/delete-multi`,
				{ data },
			)
		).data;
	}

	static async updateField({
		orgId,
		appId,
		versionId,
		dbId,
		modelId,
		fieldId,
		...data
	}: UpdateFieldParams): Promise<Model> {
		return (
			await axios.put(
				`${this.url}/${orgId}/app/${appId}/version/${versionId}/db/${dbId}/model/${modelId}/fields/${fieldId}`,
				data,
			)
		).data;
	}

	static async getReferenceModels({
		orgId,
		appId,
		versionId,
		dbId,
	}: GetModelsOfDatabaseParams): Promise<Model[]> {
		return (
			await axios.get(`${this.url}/${orgId}/app/${appId}/version/${versionId}/db/${dbId}/model/ref`)
		).data;
	}
}
