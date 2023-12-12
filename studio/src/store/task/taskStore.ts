import { create } from '@/helpers';
import TaskService from '@/services/TaskService';
import {
	APIError,
	CreateTaskParams,
	DeleteMultipleTasksParams,
	DeleteTaskParams,
	GetTaskParams,
	GetTasksParams,
	Log,
	SaveTaskLogicParams,
	Task,
	TestTaskLogs,
	TestTaskParams,
	UpdateTaskParams,
} from '@/types';
import { isEmpty, updateOrPush } from '@/utils';
import { devtools, persist } from 'zustand/middleware';
export interface TaskStore {
	task: Task;
	tasks: Task[];
	lastFetchedPage: number;
	taskLogs: TestTaskLogs;
	isEditTaskModalOpen: boolean;
	logics: Record<string, string>;
}

type Actions = {
	openEditTaskModal: (task: Task) => void;
	closeEditTaskModal: () => void;
	getTask: (params: GetTaskParams) => Promise<Task>;
	getTasks: (params: GetTasksParams) => Promise<Task[]>;
	createTask: (params: CreateTaskParams) => Promise<Task>;
	updateTask: (params: UpdateTaskParams) => Promise<Task>;
	deleteTask: (params: DeleteTaskParams) => Promise<Task>;
	deleteMultipleTasks: (params: DeleteMultipleTasksParams) => Promise<Task[]>;
	saveTaskLogic: (params: SaveTaskLogicParams) => Promise<Task>;
	testTask: (params: TestTaskParams) => Promise<void>;
	setTaskLog: (taskId: string, log: Log) => void;
	setLogics: (id: string, logic: string) => void;
	deleteLogic: (id: string) => void;
	reset: () => void;
};

const initialState: TaskStore = {
	task: {} as Task,
	tasks: [],
	lastFetchedPage: 0,
	taskLogs: {} as TestTaskLogs,
	isEditTaskModalOpen: false,
	logics: {},
};

const useTaskStore = create<TaskStore & Actions>()(
	devtools(
		persist(
			(set, get) => ({
				...initialState,
				openEditTaskModal: (task: Task) => {
					set({ task, isEditTaskModalOpen: true });
				},
				closeEditTaskModal: () => {
					set({ isEditTaskModalOpen: false });
				},
				getTask: async (params: GetTaskParams) => {
					const task = await TaskService.getTask(params);
					set((prev) => {
						const tasks = updateOrPush(prev.tasks, task);
						return { task, tasks };
					});
					if (isEmpty(get().logics[task._id])) {
						get().setLogics(task._id, task.logic);
					}
					return task;
				},
				getTasks: async (params: GetTasksParams) => {
					const tasks = await TaskService.getTasks(params);
					if (params.page === 0) {
						set({ tasks });
					} else {
						set({ tasks: [...tasks, ...tasks], lastFetchedPage: params.page });
					}

					return tasks;
				},
				createTask: async (params: CreateTaskParams) => {
					try {
						const task = await TaskService.createTask(params);
						set((prev) => ({ tasks: [task, ...prev.tasks] }));
						if (params.onSuccess) params.onSuccess(task);
						return task;
					} catch (error) {
						if (params.onError) params.onError(error as APIError);
						throw error as APIError;
					}
				},
				updateTask: async (params: UpdateTaskParams) => {
					try {
						const task = await TaskService.updateTaskProperties(params);
						set((prev) => ({
							tasks: prev.tasks.map((t) => (t._id === task._id ? task : t)),
							task,
						}));

						if (params.onSuccess) params.onSuccess();
						return task;
					} catch (error) {
						if (params.onError) params.onError(error as APIError);
						throw error as APIError;
					}
				},
				saveTaskLogic: async (params: SaveTaskLogicParams) => {
					try {
						const task = await TaskService.saveTaskLogic(params);
						set((prev) => ({
							tasks: prev.tasks.map((t) => (t._id === task._id ? task : t)),
							task,
						}));
						return task;
					} catch (error) {
						throw error as APIError;
					}
				},
				deleteTask: async (params: DeleteTaskParams) => {
					try {
						const task = await TaskService.deleteTask(params);
						set((prev) => ({
							tasks: prev.tasks.filter((task) => task._id !== params.taskId),
						}));
						if (params.onSuccess) params.onSuccess();
						return task;
					} catch (error) {
						if (params.onError) params.onError(error as APIError);
						throw error as APIError;
					}
				},
				deleteMultipleTasks: async (params: DeleteMultipleTasksParams) => {
					try {
						const tasks = await TaskService.deleteMultipleTasks(params);
						set((prev) => ({
							tasks: prev.tasks.filter((task) => !params.taskIds.includes(task._id)),
						}));
						if (params.onSuccess) params.onSuccess();
						return tasks;
					} catch (error) {
						if (params.onError) params.onError(error as APIError);
						throw error as APIError;
					}
				},
				testTask: async (params) => {
					try {
						await TaskService.testTask(params);
						if (params.onSuccess) params.onSuccess();
						set((prev) => ({
							taskLogs: {
								...prev.taskLogs,
								[params.taskId]: [],
							},
						}));
					} catch (error) {
						if (params.onError) params.onError(error as APIError);
						throw error as APIError;
					}
				},
				setTaskLog: (taskId: string, log: Log) => {
					set((prev) => {
						return {
							taskLogs: {
								...prev.taskLogs,
								[taskId]: [...(prev.taskLogs[taskId] as Log[]), log],
							},
						};
					});
				},
				setLogics: (id, logic) => set((prev) => ({ logics: { ...prev.logics, [id]: logic } })),
				deleteLogic: (id) => {
					const { [id]: _, ...rest } = get().logics;
					set({ logics: rest });
				},
				reset: () => set(initialState),
			}),
			{
				name: 'task-storage',
				partialize: (state) =>
					Object.fromEntries(Object.entries(state).filter(([key]) => ['taskLogs'].includes(key))),
			},
		),
	),
);

export default useTaskStore;
