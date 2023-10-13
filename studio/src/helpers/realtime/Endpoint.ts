import useEndpointStore from '@/store/endpoint/endpointStore';
import useTabStore from '@/store/version/tabStore';
import { Endpoint as EndpointType, LogTypes, RealtimeActionParams } from '@/types';
import { RealtimeActions } from './RealtimeActions';
class Endpoint extends RealtimeActions<EndpointType> {
	redeploy(): void {
		throw new Error('Method not implemented.');
	}
	deploy(): void {
		throw new Error('Method not implemented.');
	}
	log({ message, timestamp, id, type }: RealtimeActionParams<EndpointType>) {
		setTimeout(() => {
			useEndpointStore.getState?.().setEndpointLog(id as string, {
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
	}
	update({ data }: RealtimeActionParams<EndpointType>) {
		useEndpointStore.setState?.({
			endpoints: useEndpointStore.getState?.().endpoints.map((ep) => {
				if (ep._id === data._id) {
					return data;
				}
				return ep;
			}),
			endpoint: data,
		});
	}
	create({ data }: RealtimeActionParams<EndpointType>) {
		useEndpointStore.setState?.({
			endpoints: [...useEndpointStore.getState().endpoints, data],
		});
	}
	telemetry(params: RealtimeActionParams<EndpointType>) {
		this.update(params);
	}
}

export default Endpoint;
