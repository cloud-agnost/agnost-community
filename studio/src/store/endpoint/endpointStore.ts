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
	TestEndpointParams,
	UpdateEndpointParams,
} from '@/types';
import { formatTime, isEmpty, updateOrPush } from '@/utils';
import { AxiosResponse } from 'axios';
import { create } from 'zustand';
import useUtilsStore from '../version/utilsStore';
import useVersionStore from '../version/versionStore';

interface EndpointStore {
	selectEndpointDialogOpen: boolean;
	endpoints: Endpoint[];
	endpoint: Endpoint;
	selectedEndpointIds: string[];
	lastFetchedPage: number | undefined;
	isEditEndpointModalOpen: boolean;
	logics: Record<string, string>;
	isCreateEndpointDialogOpen: boolean;
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
	openEditEndpointModal: (endpoint: Endpoint) => void;
	closeEditEndpointModal: () => void;
	setLogics: (id: string, logic: string) => void;
	deleteLogic: (id: string) => void;
	toggleCreateModal: () => void;
	reset: () => void;
};

const initialState: EndpointStore = {
	selectEndpointDialogOpen: false,
	endpoints: [],
	endpoint: {} as Endpoint,
	selectedEndpointIds: [],
	lastFetchedPage: undefined,
	isEditEndpointModalOpen: false,
	logics: {},
	isCreateEndpointDialogOpen: false,
};

const useEndpointStore = create<EndpointStore & Actions>()((set, get) => ({
	...initialState,
	openEditEndpointModal: (endpoint) => set({ endpoint, isEditEndpointModalOpen: true }),
	closeEditEndpointModal: () => set({ isEditEndpointModalOpen: false }),
	setSelectedEndpointIds: (ids) => set({ selectedEndpointIds: ids }),
	setSelectEndpointDialogOpen: (open) => set({ selectEndpointDialogOpen: open }),
	setEndpoints: (endpoints) => set({ endpoints }),
	createEndpoint: async (params) => {
		try {
			const endpoint = await EndpointService.createEndpoint(params);
			set((prev) => ({ endpoints: [endpoint, ...prev.endpoints] }));
			if (params.onSuccess) params.onSuccess(endpoint);
			useVersionStore.setState?.((state) => ({
				dashboard: {
					...state.dashboard,
					endpoint: state.dashboard.endpoint + 1,
				},
			}));
			return endpoint;
		} catch (error) {
			if (params.onError) params.onError(error as APIError);
			throw error as APIError;
		}
	},
	getEndpointById: async (params) => {
		const endpoint = await EndpointService.getEndpointById(params);
		set((prev) => {
			const endpoints = updateOrPush(prev.endpoints, endpoint);
			return { endpoint, endpoints };
		});
		if (isEmpty(get().logics[endpoint._id])) {
			get().setLogics(endpoint._id, endpoint.logic);
		}
		return endpoint;
	},
	getEndpoints: async (params) => {
		try {
			const endpoints = await EndpointService.getEndpoints(params);
			if (params.page === 0) {
				set({ endpoints, lastFetchedPage: params.page });
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
			console.log(params);
			await EndpointService.deleteEndpoint(params);
			set((prev) => ({
				endpoints: prev.endpoints.filter((e) => e._id !== params.endpointId),
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
		useUtilsStore.setState((prev) => ({
			endpointLogs: {
				...prev.endpointLogs,
				[params.epId]: [],
			},
		}));
		const response = await EndpointService.testEndpoint(params);
		useUtilsStore.getState().setEndpointRequest(params);
		const endTime = performance.now();
		useUtilsStore.getState().setEndpointResponse(
			{
				...response,
				duration: formatTime(endTime - startTime),
			},
			params.epId,
		);
		if (params.onSuccess) params.onSuccess();
		return response;
	},
	setLogics: (id, logic) => {
		set((prev) => ({ logics: { ...prev.logics, [id]: logic } }));
	},
	deleteLogic: (id) => {
		const { [id]: _, ...rest } = get().logics;
		set({ logics: rest });
	},
	toggleCreateModal: () => {
		set((prev) => ({ isCreateEndpointDialogOpen: !prev.isCreateEndpointDialogOpen }));
	},
	reset: () => set(initialState),
}));

export default useEndpointStore;
