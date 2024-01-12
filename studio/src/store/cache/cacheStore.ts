import { CacheService } from '@/services';
import {
	APIError,
	Cache,
	CreateCacheParams,
	DeleteCacheParams,
	DeleteMultipleCachesParams,
	GetCacheByIdParams,
	GetCachesOfAppVersionParams,
	UpdateCacheParams,
} from '@/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import useVersionStore from '../version/versionStore';

interface CacheStore {
	caches: Cache[];
	cache: Cache;
	loading: boolean;
	error: APIError | null;
	isCreateCacheModalOpen: boolean;
	isEditCacheModalOpen: boolean;
	toDeleteCache: Cache;
	isDeleteCacheModalOpen: boolean;
	lastFetchedPage: number | undefined;
}

type Actions = {
	getCaches: (params: GetCachesOfAppVersionParams) => Promise<Cache[]>;
	getCacheById: (params: GetCacheByIdParams) => Promise<void>;
	createCache: (params: CreateCacheParams) => Promise<void>;
	updateCache: (params: UpdateCacheParams) => Promise<void>;
	deleteCache: (params: DeleteCacheParams) => Promise<void>;
	deleteMultipleCache: (params: DeleteMultipleCachesParams) => Promise<void>;
	openEditCacheModal: (cache: Cache) => void;
	closeEditCacheModal: () => void;
	openDeleteCacheModal: (cache: Cache) => void;
	closeDeleteCacheModal: () => void;
	toggleCreateCacheModal: () => void;
	reset: () => void;
};

const initialState: CacheStore = {
	caches: [],
	cache: {} as Cache,
	loading: false,
	error: null,
	isEditCacheModalOpen: false,
	toDeleteCache: {} as Cache,
	isDeleteCacheModalOpen: false,
	lastFetchedPage: undefined,
	isCreateCacheModalOpen: false,
};

const useCacheStore = create<CacheStore & Actions>()(
	devtools(
		(set, get) => ({
			...initialState,
			getCaches: async (params: GetCachesOfAppVersionParams) => {
				try {
					const caches = await CacheService.getCaches(params);
					if (params.page === 0) {
						set({ caches, lastFetchedPage: params.page });
					} else {
						set({ caches: [...get().caches, ...caches], lastFetchedPage: params.page });
					}
					return caches;
				} catch (error) {
					throw error as APIError;
				}
			},
			getCacheById: async (params: GetCacheByIdParams) => {
				try {
					const cache = await CacheService.getCacheById(params);
					set({ cache });
				} catch (error) {
					throw error as APIError;
				}
			},
			createCache: async (params: CreateCacheParams) => {
				try {
					const cache = await CacheService.createCache(params);
					set({ caches: [cache, ...get().caches] });
					useVersionStore.setState?.((state) => ({
						dashboard: {
							...state.dashboard,
							cache: state.dashboard.cache + 1,
						},
					}));
					if (params.onSuccess) params.onSuccess(cache);
				} catch (error) {
					if (params.onError) params.onError(error as APIError);
					throw error as APIError;
				}
			},
			updateCache: async (params: UpdateCacheParams) => {
				try {
					const cache = await CacheService.updateCache(params);
					set({
						caches: get().caches.map((c) => (c._id === cache._id ? cache : c)),
						cache,
					});
					if (params.onSuccess) params.onSuccess(cache);
				} catch (error) {
					if (params.onError) params.onError(error as APIError);
					throw error as APIError;
				}
			},
			deleteCache: async (params: DeleteCacheParams) => {
				try {
					await CacheService.deleteCache(params);
					set({
						caches: get().caches.filter((c) => c._id !== params.cacheId),
					});
					if (params.onSuccess) params.onSuccess();
				} catch (error) {
					if (params.onError) params.onError(error as APIError);
					throw error as APIError;
				}
			},
			deleteMultipleCache: async (params: DeleteMultipleCachesParams) => {
				try {
					await CacheService.deleteMultipleCaches(params);
					set({
						caches: get().caches.filter((c) => !params.cacheIds.includes(c._id)),
					});

					if (params.onSuccess) params.onSuccess();
				} catch (error) {
					if (params.onError) params.onError(error as APIError);
					throw error as APIError;
				}
			},
			openEditCacheModal: (cache: Cache) => {
				set({ isEditCacheModalOpen: true, cache });
			},
			closeEditCacheModal: () => {
				set({ isEditCacheModalOpen: false, cache: {} as Cache });
			},
			openDeleteCacheModal: (cache: Cache) => {
				set({ isDeleteCacheModalOpen: true, toDeleteCache: cache });
			},
			closeDeleteCacheModal: () => {
				set({ isDeleteCacheModalOpen: false, toDeleteCache: {} as Cache });
			},
			toggleCreateCacheModal: () =>
				set((prev) => ({ isCreateCacheModalOpen: !prev.isCreateCacheModalOpen })),
			reset: () => set(initialState),
		}),
		{
			name: 'cache',
		},
	),
);
export default useCacheStore;
