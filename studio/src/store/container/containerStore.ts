import ContainerService from '@/services/ContainerService';
import {
	AddGitProviderParams,
	Container,
	ContainerType,
	CreateContainerParams,
	GetBranchesParams,
	GetContainersInEnvParams,
	GitBranch,
	GitProvider,
	GitRepo,
} from '@/types/container';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

type ContainerState = {
	containers: Container[];
	isCreateContainerDialogOpen: boolean;
	createdContainerType: ContainerType | null;
	gitProvider: GitProvider;
	lastFetchedPage?: number;
};

type Actions = {
	openCreateContainerDialog: (type: ContainerType) => void;
	closeCreateContainerDialog: () => void;
	addGitProvider: (req: AddGitProviderParams) => Promise<GitProvider>;
	disconnectGitProvider: (providerId: string) => Promise<void>;
	getGitRepositories: (providerId: string) => Promise<GitRepo[]>;
	getBranches: (req: GetBranchesParams) => Promise<GitBranch[]>;
	createContainer: (req: CreateContainerParams) => Promise<void>;
	getContainersInEnv: (req: GetContainersInEnvParams) => Promise<Container[]>;
	reset: () => void;
};

const initialState: ContainerState = {
	isCreateContainerDialogOpen: false,
	createdContainerType: null,
	gitProvider: {} as GitProvider,
	containers: [],
	lastFetchedPage: undefined,
};

const useContainerStore = create<ContainerState & Actions>()(
	devtools(
		persist(
			(set) => ({
				...initialState,
				openCreateContainerDialog: (type) =>
					set({ isCreateContainerDialogOpen: true, createdContainerType: type }),
				closeCreateContainerDialog: () =>
					set({ isCreateContainerDialogOpen: false, createdContainerType: null }),
				addGitProvider: async (req) => {
					const provider = await ContainerService.addGitProvider(req);
					set({ gitProvider: provider });
					return provider;
				},
				disconnectGitProvider: async (providerId) => {
					await ContainerService.disconnectGitProvider(providerId);
					set({ gitProvider: {} as GitProvider });
				},
				getGitRepositories: async (providerId) => {
					return await ContainerService.getGitRepositories(providerId);
				},
				getBranches: async (req) => {
					return await ContainerService.getGitBranches(req);
				},
				createContainer: async (req) => {
					const container = await ContainerService.createContainer(req);
					set((state) => ({ containers: [...state.containers, container] }));
				},
				getContainersInEnv: async (req) => {
					const containers = await ContainerService.getContainersInEnv(req);
					if (req.page === 0) {
						set({ containers, lastFetchedPage: req.page });
					} else {
						set((prev) => ({
							containers: [...prev.containers, ...containers],
							lastFetchedPage: req.page,
						}));
					}

					return containers;
				},
				reset: () => set(initialState),
			}),
			{
				name: 'container-store',
				partialize: (state) => ({
					isCreateContainerDialogOpen: state.isCreateContainerDialogOpen,
					createdContainerType: state.createdContainerType,
					gitProvider: state.gitProvider,
				}),
			},
		),
	),
);

export default useContainerStore;
