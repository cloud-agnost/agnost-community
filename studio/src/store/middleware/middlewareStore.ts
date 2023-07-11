import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
	CreateMiddlewareParams,
	DeleteMiddlewareParams,
	DeleteMultipleMiddlewares,
	GetMiddlewareByIdParams,
	GetMiddlewaresOfAppVersionParams,
	Middleware,
	UpdateMiddlewareParams,
	SaveMiddlewareCodeParams,
	APIError,
} from '@/types';
import { MiddlewareService } from '@/services';
import { notify, translate } from '@/utils';

interface MiddlewareStore {
	middlewares: Middleware[];
	middleware: Middleware | null;
	editMiddlewareDrawerIsOpen: boolean;
	lastFetchedCount: number;
	getMiddlewaresOfAppVersion: (
		params: GetMiddlewaresOfAppVersionParams,
		init?: boolean,
	) => Promise<Middleware[]>;
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
						notify({
							title: translate('general.success'),
							description: translate('version.middleware.add.success'),
							type: 'success',
						});
						set((prev) => ({ middlewares: [middleware, ...prev.middlewares] }));
						return middleware;
					} catch (e) {
						const error = e as APIError;
						const errorArray = error.fields ? error.fields : [{ msg: error.details }];
						for (const field of errorArray) {
							notify({
								type: 'error',
								title: error.error,
								description: field.msg,
							});
						}
						throw e;
					}
				},
				getMiddlewaresOfAppVersion: async (
					params: GetMiddlewaresOfAppVersionParams,
					init?: boolean,
				) => {
					const middlewares = await MiddlewareService.getMiddlewaresOfAppVersion(params);
					if (init) {
						set({ middlewares });
					} else {
						set((prev) => ({ middlewares: [...prev.middlewares, ...middlewares] }));
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
						notify({
							title: translate('general.success'),
							description: translate('version.middleware.delete.success'),
							type: 'success',
						});
					} catch (e) {
						const error = e as APIError;
						notify({
							title: error.error,
							description: error.details,
							type: 'error',
						});
						throw e;
					}
				},
				deleteMultipleMiddlewares: async (params: DeleteMultipleMiddlewares) => {
					try {
						await MiddlewareService.deleteMultipleMiddlewares(params);
						set((prev) => ({
							middlewares: prev.middlewares.filter((mw) => !params.middlewareIds.includes(mw._id)),
						}));
						notify({
							title: translate('general.success'),
							description: translate('version.middleware.delete.success'),
							type: 'success',
						});
					} catch (e) {
						const error = e as APIError;
						notify({
							title: error.error,
							description: error.details,
							type: 'error',
						});
						throw e;
					}
				},
				updateMiddleware: async (params: UpdateMiddlewareParams) => {
					try {
						const middleware = await MiddlewareService.updateMiddleware(params);
						console.log({ middleware });
						set((prev) => ({
							middlewares: prev.middlewares.map((mw) => (mw._id === params.mwId ? middleware : mw)),
						}));
						notify({
							title: translate('general.success'),
							description: translate('version.middleware.edit.success'),
							type: 'success',
						});
						return middleware;
					} catch (e) {
						const error = e as APIError;
						notify({
							title: error.error,
							description: error.details,
							type: 'error',
						});
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
			},
		),
		{
			name: 'middleware',
		},
	),
);

export default useMiddlewareStore;
