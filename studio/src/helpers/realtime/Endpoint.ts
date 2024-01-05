import useEndpointStore from '@/store/endpoint/endpointStore';
import useTabStore from '@/store/version/tabStore';
import useUtilsStore from '@/store/version/utilsStore';
import useVersionStore from '@/store/version/versionStore';
import { Endpoint as EndpointType, LogTypes, RealtimeActionParams } from '@/types';
import { RealtimeActions } from './RealtimeActions';
class Endpoint implements RealtimeActions<EndpointType> {
	log({ message, timestamp, id, type }: RealtimeActionParams<EndpointType>) {
		setTimeout(() => {
			useUtilsStore.getState?.().setEndpointLogs(id as string, {
				message: message as string,
				timestamp: timestamp as string,
				type: type as LogTypes,
			});
		}, 100);
	}
	delete({ identifiers }: RealtimeActionParams<EndpointType>) {
		const { removeTabByPath } = useTabStore.getState();
		useEndpointStore.setState?.({
			endpoints: useEndpointStore
				.getState?.()
				.endpoints.filter((ep) => ep._id !== identifiers.endpointId),
		});

		removeTabByPath(identifiers.versionId as string, identifiers.endpointId as string);
		useVersionStore.setState?.((state) => ({
			dashboard: {
				...state.dashboard,
				endpoint: state.dashboard.endpoint - 1,
			},
		}));
	}
	update({ data }: RealtimeActionParams<EndpointType>) {
		const { updateTab } = useTabStore.getState();

		updateTab({
			versionId: data.versionId as string,
			tab: {
				title: data.name,
			},
			filter: (tab) => tab.path.includes(data._id as string),
		});
		useEndpointStore.setState?.({
			endpoints: useEndpointStore.getState?.().endpoints.map((ep) => {
				if (ep._id === data._id) {
					return data;
				}
				return ep;
			}),
			endpoint: data,
		});
		if (data.logic) {
			useEndpointStore.getState?.().setLogics(data._id, data.logic);
		}
	}
	create({ data }: RealtimeActionParams<EndpointType>) {
		useEndpointStore.setState?.({
			endpoints: [...useEndpointStore.getState().endpoints, data],
		});
		useVersionStore.setState?.((state) => ({
			dashboard: {
				...state.dashboard,
				endpoint: state.dashboard.endpoint + 1,
			},
		}));
	}
	telemetry(params: RealtimeActionParams<EndpointType>) {
		this.update(params);
	}
}

export default Endpoint;
