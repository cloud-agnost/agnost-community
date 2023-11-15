import { CustomStateStorage, create } from '@/helpers';
import { FunctionService } from '@/services';
import * as funcTypes from '@/types';
import { isEmpty } from '@/utils';
import { devtools } from 'zustand/middleware';
interface FunctionStore {
	functions: funcTypes.HelperFunction[];
	function: funcTypes.HelperFunction;
	isEditFunctionDrawerOpen: boolean;
	lastFetchedPage: number;
	logics: Record<string, string>;
}
type Actions = {
	getFunctionsOfAppVersion: (
		params: funcTypes.GetFunctionsOfAppVersion,
	) => Promise<funcTypes.HelperFunction[]>;
	getFunctionById: (params: funcTypes.GetFunctionByIdParams) => Promise<funcTypes.HelperFunction>;
	deleteFunction: (params: funcTypes.DeleteFunctionParams) => Promise<void>;
	deleteMultipleFunctions: (params: funcTypes.DeleteMultipleFunctions) => Promise<void>;
	createFunction: (params: funcTypes.CreateFunctionParams) => Promise<funcTypes.HelperFunction>;
	updateFunction: (params: funcTypes.UpdateFunctionParams) => Promise<funcTypes.HelperFunction>;
	saveFunctionCode: (params: funcTypes.SaveFunctionCodeParams) => Promise<funcTypes.HelperFunction>;
	closeEditFunctionDrawer: () => void;
	openEditFunctionDrawer: (func: funcTypes.HelperFunction) => void;
	setLogics: (id: string, logic: string) => void;
	deleteLogic: (id: string) => void;
	reset: () => void;
};

const initialState: FunctionStore = {
	functions: [],
	function: {} as funcTypes.HelperFunction,
	isEditFunctionDrawerOpen: false,
	lastFetchedPage: 0,
	logics: {},
};

const useFunctionStore = create<FunctionStore & Actions>()(
	devtools(
		(set, get) => ({
			...initialState,
			getFunctionsOfAppVersion: async (params) => {
				const functions = await FunctionService.getFunctionsOfAppVersion(params);
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
				set({ function: func });
				if (isEmpty(get().logics[func._id])) {
					get().setLogics(func._id, func.logic);
				}
				return func;
			},
			deleteFunction: async (params) => {
				try {
					await FunctionService.deleteFunction(params);
					set((prev) => ({
						functions: prev.functions.filter((func) => func._id !== params.funcId),
					}));
					params.onSuccess && params.onSuccess();
				} catch (err) {
					params.onError && params.onError(err as funcTypes.APIError);
					throw err as funcTypes.APIError;
				}
			},
			deleteMultipleFunctions: async (params) => {
				try {
					await FunctionService.deleteMultipleFunctions(params);
					set((prev) => ({
						functions: prev.functions.filter((func) => !params.functionIds.includes(func._id)),
					}));
					params.onSuccess && params.onSuccess();
				} catch (err) {
					params.onError && params.onError(err as funcTypes.APIError);
					throw err as funcTypes.APIError;
				}
			},
			createFunction: async (params) => {
				try {
					const func = await FunctionService.createFunction(params);
					set((prev) => ({ functions: [func, ...prev.functions] }));
					params.onSuccess && params.onSuccess(func);
					return func;
				} catch (err) {
					params.onError && params.onError(err as funcTypes.APIError);
					throw err as funcTypes.APIError;
				}
			},
			updateFunction: async (params) => {
				try {
					const func = await FunctionService.updateFunction(params);
					set((prev) => ({
						functions: prev.functions.map((f) => (f._id === func._id ? func : f)),
					}));
					params.onSuccess && params.onSuccess();
					return func;
				} catch (err) {
					params.onError && params.onError(err as funcTypes.APIError);
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
					params.onSuccess && params.onSuccess();
					return func;
				} catch (err) {
					params.onError && params.onError(err as funcTypes.APIError);
					throw err as funcTypes.APIError;
				}
			},
			closeEditFunctionDrawer: () => set({ isEditFunctionDrawerOpen: false }),
			openEditFunctionDrawer: (func) => {
				set({ function: func, isEditFunctionDrawerOpen: true });
			},

			setLogics: (id, logic) => set((prev) => ({ logics: { ...prev.logics, [id]: logic } })),
			deleteLogic: (id) => {
				const { [id]: _, ...rest } = get().logics;
				set({ logics: rest });
			},
			reset: () => set(initialState),
		}),
		{
			name: 'function-store',
			storage: CustomStateStorage,
		},
	),
);

export default useFunctionStore;