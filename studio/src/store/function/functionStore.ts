import { FunctionService } from '@/services';
import * as funcTypes from '@/types';
import { isEmpty, updateOrPush } from '@/utils';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import useVersionStore from '../version/versionStore';
interface FunctionStore {
	functions: funcTypes.HelperFunction[];
	function: funcTypes.HelperFunction;
	isEditFunctionDrawerOpen: boolean;
	lastFetchedPage: number | undefined;
	logics: Record<string, string>;
	isCreateFunctionDrawerOpen: boolean;
}
type Actions = {
	getFunctions: (params: funcTypes.getFunctions) => Promise<funcTypes.HelperFunction[]>;
	getFunctionById: (params: funcTypes.GetFunctionByIdParams) => Promise<funcTypes.HelperFunction>;
	deleteFunction: (params: funcTypes.DeleteFunctionParams) => Promise<void>;
	deleteMultipleFunctions: (params: funcTypes.DeleteMultipleFunctions) => Promise<void>;
	createFunction: (params: funcTypes.CreateFunctionParams) => Promise<funcTypes.HelperFunction>;
	updateFunction: (params: funcTypes.UpdateFunctionParams) => Promise<funcTypes.HelperFunction>;
	saveFunctionCode: (params: funcTypes.SaveFunctionCodeParams) => Promise<funcTypes.HelperFunction>;
	closeEditFunctionModal: () => void;
	openEditFunctionModal: (func: funcTypes.HelperFunction) => void;
	setLogics: (id: string, logic: string) => void;
	deleteLogic: (id: string) => void;
	toggleCreateModal: () => void;
	reset: () => void;
};

const initialState: FunctionStore = {
	functions: [],
	function: {} as funcTypes.HelperFunction,
	isEditFunctionDrawerOpen: false,
	lastFetchedPage: undefined,
	logics: {},
	isCreateFunctionDrawerOpen: false,
};

const useFunctionStore = create<FunctionStore & Actions>()(
	devtools((set, get) => ({
		...initialState,
		getFunctions: async (params) => {
			const functions = await FunctionService.getFunctions(params);
			if (params.page === 0) {
				set({ functions });
			} else {
				set((prev) => ({ functions: [...prev.functions, ...functions] }));
			}
			set({ lastFetchedPage: params.page });
			return functions;
		},
		getFunctionById: async (params) => {
			const func = await FunctionService.getFunctionById(params);
			set((prev) => {
				const functions = updateOrPush(prev.functions, func);
				return { function: func, functions };
			});
			if (isEmpty(get().logics[func._id])) {
				get().setLogics(func._id, func.logic);
			}
			return func;
		},
		deleteFunction: async (params) => {
			try {
				await FunctionService.deleteFunction(params);
				set((prev) => ({
					functions: prev.functions.filter((func) => func._id !== params.functionId),
				}));
				params.onSuccess?.();
			} catch (err) {
				params.onError?.(err as funcTypes.APIError);
				throw err as funcTypes.APIError;
			}
		},
		deleteMultipleFunctions: async (params) => {
			try {
				await FunctionService.deleteMultipleFunctions(params);
				set((prev) => ({
					functions: prev.functions.filter((func) => !params.functionIds.includes(func._id)),
				}));
				params.onSuccess?.();
			} catch (err) {
				params.onError?.(err as funcTypes.APIError);
				throw err as funcTypes.APIError;
			}
		},
		createFunction: async (params) => {
			try {
				const func = await FunctionService.createFunction(params);
				set((prev) => ({ functions: [func, ...prev.functions] }));
				params.onSuccess?.(func);
				useVersionStore.setState?.((state) => ({
					dashboard: {
						...state.dashboard,
						function: state.dashboard.function + 1,
					},
				}));
				return func;
			} catch (err) {
				params.onError?.(err as funcTypes.APIError);
				throw err as funcTypes.APIError;
			}
		},
		updateFunction: async (params) => {
			try {
				const func = await FunctionService.updateFunction(params);
				set((prev) => ({
					functions: prev.functions.map((f) => (f._id === func._id ? func : f)),
				}));
				params.onSuccess?.();
				return func;
			} catch (err) {
				params.onError?.(err as funcTypes.APIError);
				throw err as funcTypes.APIError;
			}
		},
		saveFunctionCode: async (params) => {
			try {
				const func = await FunctionService.saveFunctionCode(params);
				set((prev) => ({
					functions: prev.functions.map((f) => (f._id === func._id ? func : f)),
					function: func,
					editedLogic: func.logic,
				}));
				params.onSuccess?.();
				return func;
			} catch (err) {
				params.onError?.(err as funcTypes.APIError);
				throw err as funcTypes.APIError;
			}
		},
		closeEditFunctionModal: () => set({ isEditFunctionDrawerOpen: false }),
		openEditFunctionModal: (func) => {
			set({ function: func, isEditFunctionDrawerOpen: true });
		},

		setLogics: (id, logic) => set((prev) => ({ logics: { ...prev.logics, [id]: logic } })),
		deleteLogic: (id) => {
			const { [id]: _, ...rest } = get().logics;
			set({ logics: rest });
		},
		toggleCreateModal: () =>
			set((prev) => ({ isCreateFunctionDrawerOpen: !prev.isCreateFunctionDrawerOpen })),
		reset: () => set(initialState),
	})),
);

export default useFunctionStore;
