import useCacheStore from '@/store/cache/cacheStore';
import useTabStore from '@/store/version/tabStore';
import useVersionStore from '@/store/version/versionStore';
import { Cache as CacheType, RealtimeActionParams } from '@/types';
import { RealtimeActions } from './RealtimeActions';
class Cache implements RealtimeActions<CacheType> {
	delete({ identifiers }: RealtimeActionParams<CacheType>): void {
		const { removeTabByPath } = useTabStore.getState();
		useCacheStore.setState?.({
			caches: useCacheStore
				.getState?.()
				.caches.filter((cache) => cache._id !== identifiers.cacheId),
		});
		removeTabByPath(identifiers.versionId as string, identifiers.cacheId as string);
		useVersionStore.setState?.((state) => ({
			dashboard: {
				...state.dashboard,
				cache: state.dashboard.cache - 1,
			},
		}));
	}
	update({ data }: RealtimeActionParams<CacheType>): void {
		const { updateTab } = useTabStore.getState();
		useCacheStore.setState?.({
			caches: useCacheStore.getState?.().caches.map((cache) => {
				if (cache._id === data._id) {
					return data;
				}
				return cache;
			}),
			cache: data,
		});
		updateTab({
			versionId: data.versionId as string,
			tab: {
				title: data.name,
			},
			filter: (tab) => tab.path.includes(data._id as string),
		});
	}
	create({ data }: RealtimeActionParams<CacheType>): void {
		useCacheStore.setState?.({
			caches: [...useCacheStore.getState().caches, data],
		});
		useVersionStore.setState?.((state) => ({
			dashboard: {
				...state.dashboard,
				cache: state.dashboard.cache + 1,
			},
		}));
	}
	telemetry(param: RealtimeActionParams<CacheType>): void {
		this.update(param);
	}
}
export default Cache;
