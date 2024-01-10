import { NavigatorService } from '@/services';
import {
	APIError,
	DeleteDataFromModelParams,
	DeleteMultipleDataFromModelParams,
	GetDataFromModelParams,
	UpdateDataFromModelParams,
} from '@/types';
import _ from 'lodash';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import useModelStore from './modelStore';
interface NavigatorStore {
	editedField: string;
	data: {
		[modelId: string]: Record<string, any>[];
	};
	subModelData: {
		[modelId: string]: Record<string, any>[];
	};
	selectedSubModelId: string;
	lastFetchedPage:
		| {
				[modelId: string]: number | undefined;
		  }
		| undefined;
}

type Actions = {
	setEditedField: (field: string) => void;
	getDataFromModel: (params: GetDataFromModelParams) => Promise<any[]>;
	deleteDataFromModel: (param: DeleteDataFromModelParams) => Promise<void>;
	deleteMultipleDataFromModel: (param: DeleteMultipleDataFromModelParams) => Promise<void>;
	updateDataFromModel: (param: UpdateDataFromModelParams) => Promise<void>;
	getDataOfSelectedModel: (modelId: string) => Record<string, any>[] | undefined;
	reset: () => void;
};

const initialState: NavigatorStore = {
	editedField: '',
	data: {},
	subModelData: {},
	selectedSubModelId: '',
	lastFetchedPage: undefined,
};

const useNavigatorStore = create<NavigatorStore & Actions>()(
	devtools((set, get) => ({
		...initialState,
		setEditedField: (field) => set({ editedField: field }),
		getDataFromModel: async (params) => {
			try {
				const data = await NavigatorService.getDataFromModel(params);
				const modelId = useModelStore.getState().model._id;

				if (params.page === 0) {
					set((state) => ({
						data: {
							...state.data,
							[modelId]: data,
						},
						lastFetchedPage: {
							...state.lastFetchedPage,
							[modelId]:
								!_.isNil(get().lastFetchedPage?.[modelId]) &&
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								//@ts-ignore
								get().lastFetchedPage?.[modelId] >= params.page
									? get().lastFetchedPage?.[modelId]
									: params.page,
						},
					}));
				} else {
					set((state) => ({
						data: {
							...state.data,
							[modelId]: [...state.data[modelId], ...data],
						},
						lastFetchedPage: {
							...state.lastFetchedPage,
							[modelId]: params.page,
						},
					}));
				}
				return data;
			} catch (error) {
				throw error as APIError;
			}
		},
		deleteDataFromModel: async (param) => {
			try {
				await NavigatorService.deleteDataFromModel(param);
				const modelId = useModelStore.getState().model._id;
				set((state) => ({
					data: {
						...state.data,
						[modelId]: state.data[modelId].filter((item) => item.id !== param.id),
					},
				}));
				if (param.onSuccess) param.onSuccess();
			} catch (error) {
				if (param.onError) param.onError(error as APIError);
				throw error;
			}
		},
		deleteMultipleDataFromModel: async (param) => {
			try {
				await NavigatorService.deleteMultipleDataFromModel(param);
				const modelId = useModelStore.getState().model._id;
				set((state) => ({
					data: {
						...state.data,
						[modelId]: state.data[modelId].filter((item) => !param.ids.includes(item.id as string)),
					},
				}));
				if (param.onSuccess) param.onSuccess();
			} catch (error) {
				if (param.onError) param.onError(error as APIError);
				throw error;
			}
		},
		updateDataFromModel: async (param) => {
			try {
				const data = await NavigatorService.updateDataFromModel(param);
				const modelId = useModelStore.getState().model._id;
				set((state) => ({
					data: {
						...state.data,
						[modelId]: state.data[modelId].map((item) => {
							if (item.id === param.id) {
								return {
									id: data.id ?? data._id,
									...data,
								};
							}
							return item;
						}),
					},
				}));
				if (param.onSuccess) param.onSuccess(data);
			} catch (error) {
				if (param.onError) param.onError(error as APIError);
				throw error;
			}
		},
		getDataOfSelectedModel: (modelId) => {
			return get().data[modelId];
		},
		reset: () => set(initialState),
	})),
);

export default useNavigatorStore;
