import { axios } from '@/helpers';
import {
	Environment,
	getAppVersionEnvironmentParams,
	GetEnvironmentLogsParams,
	ToggleAutoDeployParams,
	UpdateEnvironmentTelemetryLogsParams,
	VersionParams,
} from '@/types';

export default class EnvironmentService {
	static url = '/v1/org';

	static async getAppVersionEnvironment({
		orgId,
		appId,
		versionId,
	}: getAppVersionEnvironmentParams): Promise<Environment> {
		return (await axios.get(`${this.url}/${orgId}/app/${appId}/version/${versionId}/env`)).data;
	}

	static async getEnvironmentLogs({
		orgId,
		appId,
		versionId,
		envId,
		...params
	}: GetEnvironmentLogsParams) {
		return (
			await axios.get(`${this.url}/${orgId}/app/${appId}/version/${versionId}/env/${envId}/logs`, {
				params: params,
			})
		).data;
	}

	static async toggleAutoDeploy({
		orgId,
		appId,
		versionId,
		envId,
		...data
	}: ToggleAutoDeployParams) {
		return (
			await axios.put(`${this.url}/${orgId}/app/${appId}/version/${versionId}/env/${envId}`, data)
		).data;
	}

	static async suspendEnvironment({ orgId, appId, versionId, envId }: VersionParams) {
		return (
			await axios.post(
				`${this.url}/${orgId}/app/${appId}/version/${versionId}/env/${envId}/suspend`,
			)
		).data;
	}

	static async activateEnvironment({ orgId, appId, versionId, envId }: VersionParams) {
		return await axios.post(
			`${this.url}/${orgId}/app/${appId}/version/${versionId}/env/${envId}/activate`,
		);
	}

	static async redeployAppVersionToEnvironment({ orgId, appId, versionId, envId }: VersionParams) {
		return await axios.post(
			`${this.url}/${orgId}/app/${appId}/version/${versionId}/env/${envId}/redeploy`,
		);
	}

	static async updateEnvironmentTelemetryLogs({
		orgId,
		appId,
		versionId,
		envId,
		logId,
	}: UpdateEnvironmentTelemetryLogsParams) {
		return await axios.post(
			`${this.url}/${orgId}/app/${appId}/version/${versionId}/env/${envId}/log/${logId}`,
		);
	}
}
