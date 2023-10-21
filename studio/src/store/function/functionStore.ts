import { CustomStateStorage } from '@/helpers';
import { FunctionService } from '@/services';
import * as funcTypes from '@/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
interface FunctionStore {
	functions: funcTypes.HelperFunction[];
	function: funcTypes.HelperFunction;
	isEditFunctionDrawerOpen: boolean;
	lastFetchedCount: number;
	toDeleteFunction: funcTypes.HelperFunction;
	isDeleteFunctionModalOpen: boolean;
	editedLogic: string;
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
	openDeleteFunctionModal: (func: funcTypes.HelperFunction) => void;
	closeDeleteFunctionModal: () => void;
	setEditedLogic: (logic: string) => void;
}

const useFunctionStore = create<FunctionStore>()(
	devtools(
		persist(
			(set) => ({
				functions: [],
				function: {} as funcTypes.HelperFunction,
				lastFetchedCount: 0,
				editedLogic: '',
				isEditFunctionDrawerOpen: false,
				toDeleteFunction: {} as funcTypes.HelperFunction,
				isDeleteFunctionModalOpen: false,
				getFunctionsOfAppVersion: async (params) => {
					const functions = await FunctionService.getFunctionsOfAppVersion(params);
					if (params.page === 0) {
						set({ functions });
					} else {
						set((prev) => ({ functions: [...prev.functions, ...functions] }));
					}
					set({ lastFetchedCount: functions.length });
					return functions;
				},
				getFunctionById: async (params) => {
					const func = await FunctionService.getFunctionById(params);
					set({ function: func });
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
				openDeleteFunctionModal: (func) => {
					set({ toDeleteFunction: func, isDeleteFunctionModalOpen: true });
				},
				closeDeleteFunctionModal: () => {
					set({ isDeleteFunctionModalOpen: false });
				},
				setEditedLogic: (logic) => {
					set({ editedLogic: logic });
				},
			}),
			{
				name: 'function-store',
				storage: CustomStateStorage,
			},
		),
	),
);

export default useFunctionStore;
