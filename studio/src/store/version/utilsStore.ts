import { CustomStateStorage } from '@/helpers/state';
import { create } from '@/helpers/store';
import {
	EndpointLogs,
	EndpointRequest,
	EndpointResponse,
	Log,
	TestEndpointParams,
	TestQueueLogs,
	TestResponse,
	TestTaskLogs,
} from '@/types';
import { filterMatchingKeys, getTypeWorker } from '@/utils';
import _ from 'lodash';
import { devtools, persist } from 'zustand/middleware';
import useVersionStore from './versionStore';

interface UtilsStore {
	endpointRequest: EndpointRequest;
	endpointResponse: EndpointResponse;
	endpointLogs: EndpointLogs;
	testQueueLogs: TestQueueLogs;
	taskLogs: TestTaskLogs;
	typings: Record<string, string>;
}

type Actions = {
	setEndpointRequest: (request: TestEndpointParams) => void;
	setEndpointResponse: (response: TestResponse, epId: string) => void;
	setTestQueueLogs: (payload: string, queueId: string) => void;
	setQueueLogs: (queueId: string, log: Log) => void;
	setTypings: (packages: Record<string, string>) => void;
	setTaskLogs: (taskId: string, log: Log) => void;
	setEndpointLogs: (epId: string, log: Log) => void;
	fetchTypes: (packages: Record<string, string>) => Promise<void>;
};

const initialState: UtilsStore = {
	endpointRequest: {} as EndpointRequest,
	endpointResponse: {} as EndpointResponse,
	testQueueLogs: {} as TestQueueLogs,
	taskLogs: {} as TestTaskLogs,
	typings: {} as Record<string, string>,
	endpointLogs: {} as EndpointLogs,
};

const useUtilsStore = create<UtilsStore & Actions>()(
	devtools(
		persist(
			(set, get) => ({
				...initialState,
				setEndpointRequest: (request) => {
					set((prev) => ({
						endpointRequest: { ...prev.endpointRequest, [request.epId]: request },
					}));
				},
				setEndpointResponse: (response, epId) => {
					set((prev) => ({
						endpointResponse: {
							...prev.endpointResponse,
							[epId]: response,
						},
					}));
				},
				setTestQueueLogs: (payload, queueId) => {
					set((prev) => ({
						testQueueLogs: {
							...prev.testQueueLogs,
							[queueId]: {
								payload,
								logs: [],
							},
						},
					}));
				},
				setQueueLogs: (queueId: string, log: Log) => {
					set((prev) => ({
						testQueueLogs: {
							...prev.testQueueLogs,
							[queueId]: {
								...prev.testQueueLogs[queueId],
								logs: [...(prev.testQueueLogs[queueId]?.logs ?? []), log],
							},
						},
					}));
				},
				setTypings: (packages) => {
					const typeWorker = getTypeWorker();
					const intersection = filterMatchingKeys(get().typings, packages);
					typeWorker.postMessage(intersection);
					typeWorker.onmessage = async function (e) {
						const typings = e.data;
						const specifics = useVersionStore.getState().getTypings();
						set((prev) => ({ typings: { ...prev.typings, ...typings, ...specifics } }));
					};
				},
				setTaskLogs: (taskId: string, log: Log) => {
					set((prev) => {
						return {
							taskLogs: {
								...prev.taskLogs,
								[taskId]: [...(prev.taskLogs?.[taskId] ?? []), log],
							},
						};
					});
				},
				setEndpointLogs(epId, log) {
					set((prev) => {
						return {
							endpointLogs: {
								...prev.taskLogs,
								[epId]: [...(prev.endpointLogs?.[epId] ?? []), log],
							},
						};
					});
				},
				fetchTypes: async (packages) => {
					const typeWorker = getTypeWorker();
					const intersection = filterMatchingKeys(get().typings, packages);
					if (_.isEmpty(intersection)) return;
					typeWorker.postMessage(intersection);
					typeWorker.onmessage = async function (e) {
						const typings = e.data;
						set((prev) => ({ typings: { ...prev.typings, ...typings } }));
					};
				},
			}),
			{ name: 'utils-store', storage: CustomStateStorage },
		),
	),
);

export default useUtilsStore;
