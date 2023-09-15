import useTaskStore from '@/store/task/taskStore';
import { LogTypes, RealtimeActionParams, Task as TaskType } from '@/types';
import { RealtimeActions } from './RealtimeActions';
class Task extends RealtimeActions<TaskType> {
	deploy(): void {
		throw new Error('Method not implemented.');
	}
	log({ message, timestamp, id, type }: RealtimeActionParams<TaskType>) {
		setTimeout(() => {
			useTaskStore.getState?.().setTaskLog(id as string, {
				message: message as string,
				timestamp: timestamp as string,
				type: type as LogTypes,
			});
		}, 100);
	}
	delete({ identifiers }: RealtimeActionParams<TaskType>) {
		useTaskStore.setState?.({
			tasks: useTaskStore.getState?.().tasks.filter((queue) => queue._id !== identifiers.queueId),
		});
	}
	update({ data }: RealtimeActionParams<TaskType>) {
		useTaskStore.setState?.({
			tasks: useTaskStore.getState?.().tasks.map((queue) => {
				if (queue._id === data._id) {
					return data;
				}
				return queue;
			}),
			task: data,
		});
	}
	create({ data }: RealtimeActionParams<TaskType>) {
		useTaskStore.setState?.({
			tasks: [...useTaskStore.getState().tasks, data],
		});
	}
	telemetry(params: RealtimeActionParams<TaskType>) {
		this.update(params);
	}
}
export default Task;
