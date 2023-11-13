import { create } from '@/helpers';
import QueueService from '@/services/QueueService';
import {
	APIError,
	CreateMessageQueueParams,
	DeleteMessageQueueParams,
	DeleteMultipleQueuesParams,
	GetMessageQueueByIdParams,
	GetMessageQueuesParams,
	Log,
	MessageQueue,
	TestQueueLogs,
	TestQueueParams,
	UpdateQueueLogicParams,
	UpdateQueueParams,
} from '@/types';
import { isEmpty } from '@/utils';
import { devtools, persist } from 'zustand/middleware';

interface MessageQueueStore {
	queues: MessageQueue[];
	queue: MessageQueue;
	lastFetchedPage: number;
	testQueueLogs: TestQueueLogs;
	isEditModalOpen: boolean;
	logics: Record<string, string>;
}

type Actions = {
	getQueues: (params: GetMessageQueuesParams) => Promise<MessageQueue[]>;
	getQueueById: (params: GetMessageQueueByIdParams) => Promise<MessageQueue>;
	deleteQueue: (params: DeleteMessageQueueParams) => Promise<void>;
	deleteMultipleQueues: (params: DeleteMultipleQueuesParams) => Promise<void>;
	createQueue: (params: CreateMessageQueueParams) => Promise<MessageQueue>;
	updateQueue: (params: UpdateQueueParams) => Promise<MessageQueue>;
	updateQueueLogic: (params: UpdateQueueLogicParams) => Promise<MessageQueue>;
	testQueue: (params: TestQueueParams) => Promise<void>;
	setQueueLogs: (queueId: string, log: Log) => void;
	openEditModal: (queue: MessageQueue) => void;
	closeEditModal: () => void;
	setLogics: (id: string, logic: string) => void;
	deleteLogic: (id: string) => void;
	reset: () => void;
};

const initialState: MessageQueueStore = {
	queues: [],
	queue: {} as MessageQueue,
	lastFetchedPage: 0,
	testQueueLogs: {} as TestQueueLogs,
	isEditModalOpen: false,
	logics: {},
};

const useMessageQueueStore = create<MessageQueueStore & Actions>()(
	devtools(
		persist(
			(set, get) => ({
				...initialState,
				openEditModal: (queue: MessageQueue) => {
					set({ queue, isEditModalOpen: true });
				},
				closeEditModal: () => {
					set({ isEditModalOpen: false });
				},
				getQueues: async (params: GetMessageQueuesParams) => {
					const queues = await QueueService.getQueues(params);
					if (params.page === 0) {
						set({ queues });
					} else {
						set((prev) => ({
							queues: [...prev.queues, ...queues],
							lastFetchedPage: params.page,
						}));
					}
					return queues;
				},
				getQueueById: async (params: GetMessageQueueByIdParams) => {
					const queue = await QueueService.getQueueById(params);
					set({ queue });
					if (isEmpty(get().logics[queue._id])) {
						get().setLogics(queue._id, queue.logic);
					}
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

				setQueueLogs: (queueId: string, log: Log) => {
					set((prev) => ({
						testQueueLogs: {
							...prev.testQueueLogs,
							[queueId]: {
								...prev.testQueueLogs[queueId],
								logs: [...(prev.testQueueLogs[queueId].logs as Log[]), log],
							},
						},
					}));
				},
				setLogics: (id, logic) => set((prev) => ({ logics: { ...prev.logics, [id]: logic } })),
				deleteLogic: (id) => {
					const { [id]: _, ...rest } = get().logics;
					set({ logics: rest });
				},
				reset: () => set(initialState),
			}),
			{
				name: 'Message Queue Store',
				partialize: (state) =>
					Object.fromEntries(
						Object.entries(state).filter(([key]) => ['testQueueLogs'].includes(key)),
					),
			},
		),
	),
);

export default useMessageQueueStore;
