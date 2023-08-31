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
import { notify, translate } from '@/utils';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

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
	deleteMiddleware: (params: DeleteMiddlewareParams, showAlert?: boolean) => Promise<void>;
	deleteMultipleMiddlewares: (
		params: DeleteMultipleMiddlewares,
		showAlert?: boolean,
	) => Promise<void>;
	createMiddleware: (params: CreateMiddlewareParams, showAlert?: boolean) => Promise<Middleware>;
	updateMiddleware: (params: UpdateMiddlewareParams, showAlert?: boolean) => Promise<Middleware>;
	saveMiddlewareCode: (
		params: SaveMiddlewareCodeParams,
		showAlert?: boolean,
	) => Promise<Middleware>;
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
				createMiddleware: async (params: CreateMiddlewareParams, showAlert) => {
					try {
						const middleware = await MiddlewareService.createMiddleware(params);
						set((prev) => ({ middlewares: [middleware, ...prev.middlewares] }));
						if (showAlert) {
							notify({
								title: translate('general.success'),
								description: translate('version.middleware.add.success'),
								type: 'success',
							});
						}
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
				deleteMiddleware: async (params: DeleteMiddlewareParams, showAlert) => {
					try {
						await MiddlewareService.deleteMiddleware(params);
						set((prev) => ({
							middlewares: prev.middlewares.filter((mw) => mw._id !== params.mwId),
						}));
						if (showAlert) {
							notify({
								title: translate('general.success'),
								description: translate('version.middleware.delete.success'),
								type: 'success',
							});
						}
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
				deleteMultipleMiddlewares: async (params: DeleteMultipleMiddlewares, showAlert) => {
					try {
						await MiddlewareService.deleteMultipleMiddlewares(params);
						set((prev) => ({
							middlewares: prev.middlewares.filter((mw) => !params.middlewareIds.includes(mw._id)),
						}));
						if (showAlert) {
							notify({
								title: translate('general.success'),
								description: translate('version.middleware.delete.success'),
								type: 'success',
							});
						}
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
				updateMiddleware: async (params: UpdateMiddlewareParams, showAlert) => {
					try {
						const middleware = await MiddlewareService.updateMiddleware(params);
						set((prev) => ({
							middlewares: prev.middlewares.map((mw) => (mw._id === params.mwId ? middleware : mw)),
						}));
						if (showAlert) {
							notify({
								title: translate('general.success'),
								description: translate('version.middleware.edit.success'),
								type: 'success',
							});
						}
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
				saveMiddlewareCode: async (params: SaveMiddlewareCodeParams, showAlert) => {
					const middleware = await MiddlewareService.saveMiddlewareCode(params);
					set((prev) => ({
						middlewares: prev.middlewares.map((mw) => (mw._id === params.mwId ? middleware : mw)),
					}));
					if (showAlert) {
						notify({
							title: translate('general.success'),
							description: translate('version.middleware.edit.success'),
							type: 'success',
						});
					}
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
