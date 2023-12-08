import useCacheStore from '@/store/cache/cacheStore';
import useTabStore from '@/store/version/tabStore';
import { Cache as CacheType, RealtimeActionParams } from '@/types';
import { RealtimeActions } from './RealtimeActions';
class Cache extends RealtimeActions<CacheType> {
	accept(): void {
		throw new Error('Method not implemented.');
	}
	delete({ identifiers }: RealtimeActionParams<CacheType>): void {
		const { removeTabByPath } = useTabStore.getState();
		useCacheStore.setState?.({
			caches: useCacheStore
				.getState?.()
				.caches.filter((cache) => cache._id !== identifiers.cacheId),
		});
		removeTabByPath(identifiers.versionId as string, identifiers.cacheId as string);
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
	}
	telemetry(param: RealtimeActionParams<CacheType>): void {
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
export default Cache;
