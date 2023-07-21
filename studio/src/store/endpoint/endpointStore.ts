import { EndpointService } from '@/services';
import {
	APIError,
	CreateEndpointParams,
	DeleteEndpointParams,
	DeleteMultipleEndpointsParams,
	Endpoint,
	GetEndpointByIdParams,
	GetEndpointsByIidParams,
	GetEndpointsParams,
	SaveEndpointLogicParams,
	UpdateEndpointParams,
} from '@/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface EndpointStore {
	selectEndpointDialogOpen: boolean;
	endpoints: Endpoint[];
	endpoint: Endpoint | null;
	selectedEndpointIds: string[];
	lastFetchedCount: number;
	setSelectEndpointDialogOpen: (open: boolean) => void;
	setSelectedEndpointIds: (ids: string[]) => void;
	setEndpoints: (endpoints: Endpoint[]) => void;
	createEndpoint: (endpoint: CreateEndpointParams) => Promise<Endpoint>;
	getEndpointById: (endpoint: GetEndpointByIdParams) => Promise<Endpoint>;
	getEndpoints: (endpoint: GetEndpointsParams) => Promise<Endpoint[]>;
	deleteEndpoint: (endpoint: DeleteEndpointParams) => Promise<void>;
	deleteMultipleEndpoints: (endpoint: DeleteMultipleEndpointsParams) => Promise<void>;
	updateEndpoint: (endpoint: UpdateEndpointParams) => Promise<Endpoint>;
	saveEndpointLogic: (endpoint: SaveEndpointLogicParams) => Promise<Endpoint>;
	getEndpointsByIid: (endpoint: GetEndpointsByIidParams) => Promise<Endpoint[]>;
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
				lastFetchedCount: 0,
				setEndpoints: (endpoints) => set({ endpoints }),
				createEndpoint: async (params) => {
					try {
						const endpoint = await EndpointService.createEndpoint(params);
						set((prev) => ({ endpoints: [endpoint, ...prev.endpoints] }));
						if (params.onSuccess) params.onSuccess();
						return endpoint;
					} catch (error) {
						if (params.onError) params.onError(error as APIError);
						throw error as APIError;
					}
				},
				getEndpointById: async (params) => {
					const endpoint = await EndpointService.getEndpointById(params);
					set({ endpoint });
					return endpoint;
				},
				getEndpoints: async (params) => {
					try {
						const endpoints = await EndpointService.getEndpoints(params);
						if (params.initialFetch) {
							set({ endpoints, lastFetchedCount: endpoints.length });
						} else {
							set((prev) => ({
								endpoints: [...prev.endpoints, ...endpoints],
								lastFetchedCount: endpoints.length,
							}));
						}
						return endpoints;
					} catch (error) {
						throw error as APIError;
					}
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
					try {
						const endpoint = await EndpointService.updateEndpoint(params);
						set((prev) => ({
							endpoints: prev.endpoints.map((e) => (e._id === endpoint._id ? endpoint : e)),
						}));
						if (params.onSuccess) params.onSuccess();
						return endpoint;
					} catch (error) {
						if (params.onError) params.onError(error as APIError);
						throw error as APIError;
					}
				},
				saveEndpointLogic: async (params) => {
					try {
						const endpoint = await EndpointService.saveEndpointLogic(params);
						set((prev) => ({
							endpoints: prev.endpoints.map((e) => (e._id === endpoint._id ? endpoint : e)),
							endpoint,
						}));
						if (params.onSuccess) params.onSuccess();
						return endpoint;
					} catch (error) {
						if (params.onError) params.onError(error as APIError);
						throw error as APIError;
					}
				},
				getEndpointsByIid: async (params) => {
					return EndpointService.getEndpointsByIid(params);
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
