import useMiddlewareStore from '@/store/middleware/middlewareStore';
import useTabStore from '@/store/version/tabStore';
import useVersionStore from '@/store/version/versionStore';
import { Middleware as MiddlewareType, RealtimeActionParams } from '@/types';
import { RealtimeActions } from './RealtimeActions';

export default class Middleware implements RealtimeActions<MiddlewareType> {
	delete({ identifiers }: RealtimeActionParams<MiddlewareType>): void {
		const { removeTabByPath } = useTabStore.getState();
		useMiddlewareStore.setState?.({
			middlewares: useMiddlewareStore
				.getState?.()
				.middlewares.filter((middleware) => middleware._id !== identifiers.middlewareId),
		});
		removeTabByPath(identifiers.versionId as string, identifiers.middlewareId as string);
		useVersionStore.setState?.((state) => ({
			dashboard: {
				...state.dashboard,
				middleware: state.dashboard.middleware - 1,
			},
		}));
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
		if (data.logic) {
			useMiddlewareStore.getState?.().setLogics(data._id, data.logic);
		}
	}
	create({ data }: RealtimeActionParams<MiddlewareType>): void {
		useMiddlewareStore.setState?.({
			middlewares: [data, ...useMiddlewareStore.getState().middlewares],
		});
		useVersionStore.setState?.((state) => ({
			dashboard: {
				...state.dashboard,
				middleware: state.dashboard.middleware + 1,
			},
		}));
	}
	telemetry(param: RealtimeActionParams<MiddlewareType>): void {
		this.update(param);
	}
}
