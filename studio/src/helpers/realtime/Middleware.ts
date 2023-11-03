import useMiddlewareStore from '@/store/middleware/middlewareStore';
import useTabStore from '@/store/version/tabStore';
import { Middleware as MiddlewareType, RealtimeActionParams } from '@/types';
import { RealtimeActions } from './RealtimeActions';

export default class Middleware extends RealtimeActions<MiddlewareType> {
	delete({ identifiers }: RealtimeActionParams<MiddlewareType>): void {
		const { removeTabByPath } = useTabStore.getState();
		useMiddlewareStore.setState?.({
			middlewares: useMiddlewareStore
				.getState?.()
				.middlewares.filter((middleware) => middleware._id !== identifiers.middlewareId),
		});
		removeTabByPath(identifiers.versionId as string, identifiers.middlewareId as string);
	}
	update({ data }: RealtimeActionParams<MiddlewareType>): void {
		const { updateTab } = useTabStore.getState();
		updateTab({
			versionId: data.versionId,
			tab: {
				title: data.name,
			},
			filter: (tab) => tab.path.includes(data._id),
		});
		useMiddlewareStore.setState?.({
			middlewares: useMiddlewareStore.getState?.().middlewares.map((middleware) => {
				if (middleware._id === data._id) {
					return data;
				}
				return middleware;
			}),
			middleware: data,
		});
	}
	create({ data }: RealtimeActionParams<MiddlewareType>): void {
		useMiddlewareStore.setState?.({
			middlewares: [data, ...useMiddlewareStore.getState().middlewares],
		});
	}
	telemetry(param: RealtimeActionParams<MiddlewareType>): void {
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
