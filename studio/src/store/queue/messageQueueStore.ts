import QueueService from '@/services/QueueService';
import {
	APIError,
	CreateMessageQueueParams,
	DeleteMessageQueueParams,
	DeleteMultipleQueuesParams,
	GetMessageQueueByIdParams,
	GetMessageQueuesParams,
	MessageQueue,
	TestQueueLogs,
	TestQueueParams,
	UpdateQueueLogicParams,
	UpdateQueueParams,
} from '@/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface MessageQueueStore {
	queues: MessageQueue[];
	queue: MessageQueue;
	editedLogic: string;
	toDeleteQueue: MessageQueue;
	isDeleteModalOpen: boolean;
	lastFetchedCount: number;
	testQueueLogs: TestQueueLogs;
	isEditModalOpen: boolean;
	getQueues: (params: GetMessageQueuesParams) => Promise<MessageQueue[]>;
	getQueueById: (params: GetMessageQueueByIdParams) => Promise<MessageQueue>;
	deleteQueue: (params: DeleteMessageQueueParams) => Promise<void>;
	deleteMultipleQueues: (params: DeleteMultipleQueuesParams) => Promise<void>;
	createQueue: (params: CreateMessageQueueParams) => Promise<MessageQueue>;
	updateQueue: (params: UpdateQueueParams) => Promise<MessageQueue>;
	updateQueueLogic: (params: UpdateQueueLogicParams) => Promise<MessageQueue>;
	testQueue: (params: TestQueueParams) => Promise<void>;
	openDeleteModal: (queue: MessageQueue) => void;
	closeDeleteModal: () => void;
	setQueueLogs: (queueId: string, log: string) => void;
	openEditModal: (queue: MessageQueue) => void;
	closeEditModal: () => void;
	setEditedLogic: (logic: string) => void;
}

const useMessageQueueStore = create<MessageQueueStore>()(
	devtools(
		persist(
			(set) => ({
				queues: [],
				queue: {} as MessageQueue,
				toDeleteQueue: {} as MessageQueue,
				isDeleteModalOpen: false,
				lastFetchedCount: 0,
				createQueueModalOpen: false,
				testQueueLogs: {} as TestQueueLogs,
				isEditModalOpen: false,
				editedLogic: '',
				openEditModal: (queue: MessageQueue) => {
					set({ queue, isEditModalOpen: true });
				},
				closeEditModal: () => {
					set({ isEditModalOpen: false, queue: {} as MessageQueue });
				},
				getQueues: async (params: GetMessageQueuesParams) => {
					const queues = await QueueService.getQueues(params);
					if (params.initialFetch) {
						set({ queues, lastFetchedCount: queues.length });
					} else {
						set((prev) => ({
							endpoints: [...prev.queues, ...queues],
							lastFetchedCount: queues.length,
						}));
					}
					return queues;
				},
				getQueueById: async (params: GetMessageQueueByIdParams) => {
					const queue = await QueueService.getQueueById(params);
					set({ queue, editedLogic: queue.logic });
					return queue;
				},
				deleteQueue: async (params: DeleteMessageQueueParams) => {
					try {
						await QueueService.deleteQueue(params);
						set((prev) => ({
							queues: prev.queues.filter((queue) => queue._id !== params.queueId),
						}));
						if (params.onSuccess) params.onSuccess();
					} catch (error) {
						if (params.onError) params.onError(error as APIError);
						throw error as APIError;
					}
				},
				deleteMultipleQueues: async (params: DeleteMultipleQueuesParams) => {
					try {
						const queue = await QueueService.deleteMultipleQueues(params);
						set((prev) => ({
							queues: prev.queues.filter((queue) => !params.queueIds.includes(queue._id)),
						}));
						if (params.onSuccess) params.onSuccess(queue);
					} catch (error) {
						if (params.onError) params.onError(error as APIError);
						throw error as APIError;
					}
				},
				createQueue: async (params: CreateMessageQueueParams) => {
					try {
						const queue = await QueueService.createQueue(params);
						set((prev) => ({ queues: [queue, ...prev.queues] }));
						if (params.onSuccess) params.onSuccess(queue);
						return queue;
					} catch (error) {
						if (params.onError) params.onError(error as APIError);
						throw error as APIError;
					}
				},
				updateQueue: async (params: UpdateQueueParams) => {
					try {
						const queue = await QueueService.updateQueue(params);
						set((prev) => ({
							queues: prev.queues.map((q) => (q._id === queue._id ? queue : q)),
							queue,
						}));
						if (params.onSuccess) params.onSuccess();
						return queue;
					} catch (error) {
						if (params.onError) params.onError(error as APIError);
						throw error as APIError;
					}
				},
				updateQueueLogic: async (params: UpdateQueueLogicParams) => {
					try {
						const queue = await QueueService.updateQueueLogic(params);
						set((prev) => ({
							queues: prev.queues.map((q) => (q._id === queue._id ? queue : q)),
							queue,
							editedLogic: queue.logic,
						}));
						if (params.onSuccess) params.onSuccess();
						return queue;
					} catch (error) {
						if (params.onError) params.onError(error as APIError);
						throw error as APIError;
					}
				},
				testQueue: async (params: TestQueueParams) => {
					try {
						await QueueService.testQueue(params);
						set((prev) => ({
							testQueueLogs: {
								...prev.testQueueLogs,
								[params.queueId]: {
									payload: params.payload,
									logs: [],
								},
							},
						}));
						if (params.onSuccess) params.onSuccess();
					} catch (error) {
						if (params.onError) params.onError(error as APIError);
						throw error as APIError;
					}
				},
				openDeleteModal: (queue: MessageQueue) => {
					set({ toDeleteQueue: queue, isDeleteModalOpen: true });
				},
				closeDeleteModal: () => {
					set({ isDeleteModalOpen: false, toDeleteQueue: {} as MessageQueue });
				},
				setQueueLogs: (queueId: string, log: string) => {
					set((prev) => ({
						testQueueLogs: {
							...prev.testQueueLogs,
							[queueId]: {
								...prev.testQueueLogs[queueId],
								logs: [...(prev.testQueueLogs[queueId].logs as string[]), log],
							},
						},
					}));
				},
				setEditedLogic: (logic: string) => {
					set({ editedLogic: logic });
				},
			}),
			{
				name: 'message-queue-store',
			},
		),
	),
);

export default useMessageQueueStore;
