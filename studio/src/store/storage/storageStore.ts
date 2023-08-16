import StorageService from '@/services/StorageService';
import {
	APIError,
	CreateStorageParams,
	DeleteMultipleStoragesParams,
	DeleteStorageParams,
	GetStorageByIdParams,
	GetStoragesParams,
	Storage,
	UpdateStorageParams,
} from '@/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
export interface StorageStore {
	storages: Storage[];
	storage: Storage;
	lastFetchedCount: number;
	toDeleteStorage: Storage | null;
	isStorageDeleteDialogOpen: boolean;
	isEditStorageDialogOpen: boolean;
	openDeleteStorageDialog: (storage: Storage) => void;
	closeStorageDeleteDialog: () => void;
	openEditStorageDialog: (storage: Storage) => void;
	closeEditStorageDialog: () => void;
	createStorage: (storage: CreateStorageParams) => Promise<Storage>;
	getStorageById: (storage: GetStorageByIdParams) => Promise<Storage>;
	getStorages: (storage: GetStoragesParams) => Promise<Storage[]>;
	deleteStorage: (storage: DeleteStorageParams) => Promise<void>;
	deleteMultipleStorages: (storage: DeleteMultipleStoragesParams) => Promise<void>;
	updateStorage: (storage: UpdateStorageParams) => Promise<Storage>;
}

const useStorageStore = create<StorageStore>()(
	devtools(
		persist(
			(set, get) => ({
				storages: [],
				storage: {} as Storage,
				lastFetchedCount: 0,
				toDeleteStorage: null,
				isStorageDeleteDialogOpen: false,
				isEditStorageDialogOpen: false,
				openDeleteStorageDialog: (storage: Storage) => {
					set({ toDeleteStorage: storage, isStorageDeleteDialogOpen: true });
				},
				closeStorageDeleteDialog: () => {
					set({ toDeleteStorage: null, isStorageDeleteDialogOpen: false });
				},
				createStorage: async (params: CreateStorageParams) => {
					try {
						const createdStorage = await StorageService.createStorage(params);
						set({ storages: [...get().storages, createdStorage] });
						params.onSuccess?.();
						return createdStorage;
					} catch (error) {
						params.onError?.(error as APIError);
						throw error as APIError;
					}
				},
				getStorageById: async (params: GetStorageByIdParams) => {
					const storage = await StorageService.getStorage(params);
					set({ storage });
					return storage;
				},
				getStorages: async (params: GetStoragesParams) => {
					const storages = await StorageService.getStorages(params);
					if (params.initialFetch) {
						set({ storages, lastFetchedCount: storages.length });
					} else {
						set((prev) => ({
							storages: [...prev.storages, ...storages],
							lastFetchedCount: storages.length,
						}));
					}

					return storages;
				},
				deleteStorage: async (params: DeleteStorageParams) => {
					try {
						await StorageService.deleteStorage(params);
						set({
							storages: get().storages.filter((storage) => storage._id !== params.storageId),
						});
						params.onSuccess?.();
					} catch (error) {
						params.onError?.(error as APIError);
						throw error as APIError;
					}
				},
				deleteMultipleStorages: async (params: DeleteMultipleStoragesParams) => {
					try {
						await StorageService.deleteMultipleStorage(params);
						set({
							storages: get().storages.filter(
								(storage) => !params.storageIds.includes(storage._id),
							),
						});
						params.onSuccess?.();
					} catch (error) {
						params.onError?.(error as APIError);
						throw error as APIError;
					}
				},
				updateStorage: async (params: UpdateStorageParams) => {
					try {
						const updatedStorage = await StorageService.updateStorage(params);
						set({
							storages: get().storages.map((storage) => {
								if (storage._id === updatedStorage._id) return updatedStorage;
								return storage;
							}),
						});
						params.onSuccess?.();
						return updatedStorage;
					} catch (error) {
						params.onError?.(error as APIError);
						throw error as APIError;
					}
				},
				openEditStorageDialog: (storage: Storage) => {
					set({ storage, isEditStorageDialogOpen: true });
				},
				closeEditStorageDialog: () => {
					set({ storage: {} as Storage, isEditStorageDialogOpen: false });
				},
			}),
			{ name: 'storage-store' },
		),
	),
);

export default useStorageStore;
