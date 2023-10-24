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
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface MiddlewareStore {
	middlewares: Middleware[];
	middleware: Middleware | null;
	editMiddlewareDrawerIsOpen: boolean;
	lastFetchedCount: number;
	getMiddlewaresOfAppVersion: (params: GetMiddlewaresOfAppVersionParams) => Promise<Middleware[]>;
	getMiddlewareById: (params: GetMiddlewareByIdParams) => Promise<Middleware>;
	deleteMiddleware: (params: DeleteMiddlewareParams) => Promise<void>;
	deleteMultipleMiddlewares: (params: DeleteMultipleMiddlewares) => Promise<void>;
	createMiddleware: (params: CreateMiddlewareParams) => Promise<Middleware>;
	updateMiddleware: (params: UpdateMiddlewareParams) => Promise<Middleware>;
	saveMiddlewareCode: (params: SaveMiddlewareCodeParams) => Promise<Middleware>;
	setEditMiddlewareDrawerIsOpen: (open: boolean) => void;
	setMiddleware: (middleware: Middleware | null) => void;
}

const useMiddlewareStore = create<MiddlewareStore>()(
	devtools(
		persist(
			(set) => ({
				middlewares: [],
				middleware: null,
				lastFetchedCount: 0,
				editMiddlewareDrawerIsOpen: false,
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
					set({ lastFetchedCount: middlewares.length });
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
					const middleware = await MiddlewareService.saveMiddlewareCode(params);
					set((prev) => ({
						middlewares: prev.middlewares.map((mw) => (mw._id === params.mwId ? middleware : mw)),
					}));
					return middleware;
				},
				setEditMiddlewareDrawerIsOpen: (open: boolean) => {
					set({ editMiddlewareDrawerIsOpen: open });
				},
				setMiddleware: (middleware) => {
					set({ middleware });
				},
			}),
			{
				name: 'middleware-storage',
				storage: CustomStateStorage,
			},
		),
		{
			name: 'middleware',
		},
	),
);

export default useMiddlewareStore;
