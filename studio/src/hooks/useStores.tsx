import useCacheStore from '@/store/cache/cacheStore';
import useDatabaseStore from '@/store/database/databaseStore';
import useEndpointStore from '@/store/endpoint/endpointStore';
import useFunctionStore from '@/store/function/functionStore';
import useMiddlewareStore from '@/store/middleware/middlewareStore';
import useMessageQueueStore from '@/store/queue/messageQueueStore';
import useStorageStore from '@/store/storage/storageStore';
import useTaskStore from '@/store/task/taskStore';
import { TabTypes } from '@/types';

export default function useStores() {
	const { caches } = useCacheStore();
	const { tasks } = useTaskStore();
	const { databases } = useDatabaseStore();
	const { endpoints } = useEndpointStore();
	const { functions } = useFunctionStore();
	const { queues } = useMessageQueueStore();
	const { middlewares } = useMiddlewareStore();
	const { storages } = useStorageStore();

	const STORES: Record<string, any> = {
		[TabTypes.Cache]: useCacheStore(),
		[TabTypes.Task]: useTaskStore(),
		[TabTypes.Database]: useDatabaseStore(),
		[TabTypes.Endpoint]: useEndpointStore(),
		[TabTypes.Function]: useFunctionStore(),
		[TabTypes.MessageQueue]: useMessageQueueStore(),
		[TabTypes.Middleware]: useMiddlewareStore(),
		[TabTypes.Storage]: useStorageStore(),
	};

	const data: Record<string, any[]> = {
		[TabTypes.Cache]: structuredClone(caches),
		[TabTypes.Task]: structuredClone(tasks),
		[TabTypes.Database]: structuredClone(databases),
		[TabTypes.Endpoint]: structuredClone(endpoints),
		[TabTypes.Function]: structuredClone(functions),
		[TabTypes.MessageQueue]: structuredClone(queues),
		[TabTypes.Middleware]: structuredClone(middlewares),
		[TabTypes.Storage]: structuredClone(storages),
	};

	function getFunction(type: TabTypes, name: string) {
		return STORES[type][name];
	}

	return { getFunction, data, STORES };
}
