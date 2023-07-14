import {
	CreateEndpointParams,
	DeleteEndpointParams,
	DeleteMultipleEndpointsParams,
	Endpoint,
	GetEndpointByIdParams,
	GetEndpointsParams,
	SaveEndpointLogicParams,
	UpdateEndpointParams,
} from '@/types';
import { axios } from '@/helpers';

export default class EndpointService {
	static url = '/v1/org';

	static async createEndpoint({
		orgId,
		appId,
		versionId,
		...data
	}: CreateEndpointParams): Promise<Endpoint> {
		return (await axios.post(`${this.url}/${orgId}/app/${appId}/version/${versionId}/ep`, data))
			.data;
	}

	static async getEndpointById({
		orgId,
		appId,
		versionId,
		epId,
	}: GetEndpointByIdParams): Promise<Endpoint> {
		return (await axios.get(`${this.url}/${orgId}/app/${appId}/version/${versionId}/ep/${epId}`))
			.data;
	}

	static async getEndpoints({
		orgId,
		appId,
		versionId,
		...params
	}: GetEndpointsParams): Promise<Endpoint[]> {
		return (
			await axios.get(`${this.url}/${orgId}/app/${appId}/version/${versionId}/ep`, {
				params,
			})
		).data;
	}

	static async deleteEndpoint({
		orgId,
		appId,
		versionId,
		epId,
	}: DeleteEndpointParams): Promise<void> {
		return (
			await axios.delete(`${this.url}/${orgId}/app/${appId}/version/${versionId}/ep/${epId}`, {
				data: {},
			})
		).data;
	}

	static async deleteMultipleEndpoints({
		orgId,
		appId,
		versionId,
		...data
	}: DeleteMultipleEndpointsParams): Promise<void> {
		return (
			await axios.delete(`${this.url}/${orgId}/app/${appId}/version/${versionId}/ep`, {
				data,
			})
		).data;
	}

	static async updateEndpoint({
		orgId,
		appId,
		versionId,
		epId,
		...data
	}: UpdateEndpointParams): Promise<Endpoint> {
		return (
			await axios.put(`${this.url}/${orgId}/app/${appId}/version/${versionId}/ep/${epId}`, data)
		).data;
	}

	static async saveEndpointLogic({
		orgId,
		appId,
		versionId,
		epId,
		...data
	}: SaveEndpointLogicParams): Promise<Endpoint> {
		return (
			await axios.put(
				`${this.url}/${orgId}/app/${appId}/version/${versionId}/ep/${epId}/logic`,
				data,
			)
		).data;
	}
}
