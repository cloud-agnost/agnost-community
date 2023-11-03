import { create } from '@/helpers';
import { CustomStateStorage } from '@/helpers/state';
import { MiddlewareService } from '@/services';
import {
	APIError,
	CreateMiddlewareParams,
	DeleteMiddlewareParams,
	DeleteMultipleMiddlewares,
	GetMiddlewareByIdParams,
	GetMiddlewaresOfAppVersionParams,
	Middleware,
	SaveMiddlewareCodeParams,
	UpdateMiddlewareParams,
} from '@/types';
import { devtools, persist } from 'zustand/middleware';

interface MiddlewareStore {
	middlewares: Middleware[];
	middleware: Middleware;
	editMiddlewareDrawerIsOpen: boolean;
	lastFetchedCount: number;
	lastFetchedPage: number;
}

type Actions = {
	getMiddlewaresOfAppVersion: (params: GetMiddlewaresOfAppVersionParams) => Promise<Middleware[]>;
	getMiddlewareById: (params: GetMiddlewareByIdParams) => Promise<Middleware>;
	deleteMiddleware: (params: DeleteMiddlewareParams) => Promise<void>;
	deleteMultipleMiddlewares: (params: DeleteMultipleMiddlewares) => Promise<void>;
	createMiddleware: (params: CreateMiddlewareParams) => Promise<Middleware>;
	updateMiddleware: (params: UpdateMiddlewareParams) => Promise<Middleware>;
	saveMiddlewareCode: (params: SaveMiddlewareCodeParams) => Promise<Middleware>;
	setEditMiddlewareDrawerIsOpen: (open: boolean) => void;
	setMiddleware: (middleware: Middleware) => void;
	reset: () => void;
};

const initialState: MiddlewareStore = {
	middlewares: [],
	middleware: {} as Middleware,
	lastFetchedCount: 0,
	lastFetchedPage: 0,
	editMiddlewareDrawerIsOpen: false,
};

const useMiddlewareStore = create<MiddlewareStore & Actions>()(
	devtools(
		persist(
			(set) => ({
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
				getMiddlewaresOfAppVersion: async (params: GetMiddlewaresOfAppVersionParams) => {
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
					set({ middleware });
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
					try {
						await MiddlewareService.deleteMultipleMiddlewares(params);
						set((prev) => ({
							middlewares: prev.middlewares.filter((mw) => !params.middlewareIds.includes(mw._id)),
						}));
						if (params.onSuccess) params.onSuccess();
					} catch (e) {
						const error = e as APIError;
						if (params.onError) params.onError(error);
						throw e;
					}
				},
				updateMiddleware: async (params: UpdateMiddlewareParams) => {
					try {
						const middleware = await MiddlewareService.updateMiddleware(params);
						set((prev) => ({
							middlewares: prev.middlewares.map((mw) => (mw._id === params.mwId ? middleware : mw)),
						}));
						if (params.onSuccess) params.onSuccess(middleware);
						return middleware;
					} catch (e) {
						const error = e as APIError;
						if (params.onError) params.onError(error);
						throw e;
					}
				},
				saveMiddlewareCode: async (params: SaveMiddlewareCodeParams) => {
					try {
						const middleware = await MiddlewareService.saveMiddlewareCode(params);
						set((prev) => ({
							middlewares: prev.middlewares.map((mw) => (mw._id === params.mwId ? middleware : mw)),
						}));
						if (params.onSuccess) params.onSuccess(middleware);
						return middleware;
					} catch (error) {
						if (params.onError) params.onError(error as APIError);
						throw error;
					}
				},
				setEditMiddlewareDrawerIsOpen: (open: boolean) => set({ editMiddlewareDrawerIsOpen: open }),
				setMiddleware: (middleware) => set({ middleware }),
				reset: () => set(initialState),
			}),
			{
				name: 'middleware-storage',
				storage: CustomStateStorage,
			},
		),
	),
);

export default useMiddlewareStore;
