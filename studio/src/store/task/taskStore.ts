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
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
export interface TaskStore {
	task: Task;
	tasks: Task[];
	toDeleteTask: Task;
	isDeleteTaskModalOpen: boolean;
	lastFetchedCount: number;
	taskLogs: TestTaskLogs;
	isEditTaskModalOpen: boolean;
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
	openDeleteTaskModal: (task: Task) => void;
	closeDeleteTaskModal: () => void;
	setTaskLog: (taskId: string, log: Log) => void;
}

const useTaskStore = create<TaskStore>()(
	devtools(
		persist(
			(set) => ({
				task: {} as Task,
				tasks: [],
				toDeleteTask: {} as Task,
				isDeleteTaskModalOpen: false,
				lastFetchedCount: 0,
				taskLogs: {} as TestTaskLogs,
				isEditTaskModalOpen: false,
				openEditTaskModal: (task: Task) => {
					set({ task, isEditTaskModalOpen: true });
				},
				closeEditTaskModal: () => {
					set({ isEditTaskModalOpen: false, task: {} as Task });
				},
				getTask: async (params: GetTaskParams) => {
					const task = await TaskService.getTask(params);
					set({ task });
					return task;
				},
				getTasks: async (params: GetTasksParams) => {
					const tasks = await TaskService.getTasks(params);
					set({ tasks, lastFetchedCount: tasks.length });
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
						if (params.onSuccess) params.onSuccess();
						return task;
					} catch (error) {
						if (params.onError) params.onError(error as APIError);
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
				openDeleteTaskModal: (task: Task) => {
					set({ toDeleteTask: task, isDeleteTaskModalOpen: true });
				},
				closeDeleteTaskModal: () => {
					set({ toDeleteTask: {} as Task, isDeleteTaskModalOpen: false });
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
			}),
			{
				name: 'task-storage',
			},
		),
		{
			name: 'task',
		},
	),
);

export default useTaskStore;
