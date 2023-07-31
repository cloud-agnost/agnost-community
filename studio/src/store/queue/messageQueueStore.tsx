import QueueService from '@/services/QueueService';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
	MessageQueue,
	GetMessageQueueByIdParams,
	GetMessageQueuesParams,
	DeleteMessageQueueParams,
	DeleteMultipleQueuesParams,
	CreateMessageQueueParams,
	UpdateQueueParams,
	APIError,
	UpdateQueueLogicParams,
} from '@/types';

interface MessageQueueStore {
	queues: MessageQueue[];
	queue: MessageQueue;
	toDeleteQueue: MessageQueue;
	isDeleteModalOpen: boolean;
	lastFetchedCount: number;
	getQueues: (params: GetMessageQueuesParams) => Promise<MessageQueue[]>;
	getQueueById: (params: GetMessageQueueByIdParams) => Promise<MessageQueue>;
	deleteQueue: (params: DeleteMessageQueueParams) => Promise<void>;
	deleteMultipleQueues: (params: DeleteMultipleQueuesParams) => Promise<void>;
	createQueue: (params: CreateMessageQueueParams) => Promise<MessageQueue>;
	updateQueue: (params: UpdateQueueParams) => Promise<MessageQueue>;
	updateQueueLogic: (params: UpdateQueueLogicParams) => Promise<MessageQueue>;
	openDeleteModal: (queue: MessageQueue) => void;
	closeDeleteModal: () => void;
}

const useMessageQueueStore = create<MessageQueueStore>()(
	devtools(
		persist(
			(set, get) => ({
				queues: [],
				queue: {} as MessageQueue,
				toDeleteQueue: {} as MessageQueue,
				isDeleteModalOpen: false,
				lastFetchedCount: 0,
				createQueueModalOpen: false,
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
					set({ queue });
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
						await QueueService.deleteMultipleQueues(params);
						set((prev) => ({
							queues: prev.queues.filter((queue) => !params.queueIds.includes(queue._id)),
						}));
						if (params.onSuccess) params.onSuccess();
					} catch (error) {
						if (params.onError) params.onError(error as APIError);
						throw error as APIError;
					}
				},
				createQueue: async (params: CreateMessageQueueParams) => {
					try {
						const queue = await QueueService.createQueue(params);
						set((prev) => ({ queues: [...prev.queues, queue] }));
						if (params.onSuccess) params.onSuccess();
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
						}));
						if (params.onSuccess) params.onSuccess();
						return queue;
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
			}),
			{
				name: 'message-queue-store',
			},
		),
	),
);

export default useMessageQueueStore;
