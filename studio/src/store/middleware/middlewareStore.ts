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
import { isEmpty } from '@/utils';
import { devtools } from 'zustand/middleware';

interface MiddlewareStore {
	middlewares: Middleware[];
	middleware: Middleware;
	isEditMiddlewareDrawerOpen: boolean;
	lastFetchedPage: number;
	logics: Record<string, string>;
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
	setLogics: (id: string, logic: string) => void;
	deleteLogic: (id: string) => void;
	reset: () => void;
};

const initialState: MiddlewareStore = {
	middlewares: [],
	middleware: {} as Middleware,
	lastFetchedPage: 0,
	isEditMiddlewareDrawerOpen: false,
	logics: {},
};

const useMiddlewareStore = create<MiddlewareStore & Actions>()(
	devtools((set, get) => ({
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
				set({ middlewares });
			} else {
				set((prev) => ({
					middlewares: [...prev.middlewares, ...middlewares],
					lastFetchedPage: params.page,
				}));
			}

			return middlewares;
		},
		getMiddlewareById: async (params: GetMiddlewareByIdParams) => {
			const middleware = await MiddlewareService.getMiddlewareById(params);
			set({ middleware });
			if (isEmpty(get().logics[middleware._id])) {
				get().setLogics(middleware._id, middleware.logic);
			}
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
		openEditMiddlewareDrawer: (middleware) => {
			set({ isEditMiddlewareDrawerOpen: true, middleware });
		},
		closeEditMiddlewareDrawer: () => {
			set({ isEditMiddlewareDrawerOpen: false });
		},
		setLogics: (id, logic) => set((prev) => ({ logics: { ...prev.logics, [id]: logic } })),
		deleteLogic: (id) => {
			const { [id]: _, ...rest } = get().logics;
			set({ logics: rest });
		},
		reset: () => set(initialState),
	})),
);

export default useMiddlewareStore;
