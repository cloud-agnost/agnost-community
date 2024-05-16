import { axios } from '@/helpers';
import {
	AddGitProviderParams,
	Container,
	CreateContainerParams,
	GetBranchesParams,
	GetContainersInEnvParams,
	GitBranch,
	GitProvider,
	GitRepo,
} from '@/types/container';
export default class ContainerService {
	static url = '/v1/org';

	static async addGitProvider(req: AddGitProviderParams): Promise<GitProvider> {
		return (await axios.post(`/v1/user/git`, req)).data;
	}
	static async disconnectGitProvider(gitProviderId: string) {
		return axios.delete(`/v1/user/git/${gitProviderId}`);
	}
	static async getGitRepositories(gitProviderId: string): Promise<GitRepo[]> {
		return (await axios.get(`/v1/user/git/${gitProviderId}/repo`)).data;
	}
	static async getGitBranches({
		gitProviderId,
		owner,
		repo,
	}: GetBranchesParams): Promise<GitBranch[]> {
		return (
			await axios.get(`/v1/user/git/${gitProviderId}/repo/branch`, {
				params: { owner, repo },
			})
		).data;
	}

	static async createContainer({
		orgId,
		projectId,
		envId,
		...req
	}: CreateContainerParams): Promise<Container> {
		return (
			await axios.post(`${this.url}/${orgId}/project/${projectId}/env/${envId}/container`, req)
		).data;
	}

	static async getContainersInEnv({
		orgId,
		projectId,
		envId,
		...params
	}: GetContainersInEnvParams) {
		return (
			await axios.get(`${this.url}/${orgId}/project/${projectId}/env/${envId}/container`, {
				params: params,
			})
		).data;
	}
}
