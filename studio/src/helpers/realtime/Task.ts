import useTaskStore from '@/store/task/taskStore';
import { RealtimeActionParams, Task as TaskType } from '@/types';
import { RealtimeActions } from './RealtimeActions';
class Task extends RealtimeActions<TaskType> {
	info({ message, timestamp, id }: RealtimeActionParams<TaskType>) {
		setTimeout(() => {
			useTaskStore.getState?.().setTaskLog(id as string, `${timestamp} - ${message}`);
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
