import { ResourceService } from '@/services';
import { APIError, GetResourcesRequest, Resource } from '@/types';
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
	getResources: (req: GetResourcesRequest) => Promise<Resource[]>;
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
				getResources: async (req: GetResourcesRequest) => {
					try {
						const resources = await ResourceService.getResources(req);
						set({ resources });
						return resources;
					} catch (error) {
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
