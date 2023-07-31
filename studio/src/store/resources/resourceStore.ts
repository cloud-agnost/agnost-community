import { ResourceService } from '@/services';
import { APIError, AddExistingResourceRequest, GetResourcesRequest, Resource } from '@/types';
import { joinChannel, leaveChannel } from '@/utils';
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
	isDeletedResourceModalOpen: boolean;
	deletedResource: Resource | null;
	lastFetchedCount: number;
	getResources: (req: GetResourcesRequest) => Promise<Resource[]>;
	testExistingResourceConnection: (req: AddExistingResourceRequest) => Promise<void>;
	addExistingResource: (req: AddExistingResourceRequest) => Promise<Resource>;
	toggleCreateResourceModal: () => void;
	selectResourceType: (name: string, type: string) => void;
	goToNextStep: () => void;
	returnToPreviousStep: () => void;
	openDeleteResourceModal: (resource: Resource) => void;
	closeDeleteResourceModal: () => void;
	deleteResource: (resourceId: string) => Promise<void>;
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
				isDeletedResourceModalOpen: false,
				deletedResource: null,
				lastFetchedCount: 0,
				getResources: async (req: GetResourcesRequest) => {
					try {
						const resources = await ResourceService.getResources(req);
						if (req.initialFetch) {
							set({
								resources,
								lastFetchedCount: resources.length,
							});
						} else {
							set({
								resources: [...get().resources, ...resources],
								lastFetchedCount: resources.length,
							});
						}
						resources.forEach((resource) => {
							joinChannel(resource._id);
						});
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
							resources: [resource, ...state.resources],
							resourceType: {
								type: '',
								name: '',
								step: 1,
							},
						}));
						if (req.onSuccess) req.onSuccess();
						joinChannel(resource._id);
						return resource;
					} catch (error) {
						if (req.onError) req.onError(error as APIError);
						throw error as APIError;
					}
				},
				toggleCreateResourceModal: () =>
					set((state) => ({
						isCreateResourceModalOpen: !state.isCreateResourceModalOpen,
						resourceType: {
							type: '',
							name: '',
							step: 1,
						},
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
							step: 2,
						},
					})),
				returnToPreviousStep: () =>
					set({
						resourceType: {
							type: '',
							name: '',
							step: 1,
						},
					}),
				openDeleteResourceModal: (resource: Resource) => {
					set({
						isDeletedResourceModalOpen: true,
						deletedResource: resource,
					});
				},
				closeDeleteResourceModal: () => {
					set({
						isDeletedResourceModalOpen: false,
						deletedResource: null,
					});
				},
				deleteResource: async (resourceId: string) => {
					try {
						await ResourceService.deleteResource(resourceId);
						set((state) => ({
							resources: state.resources.filter((resource) => resource._id !== resourceId),
							isDeletedResourceModalOpen: false,
							deletedResource: null,
						}));
						leaveChannel(resourceId);
					} catch (error) {
						throw error as APIError;
					}
				},
			}),
			{
				name: 'resources-store',
			},
		),
	),
);

export default useResourceStore;
