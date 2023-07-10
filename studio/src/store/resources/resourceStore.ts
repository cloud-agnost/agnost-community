import { ResourceService } from '@/services';
import { APIError, Resource } from '@/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { GetResourcesRequest } from '@/types';
export interface ResourceStore {
	resources: Resource[];
	getResources: (req: GetResourcesRequest) => Promise<Resource[]>;
}

const useResourceStore = create<ResourceStore>()(
	devtools(
		persist(
			(set) => ({
				resources: [],
				getResources: async (req: GetResourcesRequest) => {
					try {
						const resources = await ResourceService.getResources(req);
						set({ resources });
						return resources;
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
