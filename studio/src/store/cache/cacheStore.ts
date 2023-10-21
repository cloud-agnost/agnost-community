import { CustomStateStorage } from '@/helpers';
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
import { devtools, persist } from 'zustand/middleware';

interface CacheStore {
	caches: Cache[];
	cache: Cache;
	loading: boolean;
	error: APIError | null;
	isEditCacheModalOpen: boolean;
	toDeleteCache: Cache;
	isDeleteCacheModalOpen: boolean;
	lastFetchedCount: number;
	getCaches: (params: GetCachesOfAppVersionParams) => Promise<void>;
	getCacheById: (params: GetCacheByIdParams) => Promise<void>;
	createCache: (params: CreateCacheParams) => Promise<void>;
	updateCache: (params: UpdateCacheParams) => Promise<void>;
	deleteCache: (params: DeleteCacheParams) => Promise<void>;
	deleteMultipleCache: (params: DeleteMultipleCachesParams) => Promise<void>;
	openEditCacheModal: (cache: Cache) => void;
	closeEditCacheModal: () => void;
	openDeleteCacheModal: (cache: Cache) => void;
	closeDeleteCacheModal: () => void;
}

const useCacheStore = create<CacheStore>()(
	devtools(
		persist(
			(set, get) => ({
				caches: [],
				cache: {} as Cache,
				loading: false,
				error: null,
				isEditCacheModalOpen: false,
				toDeleteCache: {} as Cache,
				isDeleteCacheModalOpen: false,
				lastFetchedCount: 0,
				getCaches: async (params: GetCachesOfAppVersionParams) => {
					try {
						const caches = await CacheService.getCaches(params);
						if (params.page === 0) {
							set({ caches, lastFetchedCount: caches.length });
						} else {
							set({ caches: [...get().caches, ...caches], lastFetchedCount: caches.length });
						}
						set({ lastFetchedCount: caches.length });
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
			}),
			{
				name: 'cache-store',
				storage: CustomStateStorage,
			},
		),
	),
);
export default useCacheStore;
