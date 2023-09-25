import * as funcTypes from '@/types';
import { axios } from '@/helpers';
export default class FunctionService {
	static url = '/v1/org';

	static async getFunctionsOfAppVersion({
		orgId,
		appId,
		versionId,
		...params
	}: funcTypes.GetFunctionsOfAppVersion): Promise<funcTypes.HelperFunction[]> {
		return (
			await axios.get(`${this.url}/${orgId}/app/${appId}/version/${versionId}/func`, {
				params,
			})
		).data;
	}

	static async getFunctionById({
		orgId,
		appId,
		versionId,
		funcId,
	}: funcTypes.GetFunctionByIdParams): Promise<funcTypes.HelperFunction> {
		return (
			await axios.get(`${this.url}/${orgId}/app/${appId}/version/${versionId}/func/${funcId}`)
		).data;
	}

	static async deleteFunction({ orgId, appId, versionId, funcId }: funcTypes.DeleteFunctionParams) {
		return (
			await axios.delete(`${this.url}/${orgId}/app/${appId}/version/${versionId}/func/${funcId}`)
		).data;
	}

	static async deleteMultipleFunctions({
		orgId,
		appId,
		versionId,
		...data
	}: funcTypes.DeleteMultipleFunctions) {
		return (
			await axios.delete(
				`${this.url}/${orgId}/app/${appId}/version/${versionId}/func/delete-multi`,
				{
					data,
				},
			)
		).data;
	}

	static async createFunction({
		orgId,
		appId,
		versionId,
		...data
	}: funcTypes.CreateFunctionParams): Promise<funcTypes.HelperFunction> {
		return (await axios.post(`${this.url}/${orgId}/app/${appId}/version/${versionId}/func`, data))
			.data;
	}

	static async updateFunction({
		orgId,
		appId,
		versionId,
		funcId,
		...data
	}: funcTypes.UpdateFunctionParams): Promise<funcTypes.HelperFunction> {
		return (
			await axios.put(`${this.url}/${orgId}/app/${appId}/version/${versionId}/func/${funcId}`, data)
		).data;
	}

	static async saveFunctionCode({
		orgId,
		appId,
		versionId,
		funcId,
		...data
	}: funcTypes.SaveFunctionCodeParams) {
		return (
			await axios.put(
				`${this.url}/${orgId}/app/${appId}/version/${versionId}/func/${funcId}/logic`,
				data,
			)
		).data;
	}
}
