import { Tab } from '@/types';
import { history } from '@/utils';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import useVersionStore from './versionStore';
interface TabStore {
	tabs: Record<string, Tab[]>;
	toDeleteTab: Tab;
	isDeleteTabModalOpen: boolean;
	openDeleteTabModal: (tab: Tab) => void;
	closeDeleteTabModal: () => void;
	removeAllTabs: (versionId: string) => void;
	removeAllTabsExcept: (versionId: string) => void;
	setCurrentTab: (versionId: string, id: string) => void;
	removeTab: (versionId: string, id: string) => void;
	addTab: (versionId: string, tab: Tab) => void;
	getTabByPath: (versionId: string, path: string) => Tab | undefined;
	getTabById: (versionId: string, id: string) => Tab | undefined;
	getPreviousTab: (versionId: string, currentTabId: string) => Tab | undefined;
	getTabsByVersionId: (versionId: string) => Tab[];
	getCurrentTab: (versionId: string) => Tab;
	updateCurrentTab: (versionId: string, tab: Tab) => void;
	setTabs: (versionId: string, tabs: Tab[]) => void;
}

const useTabStore = create<TabStore>()(
	devtools(
		persist(
			(set, get) => ({
				tabs: {},
				toDeleteTab: {} as Tab,
				isDeleteTabModalOpen: false,
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
					if (tab.isActive && prevTab) {
						get().setCurrentTab(versionId, prevTab?.id);
						const url = prevTab.path.includes('organization')
							? prevTab.path
							: useVersionStore.getState().getVersionDashboardPath(prevTab.path);
						console.log(url);
						history.navigate?.(`${url}?tabId=${prevTab.id}`);
					}
				},
				addTab: (versionId, tab) => {
					set((state) => {
						const tabs = state.tabs[versionId] ?? [];
						return {
							tabs: {
								...state.tabs,
								[versionId]: [...tabs, tab],
							},
						};
					});
					get().setCurrentTab(versionId, tab.id);
					const url = tab.path.includes('organization')
						? tab.path
						: useVersionStore.getState().getVersionDashboardPath(tab.path);

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
						newTabs[currentTabIndex] = tab;

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
			}),
			{
				name: 'tab-storage',
			},
		),
	),
);

export default useTabStore;
