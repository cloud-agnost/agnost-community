import { create } from '@/helpers';
import { MiddlewareService } from '@/services';
import {
	APIError,
	CreateMiddlewareParams,
	DeleteMiddlewareParams,
	DeleteMultipleMiddlewares,
	GetMiddlewareByIdParams,
	GetModulesRequest,
	Middleware,
	SaveMiddlewareCodeParams,
	UpdateMiddlewareParams,
} from '@/types';
import { devtools } from 'zustand/middleware';

interface MiddlewareStore {
	middlewares: Middleware[];
	middleware: Middleware;
	isEditMiddlewareDrawerOpen: boolean;
	lastFetchedCount: number;
	lastFetchedPage: number;
	editedLogic: string;
}

type Actions = {
	getMiddlewaresOfAppVersion: (params: GetModulesRequest) => Promise<Middleware[]>;
	getMiddlewareById: (params: GetMiddlewareByIdParams) => Promise<Middleware>;
	deleteMiddleware: (params: DeleteMiddlewareParams) => Promise<void>;
	deleteMultipleMiddlewares: (params: DeleteMultipleMiddlewares) => Promise<void>;
	createMiddleware: (params: CreateMiddlewareParams) => Promise<Middleware>;
	updateMiddleware: (params: UpdateMiddlewareParams) => Promise<Middleware>;
	saveMiddlewareCode: (params: SaveMiddlewareCodeParams) => Promise<Middleware>;
	openEditMiddlewareDrawer: (middleware: Middleware) => void;
	closeEditMiddlewareDrawer: () => void;
	setEditedLogic: (logic: string) => void;
	reset: () => void;
};

const initialState: MiddlewareStore = {
	middlewares: [],
	middleware: {} as Middleware,
	lastFetchedCount: 0,
	lastFetchedPage: 1,
	isEditMiddlewareDrawerOpen: false,
	editedLogic: '',
};

const useMiddlewareStore = create<MiddlewareStore & Actions>()(
	devtools((set) => ({
		...initialState,
		createMiddleware: async (params: CreateMiddlewareParams) => {
			try {
				const middleware = await MiddlewareService.createMiddleware(params);
				set((prev) => ({ middlewares: [middleware, ...prev.middlewares] }));
				if (params.onSuccess) {
					params.onSuccess(middleware);
				}
				return middleware;
			} catch (e) {
				const error = e as APIError;
				if (params.onError) params.onError(error);
				throw e;
			}
		},
		getMiddlewaresOfAppVersion: async (params: GetModulesRequest) => {
			const middlewares = await MiddlewareService.getMiddlewaresOfAppVersion(params);

			if (params.page === 0) {
				set({ middlewares, lastFetchedCount: middlewares.length });
			} else {
				set((prev) => ({
					middlewares: [...prev.middlewares, ...middlewares],
					lastFetchedCount: middlewares.length,
				}));
			}
			set({ lastFetchedCount: middlewares.length, lastFetchedPage: params.page });
			return middlewares;
		},
		getMiddlewareById: async (params: GetMiddlewareByIdParams) => {
			const middleware = await MiddlewareService.getMiddlewareById(params);
			set({ middleware, editedLogic: middleware.logic });
			return middleware;
		},
		deleteMiddleware: async (params: DeleteMiddlewareParams) => {
			try {
				await MiddlewareService.deleteMiddleware(params);
				set((prev) => ({
					middlewares: prev.middlewares.filter((mw) => mw._id !== params.mwId),
				}));
				if (params.onSuccess) params.onSuccess();
			} catch (e) {
				const error = e as APIError;
				if (params.onError) params.onError(error);
				throw e;
			}
		},
		deleteMultipleMiddlewares: async (params: DeleteMultipleMiddlewares) => {
			await MiddlewareService.deleteMultipleMiddlewares(params);
			set((prev) => ({
				middlewares: prev.middlewares.filter((mw) => !params.middlewareIds.includes(mw._id)),
			}));
		},
		updateMiddleware: async (params: UpdateMiddlewareParams) => {
			const middleware = await MiddlewareService.updateMiddleware(params);
			set((prev) => ({
				middlewares: prev.middlewares.map((mw) => (mw._id === params.mwId ? middleware : mw)),
			}));
			return middleware;
		},
		saveMiddlewareCode: async (params: SaveMiddlewareCodeParams) => {
			try {
				const middleware = await MiddlewareService.saveMiddlewareCode(params);
				set((prev) => ({
					middlewares: prev.middlewares.map((mw) => (mw._id === params.mwId ? middleware : mw)),
					middleware,
					editedLogic: middleware.logic,
				}));
				if (params.onSuccess) params.onSuccess(middleware);
				return middleware;
			} catch (error) {
				if (params.onError) params.onError(error as APIError);
				throw error;
			}
		},
		setEditedLogic: (logic) => {
			set({ editedLogic: logic });
		},
		openEditMiddlewareDrawer: (middleware) => {
			set({ isEditMiddlewareDrawerOpen: true, middleware });
		},
		closeEditMiddlewareDrawer: () => {
			set({ isEditMiddlewareDrawerOpen: false });
		},
		reset: () => set(initialState),
	})),
);

export default useMiddlewareStore;
