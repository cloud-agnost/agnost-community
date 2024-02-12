import { CustomStateStorage } from '@/helpers/state';
import { create } from '@/helpers/store';
import {
	EndpointLogs,
	EndpointRequest,
	EndpointResponse,
	Log,
	TabTypes,
	TestEndpointParams,
	TestQueueLogs,
	TestResponse,
	TestTaskLogs,
} from '@/types';
import { filterMatchingKeys, getTypeWorker } from '@/utils';
import { ColumnState } from 'ag-grid-community';
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
	sidebar: {
		[version: string]: {
			openEditor: boolean | undefined;
			openedTabs: string[] | undefined;
		};
	};
	isSidebarOpen: boolean;
	columnState: {
		[modelId: string]: ColumnState[] | undefined;
	};
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
	toggleOpenEditorTab: () => void;
	toggleWorkspaceTab: (tab: TabTypes) => void;
	toggleSidebar: () => void;
	saveColumnState: (modelId: string, state: ColumnState[]) => void;
	getColumnState: (modelId: string) => ColumnState[] | undefined;
	resetColumnState: (modelId: string) => void;
	collapseAll: () => void;
};

const initialState: UtilsStore = {
	endpointRequest: {} as EndpointRequest,
	endpointResponse: {} as EndpointResponse,
	testQueueLogs: {} as TestQueueLogs,
	taskLogs: {} as TestTaskLogs,
	typings: {} as Record<string, string>,
	endpointLogs: {} as EndpointLogs,
	sidebar: {} as UtilsStore['sidebar'],
	isSidebarOpen: true,
	columnState: {} as UtilsStore['columnState'],
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
						const specifics = await useVersionStore.getState().getTypings();
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
				toggleOpenEditorTab: () => {
					const version = useVersionStore.getState().version;
					set((prev) => {
						const isOpen = prev.sidebar?.[version._id]?.openEditor ?? false;
						return {
							sidebar: {
								...prev.sidebar,
								[version._id]: {
									...prev.sidebar?.[version._id],
									openEditor: !isOpen,
								},
							},
						};
					});
				},
				toggleSidebar: () => set((prev) => ({ isSidebarOpen: !prev.isSidebarOpen })),
				toggleWorkspaceTab: (tab) => {
					const version = useVersionStore.getState().version;
					set((prev) => {
						const openedTabs = prev.sidebar?.[version._id]?.openedTabs ?? [];
						const isOpen = openedTabs.includes(tab);
						return {
							sidebar: {
								...prev.sidebar,
								[version._id]: {
									...prev.sidebar?.[version._id],
									openedTabs: isOpen ? openedTabs.filter((t) => t !== tab) : [...openedTabs, tab],
								},
							},
						};
					});
				},
				collapseAll: () => {
					const version = useVersionStore.getState().version;
					set((prev) => {
						return {
							sidebar: {
								...prev.sidebar,
								[version._id]: {
									...prev.sidebar?.[version._id],
									openedTabs: [],
								},
							},
						};
					});
				},
				saveColumnState: (modelId, state) => {
					set((prev) => {
						return {
							columnState: {
								...prev.columnState,
								[modelId]: state,
							},
						};
					});
				},
				getColumnState: (modelId) => {
					return get().columnState[modelId];
				},
				resetColumnState: (modelId) => {
					set((prev) => {
						const state = prev.columnState;
						delete state[modelId];
						return { columnState: state };
					});
				},
			}),
			{ name: 'utils-store', storage: CustomStateStorage },
		),
	),
);

export default useUtilsStore;
