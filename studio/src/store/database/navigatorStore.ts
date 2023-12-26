import { create } from 'zustand';
import { NavigatorService } from '@/services';
import {
	APIError,
	DeleteDataFromModelParams,
	DeleteMultipleDataFromModelParams,
	GetDataFromModelParams,
} from '@/types';
import { devtools } from 'zustand/middleware';
interface NavigatorStore {
	editedField: string;
	data: Record<string, any>[];
	subModelData: Record<string, any>[];
	selectedSubModelId: string;
	lastFetchedPage: number | undefined;
}

type Actions = {
	setEditedField: (field: string) => void;
	getDataFromModel: (params: GetDataFromModelParams) => Promise<void>;
	deleteDataFromModel: (param: DeleteDataFromModelParams) => Promise<void>;
	deleteMultipleDataFromModel: (param: DeleteMultipleDataFromModelParams) => Promise<void>;
	updateDataFromModel: (param: any) => Promise<void>;
	reset: () => void;
};

const initialState: NavigatorStore = {
	editedField: '',
	data: [],
	subModelData: [],
	selectedSubModelId: '',
	lastFetchedPage: undefined,
};

const useNavigatorStore = create<NavigatorStore & Actions>()(
	devtools((set) => ({
		...initialState,
		setEditedField: (field) => set({ editedField: field }),
		getDataFromModel: async (params) => {
			try {
				const data = await NavigatorService.getDataFromModel(params);
				if (params.page === 0) {
					set({ data, lastFetchedPage: params.page });
				} else {
					set((prev) => ({
						data: [...prev.data, ...data],
						lastFetchedPage: params.page,
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
				set((state) => ({
					data: state.data.filter((item) => item.id !== param.id),
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
				set((state) => ({
					data: state.data.filter((item) => !param.ids.includes(item.id)),
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
				set((state) => ({
					data: state.data.map((item) => {
						if (item.id === param.id) {
							return data;
						}
						return item;
					}),
				}));
				if (param.onSuccess) param.onSuccess(data);
			} catch (error) {
				if (param.onError) param.onError(error as APIError);
				throw error;
			}
		},
		reset: () => set(initialState),
	})),
);

export default useNavigatorStore;
