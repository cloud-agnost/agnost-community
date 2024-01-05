import useMessageQueueStore from '@/store/queue/messageQueueStore';
import useTabStore from '@/store/version/tabStore';
import useUtilsStore from '@/store/version/utilsStore';
import useVersionStore from '@/store/version/versionStore';
import { LogTypes, MessageQueue, RealtimeActionParams } from '@/types';
import { RealtimeActions } from './RealtimeActions';
class Queue implements RealtimeActions<MessageQueue> {
	log({ message, timestamp, id, type }: RealtimeActionParams<MessageQueue>) {
		setTimeout(() => {
			useUtilsStore.getState?.().setQueueLogs(id as string, {
				message: message as string,
				timestamp: timestamp as string,
				type: type as LogTypes,
			});
		}, 100);
	}
	delete({ identifiers }: RealtimeActionParams<MessageQueue>) {
		const { removeTabByPath } = useTabStore.getState();
		useMessageQueueStore.setState?.({
			queues: useMessageQueueStore
				.getState?.()
				.queues.filter((queue) => queue._id !== identifiers.queueId),
		});
		removeTabByPath(identifiers.versionId as string, identifiers.queueId as string);
		useVersionStore.setState?.((state) => ({
			dashboard: {
				...state.dashboard,
				queue: state.dashboard.queue - 1,
			},
		}));
	}
	update({ data }: RealtimeActionParams<MessageQueue>) {
		const { updateTab } = useTabStore.getState();
		updateTab({
			versionId: data.versionId as string,
			tab: {
				title: data.name,
			},
			filter: (tab) => tab.path.includes(data._id as string),
		});
		useMessageQueueStore.setState?.({
			queues: useMessageQueueStore.getState?.().queues.map((queue) => {
				if (queue._id === data._id) {
					return data;
				}
				return queue;
			}),
			queue: data,
		});
		if (data.logic) {
			useMessageQueueStore.getState?.().setLogics(data._id, data.logic);
		}
	}
	create({ data }: RealtimeActionParams<MessageQueue>) {
		useMessageQueueStore.setState?.({
			queues: [...useMessageQueueStore.getState().queues, data],
		});
		useVersionStore.setState?.((state) => ({
			dashboard: {
				...state.dashboard,
				queue: state.dashboard.queue + 1,
			},
		}));
	}
	telemetry(params: RealtimeActionParams<MessageQueue>) {
		this.update(params);
	}
}

export default Queue;
