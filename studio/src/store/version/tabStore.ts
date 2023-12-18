import { create } from '@/helpers';
import { Tab, TabTypes, UpdateTabParams } from '@/types';
import { generateId, getUrlWithoutQuery, history, translate } from '@/utils';
import { devtools, persist } from 'zustand/middleware';
import useVersionStore from './versionStore';
interface TabStore {
	tabs: Record<string, Tab[]>;
	toDeleteTab: Tab;
	isDeleteTabModalOpen: boolean;
}
type Actions = {
	openDeleteTabModal: (tab: Tab) => void;
	closeDeleteTabModal: () => void;
	removeAllTabs: (versionId: string) => void;
	removeAllTabsExcept: (versionId: string) => void;
	removeAllAtRight: (versionId: string) => void;
	setCurrentTab: (versionId: string, id: string) => void;
	removeTab: (versionId: string, id: string) => void;
	addTab: (versionId: string, tab: Tab) => void;
	getTabByPath: (versionId: string, path: string) => Tab | undefined;
	getTabById: (versionId: string, id: string) => Tab | undefined;
	getPreviousTab: (versionId: string, currentTabId: string) => Tab | undefined;
	getTabsByVersionId: (versionId: string) => Tab[];
	getCurrentTab: (versionId: string) => Tab;
	updateCurrentTab: (versionId: string, tab: Partial<Tab>) => void;
	setTabs: (versionId: string, tabs: Tab[]) => void;
	filterTabs: (versionId: string, filter: (tab: Tab) => boolean) => Tab;
	removeTabByPath: (versionId: string, path: string) => void;
	updateTab: (param: UpdateTabParams) => void;
	addSettingsTab: (versionId: string, path?: string) => void;
	closeCurrentTab: () => void;
	reset: () => void;
};

const initialState: TabStore = {
	tabs: {},
	toDeleteTab: {} as Tab,
	isDeleteTabModalOpen: false,
};
const useTabStore = create<TabStore & Actions>()(
	devtools(
		persist(
			(set, get) => ({
				...initialState,
				openDeleteTabModal: (tab) => {
					set({ toDeleteTab: tab, isDeleteTabModalOpen: true });
				},
				closeDeleteTabModal: () => {
					set({ toDeleteTab: {} as Tab, isDeleteTabModalOpen: false });
				},
				getCurrentTab: (versionId: string) => {
					const tabs = get().tabs[versionId] ?? [];
					return tabs?.find((tab) => tab.isActive) ?? ({} as Tab);
				},
				getTabsByVersionId: (versionId: string) => {
					return get().tabs[versionId] ?? [];
				},
				removeTab: (versionId: string, id: string) => {
					const tabs = get().tabs[versionId];
					const tab = tabs?.find((tab) => tab.id === id) ?? ({} as Tab);
					if (!tabs) return;
					const newTabs = tabs.filter((tab) => tab.id !== id);
					const prevTab = get().getPreviousTab(versionId, tab.id);
					set((state) => {
						return {
							tabs: {
								...state.tabs,
								[versionId]: newTabs,
							},
						};
					});
					if (tab.isActive && prevTab && window.location.pathname.includes('version')) {
						get().setCurrentTab(versionId, prevTab?.id);
						const url = useVersionStore.getState().getVersionDashboardPath(prevTab.path);
						history.navigate?.(url);
					}
				},
				addTab: (versionId, tab) => {
					const existingTab = get().tabs[versionId]?.find(
						(t) => getUrlWithoutQuery(t.path) === tab.path,
					);
					const url = useVersionStore.getState().getVersionDashboardPath(tab.path);
					if (!existingTab) {
						set((state) => {
							const tabs = state.tabs[versionId] ?? [];
							return {
								tabs: {
									...state.tabs,
									[versionId]: [
										...tabs,
										{
											...tab,
											path: `${url}?tabId=${tab.id}`,
										},
									],
								},
							};
						});
					}
					get().setCurrentTab(versionId, existingTab?.id ?? tab.id);

					history.navigate?.(`${url}?tabId=${tab.id}`);
				},
				getTabByPath: (versionId, path) => {
					const tabs = get().tabs[versionId] ?? [];
					return tabs.find((tab) => tab.path === path);
				},
				getTabById: (versionId, id) => {
					return get().tabs[versionId]?.find((tab) => tab.id === id);
				},
				getPreviousTab: (versionId, currentTabId) => {
					const tabs = get().tabs[versionId] ?? [];
					const currentTabIndex = tabs.findIndex((tab) => tab.id === currentTabId);
					if (currentTabIndex === -1) return;
					return tabs[currentTabIndex - 1];
				},
				removeAllTabs: (versionId) => {
					set((state) => {
						const tabs = state.tabs[versionId] ?? [];
						return {
							tabs: {
								...state.tabs,
								[versionId]: tabs.filter((tab) => tab.isDashboard),
							},
						};
					});
				},
				removeAllTabsExcept: (versionId) => {
					set((state) => {
						const tabs = state.tabs[versionId] ?? [];
						const newTabs = tabs.filter((tab) => tab.isDashboard || tab.isActive);
						return {
							tabs: {
								...state.tabs,
								[versionId]: newTabs,
							},
						};
					});
				},
				removeAllAtRight: (versionId) => {
					const currentTab = get().getCurrentTab(versionId);
					const tabs = get().tabs[versionId] ?? [];
					const currentTabIndex = tabs.findIndex((tab) => tab.id === currentTab.id);
					if (currentTabIndex === -1) return;
					const newTabs = tabs.slice(0, currentTabIndex + 1);
					set((state) => {
						return {
							tabs: {
								...state.tabs,
								[versionId]: newTabs,
							},
						};
					});
				},
				setCurrentTab: (versionId, id: string) => {
					set((state) => {
						const tabs = state.tabs[versionId] ?? [];
						return {
							tabs: {
								...state.tabs,
								[versionId]: tabs.map((t) => {
									return {
										...t,
										isActive: t.id === id,
									};
								}),
							},
						};
					});
				},
				updateCurrentTab: (versionId, tab) => {
					set((state) => {
						const tabs = state.tabs[versionId] ?? [];
						const currentTabIndex = tabs.findIndex((t) => t.isActive);
						if (currentTabIndex === -1) return state;
						const newTabs = [...tabs];
						newTabs[currentTabIndex] = {
							...newTabs[currentTabIndex],
							...tab,
						};

						return {
							tabs: {
								...state.tabs,
								[versionId]: newTabs,
							},
						};
					});
				},
				setTabs: (versionId, tabs) => {
					set((state) => {
						return {
							tabs: {
								...state.tabs,
								[versionId]: tabs,
							},
						};
					});
				},
				removeTabByPath: (versionId, path) => {
					const tab = get().tabs[versionId]?.filter((tab) => tab.path.includes(path));
					if (!tab) return;
					tab.forEach((t) => {
						get().removeTab(versionId, t.id);
					});
				},
				filterTabs: (versionId, filter) => {
					const tabs = get().tabs[versionId] ?? [];
					return tabs.find(filter) ?? ({} as Tab);
				},
				updateTab: (param) => {
					const { versionId, tab, filter } = param;
					if (!tab) return;
					const toUpdateTab = get().filterTabs(versionId, filter);
					set((state) => ({
						tabs: {
							...state.tabs,
							[versionId]:
								state.tabs[versionId]?.map((t) => {
									if (t.id === toUpdateTab.id) {
										return { ...t, ...tab };
									}
									return t;
								}) ?? [],
						},
					}));
				},
				addSettingsTab: (versionId, path = '') => {
					const tabs = get().tabs[versionId] ?? [];
					const settingsTab = tabs.find((tab) => tab.type === TabTypes.Settings);
					if (settingsTab) {
						get().setCurrentTab(versionId, settingsTab.id);
						history.navigate?.(settingsTab.path);
						return;
					}
					get().addTab(versionId as string, {
						path: useVersionStore.getState().getVersionDashboardPath(`settings/${path}`),
						id: generateId(),
						title: translate('version.settings.default'),
						isActive: true,
						isDashboard: false,
						type: TabTypes.Settings,
					});
				},
				closeCurrentTab: () => {
					const currentTab = get().getCurrentTab(useVersionStore.getState().version._id);
					if (!currentTab) return;
					get().removeTab(useVersionStore.getState().version._id, currentTab.id);
				},
				reset: () => set(initialState),
			}),
			{
				name: 'tab-store',
			},
		),
	),
);

export default useTabStore;
