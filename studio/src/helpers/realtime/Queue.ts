import useMessageQueueStore from '@/store/queue/messageQueueStore';
import { LogTypes, MessageQueue, RealtimeActionParams } from '@/types';
import { RealtimeActions } from './RealtimeActions';
class Queue extends RealtimeActions<MessageQueue> {
	redeploy(): void {
		throw new Error('Method not implemented.');
	}
	deploy(): void {
		throw new Error('Method not implemented.');
	}
	log({ message, timestamp, id, type }: RealtimeActionParams<MessageQueue>) {
		setTimeout(() => {
			useMessageQueueStore.getState?.().setQueueLogs(id as string, {
				message: message as string,
				timestamp: timestamp as string,
				type: type as LogTypes,
			});
		}, 100);
	}
	delete({ identifiers }: RealtimeActionParams<MessageQueue>) {
		useMessageQueueStore.setState?.({
			queues: useMessageQueueStore
				.getState?.()
				.queues.filter((queue) => queue._id !== identifiers.queueId),
		});
	}
	update({ data }: RealtimeActionParams<MessageQueue>) {
		useMessageQueueStore.setState?.({
			queues: useMessageQueueStore.getState?.().queues.map((queue) => {
				if (queue._id === data._id) {
					return data;
				}
				return queue;
			}),
			queue: data,
		});
	}
	create({ data }: RealtimeActionParams<MessageQueue>) {
		useMessageQueueStore.setState?.({
			queues: [...useMessageQueueStore.getState().queues, data],
		});
	}
	telemetry(params: RealtimeActionParams<MessageQueue>) {
		this.update(params);
	}
}

export default Queue;
