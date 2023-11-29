import { create } from '@/helpers';
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
	Log,
	SaveEndpointLogicParams,
	TestEndpointParams,
	UpdateEndpointParams,
} from '@/types';
import { formatTime, isEmpty } from '@/utils';
import { AxiosResponse } from 'axios';
import { devtools, persist } from 'zustand/middleware';

interface EndpointStore {
	selectEndpointDialogOpen: boolean;
	endpoints: Endpoint[];
	endpoint: Endpoint;
	selectedEndpointIds: string[];
	lastFetchedPage: number;
	endpointRequest: EndpointRequest;
	endpointResponse: EndpointResponse;
	isEditEndpointDialogOpen: boolean;
	logics: Record<string, string>;
}

type Actions = {
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
	setEndpointLog: (epId: string, log: Log) => void;
	openEditEndpointDialog: (endpoint: Endpoint) => void;
	closeEditEndpointDialog: () => void;
	setLogics: (id: string, logic: string) => void;
	deleteLogic: (id: string) => void;
	reset: () => void;
};

const initialState: EndpointStore = {
	selectEndpointDialogOpen: false,
	endpoints: [],
	endpoint: {} as Endpoint,
	selectedEndpointIds: [],
	endpointRequest: {} as EndpointRequest,
	endpointResponse: {} as EndpointResponse,
	lastFetchedPage: 0,
	isEditEndpointDialogOpen: false,
	logics: {},
};

const useEndpointStore = create<EndpointStore & Actions>()(
	devtools(
		persist(
			(set, get) => ({
				...initialState,
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
					if (isEmpty(get().logics[endpoint._id])) {
						get().setLogics(endpoint._id, endpoint.logic);
					}
					return endpoint;
				},
				getEndpoints: async (params) => {
					try {
						const endpoints = await EndpointService.getEndpoints(params);
						if (params.page === 0) {
							set({ endpoints });
						} else {
							set((prev) => ({
								endpoints: [...prev.endpoints, ...endpoints],
								lastFetchedPage: params.page,
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
					console.log('here0');
					const startTime = performance.now();
					const prevRequest = get().endpointRequest;
					const prevResponse = get().endpointResponse;
					if (prevResponse[params.epId]) {
						set((prev) => ({
							endpointResponse: {
								...prev.endpointResponse,
								[params.epId]: {
									...prev.endpointResponse[params.epId],
									logs: [],
								},
							},
						}));
					}
					const response = await EndpointService.testEndpoint(params);
					console.log('here1', response);
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
						console.log('here2', response);
						set((prev) => ({
							endpointResponse: {
								...prev.endpointResponse,
								[params.epId]: {
									...prev.endpointResponse[params.epId],
									epId: params.epId,
									duration: formatTime(endTime - startTime),
									status: response?.response?.status ?? response?.status,
									statusText: response?.response?.statusText ?? response?.statusText,
									data: response?.response?.data ?? response?.data,
									headers: response?.response?.headers ?? response?.headers,
									config: response?.response?.config ?? response?.config,
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
									duration: formatTime(endTime - startTime),
									status: response?.response?.status ?? response?.status,
									statusText: response?.response?.statusText ?? response?.statusText,
									data: response?.response?.data ?? response?.data,
									headers: response?.response?.headers ?? response?.headers,
									config: response?.response?.config ?? response?.config,
								},
							},
						}));
					}
					if (params.onSuccess) params.onSuccess();
					return response;
				},
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
				setLogics: (id, logic) => {
					set((prev) => ({ logics: { ...prev.logics, [id]: logic } }));
				},
				deleteLogic: (id) => {
					const { [id]: _, ...rest } = get().logics;
					set({ logics: rest });
				},
				reset: () => set(initialState),
			}),
			{
				name: 'endpoint-storage',
				partialize: (state) =>
					Object.fromEntries(
						Object.entries(state).filter(([key]) =>
							['endpointRequest', 'endpointResponse'].includes(key),
						),
					),
			},
		),
		{
			name: 'endpoint',
		},
	),
);

export default useEndpointStore;
