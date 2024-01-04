import StorageService from '@/services/StorageService';
import {
	APIError,
	Bucket,
	BucketCountInfo,
	BucketFile,
	CreateBucketParams,
	CreateStorageParams,
	DeleteBucketParams,
	DeleteFileFromBucketParams,
	DeleteMultipleBucketParams,
	DeleteMultipleFilesFromBucketParams,
	DeleteMultipleStoragesParams,
	DeleteStorageParams,
	GetFilesParams,
	GetStorageBuckets,
	GetStorageByIdParams,
	GetStoragesParams,
	ReplaceFileInBucket,
	Storage,
	UpdateBucketParams,
	UpdateFileInBucketParams,
	UpdateStorageParams,
	UploadFileToBucketParams,
} from '@/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
export interface StorageStore {
	storages: Storage[];
	storage: Storage;
	bucket: Bucket;
	buckets: Bucket[];
	files: BucketFile[];
	file: BucketFile;
	fileCountInfo: BucketCountInfo | undefined;
	lastFetchedPage: number | undefined;
	toDeleteStorage: Storage | null;
	isStorageDeleteDialogOpen: boolean;
	isEditFileDialogOpen: boolean;
	isEditStorageDialogOpen: boolean;
	isEditBucketDialogOpen: boolean;
	isBucketDeleteDialogOpen: boolean;
	toDeleteBucket: Bucket | null;
	bucketCountInfo: BucketCountInfo | undefined;
	uploadProgress: number;
}

type Actions = {
	openDeleteStorageDialog: (storage: Storage) => void;
	closeStorageDeleteDialog: () => void;
	openDeleteBucketDialog: (bucket: Bucket) => void;
	closeBucketDeleteDialog: () => void;
	openEditBucketDialog: (bucket: Bucket) => void;
	closeEditBucketDialog: () => void;
	openEditStorageDialog: (storage: Storage) => void;
	openFileEditDialog: (file: BucketFile) => void;
	closeFileEditDialog: () => void;
	closeEditStorageDialog: () => void;
	createStorage: (storage: CreateStorageParams) => Promise<Storage>;
	getStorageById: (storage: GetStorageByIdParams) => Promise<Storage>;
	getStorages: (storage: GetStoragesParams) => Promise<Storage[]>;
	deleteStorage: (storage: DeleteStorageParams) => Promise<void>;
	deleteMultipleStorages: (storage: DeleteMultipleStoragesParams) => Promise<void>;
	updateStorage: (storage: UpdateStorageParams) => Promise<Storage>;
	getBuckets: (req: GetStorageBuckets) => Promise<Bucket[]>;
	getBucket: (req: DeleteBucketParams) => Promise<Bucket>;
	createBucket: (req: CreateBucketParams) => Promise<Bucket>;
	deleteBucket: (req: DeleteBucketParams) => Promise<void>;
	emptyBucket: (req: DeleteBucketParams) => Promise<void>;
	deleteMultipleBuckets: (req: DeleteMultipleBucketParams) => Promise<void>;
	updateBucket: (req: UpdateBucketParams) => Promise<Bucket>;
	getFilesOfBucket: (req: GetFilesParams) => Promise<BucketFile[]>;
	uploadFileToBucket: (req: UploadFileToBucketParams) => Promise<BucketFile[]>;
	deleteFileFromBucket: (req: DeleteFileFromBucketParams) => Promise<void>;
	deleteMultipleFileFromBucket: (req: DeleteMultipleFilesFromBucketParams) => Promise<void>;
	replaceFileInBucket: (req: ReplaceFileInBucket) => Promise<BucketFile>;
	copyFileInBucket: (req: DeleteFileFromBucketParams) => Promise<BucketFile>;
	updateFileInBucket: (req: UpdateFileInBucketParams) => Promise<BucketFile>;
	reset: () => void;
};

const initialState: StorageStore = {
	storages: [],
	storage: {} as Storage,
	bucket: {} as Bucket,
	buckets: [],
	bucketCountInfo: undefined,
	lastFetchedPage: undefined,
	toDeleteStorage: null,
	isStorageDeleteDialogOpen: false,
	isEditStorageDialogOpen: false,
	isEditBucketDialogOpen: false,
	isBucketDeleteDialogOpen: false,
	toDeleteBucket: null,
	files: [],
	file: {} as BucketFile,
	fileCountInfo: undefined,
	uploadProgress: 0,
	isEditFileDialogOpen: false,
};

const useStorageStore = create<StorageStore & Actions>()(
	devtools((set, get) => ({
		...initialState,
		openDeleteStorageDialog: (storage: Storage) => {
			set({ toDeleteStorage: storage, isStorageDeleteDialogOpen: true });
		},
		closeStorageDeleteDialog: () => {
			set({ toDeleteStorage: null, isStorageDeleteDialogOpen: false });
		},
		openDeleteBucketDialog: (bucket: Bucket) => {
			set({ toDeleteBucket: bucket, isBucketDeleteDialogOpen: true });
		},
		closeBucketDeleteDialog: () => {
			set({ toDeleteBucket: null, isBucketDeleteDialogOpen: false });
		},
		createStorage: async (params: CreateStorageParams) => {
			try {
				const createdStorage = await StorageService.createStorage(params);
				set({ storages: [createdStorage, ...get().storages] });
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
			if (params.page === 0) {
				set({ storages, lastFetchedPage: params.page });
			} else {
				set((prev) => ({
					storages: [...prev.storages, ...storages],
					lastFetchedPage: params.page,
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
					storages: get().storages.filter((storage) => !params.storageIds.includes(storage._id)),
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
		openEditBucketDialog: (bucket: Bucket) => {
			set({ bucket, isEditBucketDialogOpen: true });
		},
		closeEditBucketDialog: () => {
			set({ bucket: {} as Bucket, isEditBucketDialogOpen: false });
		},
		openFileEditDialog: (file: BucketFile) => {
			set({ file, isEditFileDialogOpen: true });
		},
		closeFileEditDialog: () => {
			set({ file: {} as BucketFile, isEditFileDialogOpen: false });
		},
		getBuckets: async (params: GetStorageBuckets) => {
			const buckets = await StorageService.getStorageBuckets(params);
			if (buckets.info.currentPage === 1) {
				set({ buckets: buckets.data, bucketCountInfo: buckets.info, files: [] });
			} else {
				set((prev) => ({
					buckets: [...prev.buckets, ...buckets.data],
					bucketCountInfo: buckets.info,
				}));
			}
			return buckets.data;
		},
		getBucket: async (params: DeleteBucketParams) => {
			const bucket = await StorageService.getBucket(params);
			set({ bucket });
			return bucket;
		},
		createBucket: async (params: CreateBucketParams) => {
			try {
				const createdBucket = await StorageService.createBucket(params);
				set({ buckets: [createdBucket, ...get().buckets] });
				params.onSuccess?.();
				return createdBucket;
			} catch (error) {
				params.onError?.(error as APIError);
				throw error as APIError;
			}
		},
		deleteBucket: async (params: DeleteBucketParams) => {
			try {
				await StorageService.deleteBucket(params);
				set({
					buckets: get().buckets.filter((bucket) => bucket.name !== params.bucketName),
				});
				params.onSuccess?.();
			} catch (error) {
				params.onError?.(error as APIError);
				throw error as APIError;
			}
		},
		emptyBucket: async (params: DeleteBucketParams) => {
			try {
				await StorageService.emptyBucket(params);
				params.onSuccess?.();
			} catch (error) {
				params.onError?.(error as APIError);
				throw error as APIError;
			}
		},
		deleteMultipleBuckets: async (params: DeleteMultipleBucketParams) => {
			try {
				await StorageService.deleteMultipleBuckets(params);
				set({
					buckets: get().buckets.filter(
						(bucket) => !params.deletedBuckets.find((bck) => bck.name === bucket.name),
					),
				});
				params.onSuccess?.();
			} catch (error) {
				params.onError?.(error as APIError);
				throw error as APIError;
			}
		},
		updateBucket: async (params: UpdateBucketParams) => {
			try {
				const bucket = await StorageService.updateBucket(params);
				set((prev) => ({
					buckets: prev.buckets.map((b) => (b.id === bucket.id ? bucket : b)),
					bucket,
				}));
				params.onSuccess?.();
				return bucket;
			} catch (error) {
				params.onError?.(error as APIError);
				throw error as APIError;
			}
		},
		getFilesOfBucket: async (params: GetFilesParams) => {
			const files = await StorageService.getFilesOfBucket(params);
			if (files.info.currentPage === 1) {
				set({ files: files.data, fileCountInfo: files.info });
			} else {
				set((prev) => ({
					files: [...prev.files, ...files.data],
					fileCountInfo: files.info,
				}));
			}
			return files.data;
		},
		uploadFileToBucket: async (params: UploadFileToBucketParams) => {
			try {
				const newFiles = await StorageService.uploadFileToBucket(params);
				set({ files: [...newFiles, ...get().files] });
				params.onSuccess?.();
				return newFiles;
			} catch (error) {
				params.onError?.(error as APIError);
				throw error as APIError;
			}
		},
		deleteFileFromBucket: async (params: DeleteFileFromBucketParams) => {
			try {
				await StorageService.deleteFileFromBucket(params);
				set({
					files: get().files.filter((file) => file.path !== params.filePath),
				});
				params.onSuccess?.();
			} catch (error) {
				params.onError?.(error as APIError);
				throw error as APIError;
			}
		},
		deleteMultipleFileFromBucket: async (params: DeleteMultipleFilesFromBucketParams) => {
			try {
				await StorageService.deleteMultipleFilesFromBucket(params);
				set({
					files: get().files.filter((file) => !params.filePaths.includes(file.path)),
				});
				params.onSuccess?.();
			} catch (error) {
				params.onError?.(error as APIError);
				throw error as APIError;
			}
		},
		replaceFileInBucket: async (params: ReplaceFileInBucket) => {
			try {
				const file = await StorageService.replaceFileInBucket(params);
				set({
					files: get().files.map((f) => (f.path === file.path ? file : f)),
					file,
				});
				params.onSuccess?.();
				return file;
			} catch (error) {
				params.onError?.(error as APIError);
				throw error as APIError;
			}
		},
		copyFileInBucket: async (params: DeleteFileFromBucketParams) => {
			try {
				const file = await StorageService.copyFileInBucket(params);
				set({ files: [file, ...get().files] });
				params.onSuccess?.();
				return file;
			} catch (error) {
				params.onError?.(error as APIError);
				throw error as APIError;
			}
		},
		updateFileInBucket: async (params: UpdateFileInBucketParams) => {
			try {
				const file = await StorageService.updateFileInBucket(params);

				set({
					files: get().files.map((f) => (f.id === file.id ? file : f)),
					file,
				});
				params.onSuccess?.();
				return file;
			} catch (error) {
				params.onError?.(error as APIError);
				throw error as APIError;
			}
		},
		reset: () => set(initialState),
	})),
);

export default useStorageStore;
