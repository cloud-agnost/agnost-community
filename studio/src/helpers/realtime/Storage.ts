import useStorageStore from '@/store/storage/storageStore';
import useTabStore from '@/store/version/tabStore';
import { RealtimeActionParams, Storage as StorageType } from '@/types';
import { RealtimeActions } from './RealtimeActions';

class Storage extends RealtimeActions<StorageType> {
	delete({ identifiers }: RealtimeActionParams<StorageType>): void {
		const { removeTabByPath } = useTabStore.getState();
		useStorageStore.setState?.({
			storages: useStorageStore
				.getState?.()
				.storages.filter((storage) => storage._id !== identifiers.storageId),
		});
		removeTabByPath(identifiers.versionId as string, identifiers.storageId as string);
	}
	update({ data }: RealtimeActionParams<StorageType>): void {
		useStorageStore.setState?.({
			storages: useStorageStore.getState?.().storages.map((storage) => {
				if (storage._id === data._id) {
					return data;
				}
				return storage;
			}),
			storage: data,
		});
	}
	create({ data }: RealtimeActionParams<StorageType>): void {
		useStorageStore.setState?.({
			storages: [...useStorageStore.getState().storages, data],
		});
	}
	telemetry(param: RealtimeActionParams<StorageType>): void {
		this.update(param);
	}
	log(): void {
		throw new Error('Method not implemented.');
	}
	deploy(): void {
		throw new Error('Method not implemented.');
	}
	redeploy(): void {
		throw new Error('Method not implemented.');
	}
}

export default Storage;
