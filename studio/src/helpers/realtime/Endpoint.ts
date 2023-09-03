import useEndpointStore from '@/store/endpoint/endpointStore';
import { Endpoint as EndpointType, RealtimeActionParams } from '@/types';
import { RealtimeActions } from './RealtimeActions';
class Endpoint extends RealtimeActions<EndpointType> {
	deploy(): void {
		throw new Error('Method not implemented.');
	}
	log({ message, timestamp, id, type }: RealtimeActionParams<EndpointType>) {
		setTimeout(() => {
			useEndpointStore
				.getState?.()
				.setEndpointLog(id as string, `${timestamp} - ${message} - ${id} - ${type}`);
		}, 100);
	}
	delete({ identifiers }: RealtimeActionParams<EndpointType>) {
		useEndpointStore.setState?.({
			endpoints: useEndpointStore
				.getState?.()
				.endpoints.filter((queue) => queue._id !== identifiers.queueId),
		});
	}
	update({ data }: RealtimeActionParams<EndpointType>) {
		useEndpointStore.setState?.({
			endpoints: useEndpointStore.getState?.().endpoints.map((queue) => {
				if (queue._id === data._id) {
					return data;
				}
				return queue;
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
