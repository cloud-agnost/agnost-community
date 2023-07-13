import { ResourceService } from '@/services';
import { APIError, AddExistingResourceRequest, GetResourcesRequest, Resource } from '@/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
export interface ResourceStore {
	resources: Resource[];
	isCreateResourceModalOpen: boolean;
	resourceType: {
		name: string;
		type: string;
		step: number;
	};
	openCreateReplicaModal: boolean;
	getResources: (req: GetResourcesRequest) => Promise<Resource[]>;
	testExistingResourceConnection: (req: AddExistingResourceRequest) => Promise<void>;
	addExistingResource: (req: AddExistingResourceRequest) => Promise<Resource>;
	toggleCreateResourceModal: () => void;
	selectResourceType: (name: string, type: string) => void;
	goToNextStep: () => void;
	returnToPreviousStep: () => void;
}

const useResourceStore = create<ResourceStore>()(
	devtools(
		persist(
			(set, get) => ({
				resources: [],
				isCreateResourceModalOpen: false,
				resourceType: {
					type: '',
					name: '',
					step: 1,
				},
				openCreateReplicaModal: false,
				getResources: async (req: GetResourcesRequest) => {
					try {
						const resources = await ResourceService.getResources(req);
						set({ resources });
						return resources;
					} catch (error) {
						throw error as APIError;
					}
				},
				testExistingResourceConnection: async (req: AddExistingResourceRequest) => {
					try {
						await ResourceService.testExistingResourceConnection(req);
						if (req.onSuccess) req.onSuccess();
					} catch (error) {
						if (req.onError) req.onError(error as APIError);
						throw error as APIError;
					}
				},
				addExistingResource: async (req: AddExistingResourceRequest) => {
					try {
						const resource = await ResourceService.addExistingResource(req);
						set((state) => ({
							resources: [...state.resources, resource],
						}));
						if (req.onSuccess) req.onSuccess();
						return resource;
					} catch (error) {
						if (req.onError) req.onError(error as APIError);
						throw error as APIError;
					}
				},
				toggleCreateResourceModal: () =>
					set((state) => ({
						isCreateResourceModalOpen: !state.isCreateResourceModalOpen,
					})),
				selectResourceType: (name: string, type: string) =>
					set({
						resourceType: {
							type,
							name,
							step: get().resourceType.step,
						},
					}),
				goToNextStep: () =>
					set((state) => ({
						resourceType: {
							...state.resourceType,
							step: state.resourceType.step < 2 ? state.resourceType.step + 1 : 2,
						},
					})),
				returnToPreviousStep: () =>
					set((state) => ({
						resourceType: {
							type: '',
							name: '',
							step: state.resourceType.step > 1 ? state.resourceType.step - 1 : 1,
						},
					})),
			}),
			{
				name: 'resources-store',
			},
		),
	),
);

export default useResourceStore;
