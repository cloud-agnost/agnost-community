import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
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
import { EndpointService } from '@/services';

interface EndpointStore {
	selectEndpointDialogOpen: boolean;
	setSelectEndpointDialogOpen: (open: boolean) => void;
	endpoints: Endpoint[];
	endpoint: Endpoint | null;
	selectedEndpointIds: string[];
	setSelectedEndpointIds: (ids: string[]) => void;
	setEndpoints: (endpoints: Endpoint[]) => void;
	createEndpoint: (endpoint: CreateEndpointParams) => Promise<Endpoint>;
	getEndpointById: (endpoint: GetEndpointByIdParams) => Promise<Endpoint>;
	getEndpoints: (endpoint: GetEndpointsParams) => Promise<Endpoint[]>;
	deleteEndpoint: (endpoint: DeleteEndpointParams) => Promise<void>;
	deleteMultipleEndpoints: (endpoint: DeleteMultipleEndpointsParams) => Promise<void>;
	updateEndpoint: (endpoint: UpdateEndpointParams) => Promise<Endpoint>;
	saveEndpointLogic: (endpoint: SaveEndpointLogicParams) => Promise<Endpoint>;
}

const useEndpointStore = create<EndpointStore>()(
	devtools(
		persist(
			(set) => ({
				selectEndpointDialogOpen: false,
				endpoints: [],
				endpoint: null,
				selectedEndpointIds: [],
				setSelectedEndpointIds: (ids) => set({ selectedEndpointIds: ids }),
				setSelectEndpointDialogOpen: (open) => set({ selectEndpointDialogOpen: open }),
				setEndpoints: (endpoints) => set({ endpoints }),
				createEndpoint: async (params) => {
					const endpoint = await EndpointService.createEndpoint(params);
					set((prev) => ({ endpoints: [...prev.endpoints, endpoint] }));
					return endpoint;
				},
				getEndpointById: async (params) => {
					const endpoint = await EndpointService.getEndpointById(params);
					set({ endpoint });
					return endpoint;
				},
				getEndpoints: async (params) => {
					const endpoints = await EndpointService.getEndpoints(params);
					set({ endpoints });
					return endpoints;
				},
				deleteEndpoint: async (params) => {
					await EndpointService.deleteEndpoint(params);
					set((prev) => ({
						endpoints: prev.endpoints.filter((e) => e._id !== params.versionId),
					}));
				},
				deleteMultipleEndpoints: async (params) => {
					await EndpointService.deleteMultipleEndpoints(params);
					set((prev) => ({
						endpoints: prev.endpoints.filter((e) => !params.endpointIds.includes(e._id)),
					}));
				},
				updateEndpoint: async (params) => {
					const endpoint = await EndpointService.updateEndpoint(params);
					set((prev) => ({
						endpoints: prev.endpoints.map((e) => (e._id === endpoint._id ? endpoint : e)),
					}));
					return endpoint;
				},
				saveEndpointLogic: async (params) => {
					const endpoint = await EndpointService.saveEndpointLogic(params);
					set((prev) => ({
						endpoints: prev.endpoints.map((e) => (e._id === endpoint._id ? endpoint : e)),
					}));
					return endpoint;
				},
			}),
			{
				name: 'endpoint-storage',
			},
		),
		{
			name: 'endpoint',
		},
	),
);

export default useEndpointStore;
