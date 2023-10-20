import { ResourceService } from '@/services';
import {
	APIError,
	AddExistingResourceRequest,
	CreateResourceRequest,
	GetResourcesRequest,
	Resource,
	ResourceType,
	UpdateManagedResourceConfigurationRequest,
	UpdateResourceAccessSettingsRequest,
	UpdateResourceAllowedRolesRequest,
} from '@/types';
import { joinChannel, leaveChannel } from '@/utils';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
export interface ResourceStore {
	resources: Resource[];
	isCreateResourceModalOpen: boolean;
	resourceConfig: {
		instance: string;
		type: string;
		resourceType: ResourceType;
	};
	openCreateReplicaModal: boolean;
	isDeletedResourceModalOpen: boolean;
	deletedResource: Resource | null;
	isEditResourceModalOpen: boolean;
	resourceToEdit: Resource;
	getResources: (req: GetResourcesRequest) => Promise<Resource[]>;
	testExistingResourceConnection: (req: AddExistingResourceRequest) => Promise<void>;
	addExistingResource: (req: AddExistingResourceRequest) => Promise<Resource>;
	toggleCreateResourceModal: () => void;
	selectResourceType: (instance: string, type: string, resourceType: ResourceType) => void;
	openDeleteResourceModal: (resource: Resource) => void;
	closeDeleteResourceModal: () => void;
	deleteResource: (resourceId: string) => Promise<void>;
	createNewResource: (req: CreateResourceRequest) => Promise<Resource>;
	updateResourceAllowedRoles: (req: UpdateResourceAllowedRolesRequest) => Promise<Resource>;
	updateResourceAccessSettings: (req: UpdateResourceAccessSettingsRequest) => Promise<Resource>;
	updateManagedResourceConfiguration: (
		req: UpdateManagedResourceConfigurationRequest,
	) => Promise<Resource>;
	openEditResourceModal: (resource: Resource, type: string) => void;
	closeEditResourceModal: () => void;
	getOrgResources: (req: GetResourcesRequest) => Promise<Resource[]>;
}

const useResourceStore = create<ResourceStore>()(
	devtools(
		persist(
			(set) => ({
				resources: [],
				isCreateResourceModalOpen: false,
				resourceConfig: {
					type: '',
					instance: '',
					resourceType: '' as ResourceType,
				},
				openCreateReplicaModal: false,
				isDeletedResourceModalOpen: false,
				deletedResource: null,
				lastFetchedCount: 0,
				isEditResourceModalOpen: false,
				resourceToEdit: {} as Resource,
				orgResources: [],
				getResources: async (req: GetResourcesRequest) => {
					try {
						const resources = await ResourceService.getResources(req);
						set({
							resources,
						});
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
								instance: '',
								resourceType: '',
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
							instance: '',
						},
					})),
				selectResourceType: (instance: string, type: string, resourceType: ResourceType) =>
					set({
						resourceConfig: {
							type,
							instance,
							resourceType,
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
				createNewResource: async (req: CreateResourceRequest) => {
					try {
						const resource = await ResourceService.createNewResource(req);
						set((state) => ({
							resources: [resource, ...state.resources],
							resourceType: {
								type: '',
								instance: '',
								resourceType: '',
							},
						}));
						joinChannel(resource._id);
						if (req.onSuccess) req.onSuccess();
						return resource;
					} catch (error) {
						if (req.onError) req.onError(error as APIError);
						throw error as APIError;
					}
				},
				updateResourceAllowedRoles: async (req: UpdateResourceAllowedRolesRequest) => {
					try {
						const resource = await ResourceService.updateResourceAllowedRoles(req);
						set((state) => ({
							resources: state.resources.map((r) => (r._id === resource._id ? resource : r)),
							resourceToEdit: resource,
						}));
						if (req.onSuccess) req.onSuccess();
						return resource;
					} catch (error) {
						if (req.onError) req.onError(error as APIError);
						throw error as APIError;
					}
				},
				updateResourceAccessSettings: async (req: UpdateResourceAccessSettingsRequest) => {
					try {
						const resource = await ResourceService.updateResourceAccessSettings(req);
						set((state) => ({
							resources: state.resources.map((r) => (r._id === resource._id ? resource : r)),
							resourceToEdit: resource,
						}));
						if (req.onSuccess) req.onSuccess();
						return resource;
					} catch (error) {
						if (req.onError) req.onError(error as APIError);
						throw error as APIError;
					}
				},
				updateManagedResourceConfiguration: async (
					req: UpdateManagedResourceConfigurationRequest,
				) => {
					try {
						const resource = await ResourceService.updateManagedResourceConfiguration(req);
						set((state) => ({
							resources: state.resources.map((r) => (r._id === resource._id ? resource : r)),
							resourceToEdit: resource,
						}));
						if (req.onSuccess) req.onSuccess();
						return resource;
					} catch (error) {
						if (req.onError) req.onError(error as APIError);
						throw error as APIError;
					}
				},
				openEditResourceModal: (resource: Resource, type: string) => {
					set({
						isEditResourceModalOpen: true,
						resourceToEdit: resource,
						resourceConfig: {
							type: type,
							instance: resource.instance,
							resourceType: resource.type,
						},
					});
				},
				closeEditResourceModal: () => {
					set({
						isEditResourceModalOpen: false,
						resourceToEdit: {} as Resource,
					});
				},
				getOrgResources: async (req: GetResourcesRequest) => {
					try {
						const resources = await ResourceService.getOrganizationResources(req);
						set({
							resources,
						});
						return resources;
					} catch (error) {
						throw error as APIError;
					}
				},
			}),
			{
				name: 'resources-store',
				partialize: (state) =>
					Object.fromEntries(
						Object.entries(state).filter(
							([key]) => !['resourceToEdit', 'orgResources'].includes(key),
						),
					),
			},
		),
	),
);

export default useResourceStore;
