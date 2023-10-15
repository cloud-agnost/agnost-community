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
			middlewares: [...useMiddlewareStore.getState().middlewares, data],
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
