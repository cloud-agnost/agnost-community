import { EndpointService } from '@/services';
import {
	APIError,
	CreateEndpointParams,
	DeleteEndpointParams,
	DeleteMultipleEndpointsParams,
	Endpoint,
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
	endpoint: Endpoint | null;
	selectedEndpointIds: string[];
	lastFetchedCount: number;
	endpointRequest: TestEndpointParams[];
	endpointResponse: EndpointResponse[];
	toDeleteEndpoint: Endpoint | null;
	isEndpointDeleteDialogOpen: boolean;
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
}

const useEndpointStore = create<EndpointStore>()(
	devtools(
		persist(
			(set, get) => ({
				selectEndpointDialogOpen: false,
				endpoints: [],
				endpoint: null,
				selectedEndpointIds: [],
				endpointRequest: [],
				endpointResponse: [],
				lastFetchedCount: 0,
				toDeleteEndpoint: null,
				isEndpointDeleteDialogOpen: false,
				setSelectedEndpointIds: (ids) => set({ selectedEndpointIds: ids }),
				setSelectEndpointDialogOpen: (open) => set({ selectEndpointDialogOpen: open }),
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
					console.log('store');
					const response = await EndpointService.testEndpoint(params);
					const prevRequest = get().endpointRequest;
					const prevResponse = get().endpointResponse;

					if (prevRequest.some((r) => r.epId === params.epId)) {
						set({
							endpointRequest: prevRequest.map((r) => {
								if (r.epId === params.epId) {
									return params;
								}
								return r;
							}),
						});
					} else {
						set({
							endpointRequest: [
								...prevRequest,
								{
									...params,
								},
							],
						});
					}
					const endTime = performance.now();
					if (prevResponse.some((r) => r.epId === params.epId)) {
						set((prev) => ({
							endpointResponse: prev.endpointResponse.map((r) => {
								if (r.epId === params.epId) {
									console.log(response?.response?.status ?? response?.status, 'r2esponse');
									return {
										...r,
										epId: params.epId,
										duration: endTime - startTime,
										status: response?.response?.status ?? response?.status,
										statusText: response?.response?.statusText ?? response?.statusText,
										data: response?.response?.data ?? response?.data,
										headers: response?.response?.headers ?? response?.headers,
										config: response?.response?.config ?? response?.config,
									};
								}

								return r;
							}),
						}));
					} else {
						set((prev) => ({
							endpointResponse: [
								...prev.endpointResponse,
								{
									...response,
									epId: params.epId,
									duration: endTime - startTime,
									status: response?.response?.status ?? response?.status,
									statusText: response?.response?.statusText ?? response?.statusText,
									data: response?.response?.data ?? response?.data,
									headers: response?.response?.headers ?? response?.headers,
									config: response?.response?.config ?? response?.config,
								},
							],
						}));
					}
					if (params.onSuccess) params.onSuccess();
					return response;
				},
				openDeleteEndpointDialog: (endpoint) =>
					set({ toDeleteEndpoint: endpoint, isEndpointDeleteDialogOpen: true }),
				closeEndpointDeleteDialog: () =>
					set({ toDeleteEndpoint: null, isEndpointDeleteDialogOpen: false }),
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
