import { axios } from '@/helpers';
import {
	CreateMiddlewareParams,
	DeleteMiddlewareParams,
	DeleteMultipleMiddlewares,
	GetMiddlewareByIdParams,
	GetMiddlewaresOfAppVersionParams,
	Middleware,
	SaveMiddlewareCodeParams,
	UpdateMiddlewareParams,
} from '@/types';

export default class MiddlewareService {
	static url = '/v1/org';

	static async getMiddlewaresOfAppVersion({
		orgId,
		appId,
		versionId,
		...params
	}: GetMiddlewaresOfAppVersionParams): Promise<Middleware[]> {
		return (
			await axios.get(`${this.url}/${orgId}/app/${appId}/version/${versionId}/mw`, {
				params,
			})
		).data;
	}

	static async getMiddlewareById({
		orgId,
		appId,
		versionId,
		mwId,
	}: GetMiddlewareByIdParams): Promise<Middleware> {
		return (await axios.get(`${this.url}/${orgId}/app/${appId}/version/${versionId}/mw/${mwId}`))
			.data;
	}

	static async deleteMiddleware({ orgId, appId, versionId, mwId }: DeleteMiddlewareParams) {
		return (await axios.delete(`${this.url}/${orgId}/app/${appId}/version/${versionId}/mw/${mwId}`))
			.data;
	}

	static async deleteMultipleMiddlewares({
		orgId,
		appId,
		versionId,
		...data
	}: DeleteMultipleMiddlewares) {
		return (
			await axios.delete(`${this.url}/${orgId}/app/${appId}/version/${versionId}/mw/delete-multi`, {
				data,
			})
		).data;
	}

	static async createMiddleware({
		orgId,
		appId,
		versionId,
		...data
	}: CreateMiddlewareParams): Promise<Middleware> {
		return (await axios.post(`${this.url}/${orgId}/app/${appId}/version/${versionId}/mw`, data))
			.data;
	}

	static async updateMiddleware({
		orgId,
		appId,
		versionId,
		mwId,
		...data
	}: UpdateMiddlewareParams): Promise<Middleware> {
		return (
			await axios.put(`${this.url}/${orgId}/app/${appId}/version/${versionId}/mw/${mwId}`, data)
		).data;
	}

	static async saveMiddlewareCode({
		orgId,
		appId,
		versionId,
		mwId,
		...data
	}: SaveMiddlewareCodeParams) {
		return (
			await axios.put(
				`${this.url}/${orgId}/app/${appId}/version/${versionId}/mw/${mwId}/logic`,
				data,
			)
		).data;
	}
}
