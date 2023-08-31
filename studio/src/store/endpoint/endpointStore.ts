import { EndpointService } from '@/services';
import {
	APIError,
	CreateEndpointParams,
	DeleteEndpointParams,
	DeleteMultipleEndpointsParams,
	Endpoint,
	EndpointRequest,
	EndpointResponse,
	GetEndpointByIdParams,
	GetEndpointsByIidParams,
	GetEndpointsParams,
	SaveEndpointLogicParams,
	TestEndpointParams,
	UpdateEndpointParams,
} from '@/types';
import { AxiosResponse } from 'axios';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface EndpointStore {
	selectEndpointDialogOpen: boolean;
	endpoints: Endpoint[];
	endpoint: Endpoint;
	selectedEndpointIds: string[];
	lastFetchedCount: number;
	endpointRequest: EndpointRequest;
	endpointResponse: EndpointResponse;
	toDeleteEndpoint: Endpoint | null;
	isEndpointDeleteDialogOpen: boolean;
	isEditEndpointDialogOpen: boolean;
	openDeleteEndpointDialog: (endpoint: Endpoint) => void;
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
	testEndpoint: (endpoint: TestEndpointParams) => Promise<AxiosResponse>;
	closeEndpointDeleteDialog: () => void;
	setEndpointLog: (epId: string, log: string) => void;
	openEditEndpointDialog: (endpoint: Endpoint) => void;
	closeEditEndpointDialog: () => void;
}

const useEndpointStore = create<EndpointStore>()(
	devtools(
		persist(
			(set, get) => ({
				selectEndpointDialogOpen: false,
				endpoints: [],
				endpoint: {} as Endpoint,
				selectedEndpointIds: [],
				endpointRequest: {} as EndpointRequest,
				endpointResponse: {} as EndpointResponse,
				lastFetchedCount: 0,
				toDeleteEndpoint: null,
				isEndpointDeleteDialogOpen: false,
				isEditEndpointDialogOpen: false,
				openEditEndpointDialog: (endpoint) => set({ endpoint, isEditEndpointDialogOpen: true }),
				closeEditEndpointDialog: () => set({ isEditEndpointDialogOpen: false }),
				setSelectedEndpointIds: (ids) => set({ selectedEndpointIds: ids }),
				setSelectEndpointDialogOpen: (open) => set({ selectEndpointDialogOpen: open }),
				setEndpoints: (endpoints) => set({ endpoints }),
				createEndpoint: async (params) => {
					try {
						const endpoint = await EndpointService.createEndpoint(params);
						set((prev) => ({ endpoints: [endpoint, ...prev.endpoints] }));
						if (params.onSuccess) params.onSuccess(endpoint);
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
					try {
						await EndpointService.deleteEndpoint(params);
						set((prev) => ({
							endpoints: prev.endpoints.filter((e) => e._id !== params.epId),
						}));
						if (params.onSuccess) params.onSuccess();
					} catch (error) {
						if (params.onError) params.onError(error as APIError);
						throw error as APIError;
					}
				},
				deleteMultipleEndpoints: async (params) => {
					try {
						await EndpointService.deleteMultipleEndpoints(params);
						set((prev) => ({
							endpoints: prev.endpoints.filter((e) => !params.endpointIds.includes(e._id)),
						}));
						if (params.onSuccess) params.onSuccess();
					} catch (error) {
						if (params.onError) params.onError(error as APIError);
						throw error as APIError;
					}
				},
				updateEndpoint: async (params) => {
					try {
						const endpoint = await EndpointService.updateEndpoint(params);
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
				testEndpoint: async (params) => {
					const startTime = performance.now();
					const response = await EndpointService.testEndpoint(params);
					const prevRequest = get().endpointRequest;
					const prevResponse = get().endpointResponse;
					if (prevRequest[params.epId]) {
						set({
							endpointRequest: {
								...prevRequest,
								[params.epId]: {
									...prevRequest[params.epId],
									...params,
								},
							},
						});
					} else {
						set({
							endpointRequest: {
								...prevRequest,
								[params.epId]: params,
							},
						});
					}
					const endTime = performance.now();
					if (prevResponse[params.epId]) {
						set((prev) => ({
							endpointResponse: {
								...prev.endpointResponse,
								[params.epId]: {
									...prev.endpointResponse[params.epId],
									epId: params.epId,
									duration: endTime - startTime,
									status: response?.response?.status ?? response?.status,
									statusText: response?.response?.statusText ?? response?.statusText,
									data: response?.response?.data ?? response?.data,
									headers: response?.response?.headers ?? response?.headers,
									config: response?.response?.config ?? response?.config,
									logs: [],
								},
							},
						}));
					} else {
						set((prev) => ({
							endpointResponse: {
								...prev.endpointResponse,
								[params.epId]: {
									...response,
									epId: params.epId,
									duration: endTime - startTime,
									status: response?.response?.status ?? response?.status,
									statusText: response?.response?.statusText ?? response?.statusText,
									data: response?.response?.data ?? response?.data,
									headers: response?.response?.headers ?? response?.headers,
									config: response?.response?.config ?? response?.config,
									logs: [],
								},
							},
						}));
					}
					if (params.onSuccess) params.onSuccess();
					return response;
				},
				openDeleteEndpointDialog: (endpoint) =>
					set({ toDeleteEndpoint: endpoint, isEndpointDeleteDialogOpen: true }),
				closeEndpointDeleteDialog: () =>
					set({ toDeleteEndpoint: null, isEndpointDeleteDialogOpen: false }),
				setEndpointLog(epId, log) {
					set((prev) => ({
						endpointResponse: {
							...prev.endpointResponse,
							[epId]: {
								...prev.endpointResponse[epId],
								logs: [...(prev.endpointResponse[epId]?.logs ?? []), log],
							},
						},
					}));
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
