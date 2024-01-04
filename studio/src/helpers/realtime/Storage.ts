import useStorageStore from '@/store/storage/storageStore';
import useTabStore from '@/store/version/tabStore';
import { RealtimeActionParams, Storage as StorageType } from '@/types';
import { RealtimeActions } from './RealtimeActions';
import useVersionStore from '@/store/version/versionStore';

class Storage implements RealtimeActions<StorageType> {
	delete({ identifiers }: RealtimeActionParams<StorageType>): void {
		const { removeTabByPath } = useTabStore.getState();
		useStorageStore.setState?.({
			storages: useStorageStore
				.getState?.()
				.storages.filter((storage) => storage._id !== identifiers.storageId),
		});
		removeTabByPath(identifiers.versionId as string, identifiers.storageId as string);
		useVersionStore.setState?.((state) => ({
			dashboard: {
				...state.dashboard,
				storage: state.dashboard.storage - 1,
			},
		}));
	}
	update({ data }: RealtimeActionParams<StorageType>): void {
		const { updateTab } = useTabStore.getState();
		updateTab({
			versionId: data.versionId as string,
			tab: {
				title: data.name,
			},
			filter: (tab) => tab.path.includes(data._id as string),
		});
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
			storages: [data, ...useStorageStore.getState().storages],
		});
		useVersionStore.setState?.((state) => ({
			dashboard: {
				...state.dashboard,
				storage: state.dashboard.storage + 1,
			},
		}));
	}
	telemetry(param: RealtimeActionParams<StorageType>): void {
		this.update(param);
	}
}

export default Storage;
