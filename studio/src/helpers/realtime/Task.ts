import useTaskStore from '@/store/task/taskStore';
import useTabStore from '@/store/version/tabStore';
import { LogTypes, RealtimeActionParams, Task as TaskType } from '@/types';
import { RealtimeActions } from './RealtimeActions';
import useUtilsStore from '@/store/version/utilsStore';
class Task extends RealtimeActions<TaskType> {
	accept(): void {
		throw new Error('Method not implemented.');
	}
	redeploy(): void {
		throw new Error('Method not implemented.');
	}
	deploy(): void {
		throw new Error('Method not implemented.');
	}
	log({ message, timestamp, id, type }: RealtimeActionParams<TaskType>) {
		setTimeout(() => {
			useUtilsStore.getState?.().setTaskLogs(id as string, {
				message: message as string,
				timestamp: timestamp as string,
				type: type as LogTypes,
			});
		}, 100);
	}
	delete({ identifiers }: RealtimeActionParams<TaskType>) {
		const { removeTabByPath } = useTabStore.getState();
		useTaskStore.setState?.({
			tasks: useTaskStore.getState?.().tasks.filter((task) => task._id !== identifiers.taskId),
		});
		removeTabByPath(identifiers.versionId as string, identifiers.taskId as string);
	}
	update({ data }: RealtimeActionParams<TaskType>) {
		const { updateTab } = useTabStore.getState();
		updateTab({
			versionId: data.versionId as string,
			tab: {
				title: data.name,
				...(data.logic && { logic: data.logic }),
			},
			filter: (tab) => tab.path.includes(data._id as string),
		});
		useTaskStore.setState?.({
			tasks: useTaskStore.getState?.().tasks.map((queue) => {
				if (queue._id === data._id) {
					return data;
				}
				return queue;
			}),
			task: data,
		});
		if (data.logic) {
			useTaskStore.getState?.().setLogics(data._id, data.logic);
		}
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
