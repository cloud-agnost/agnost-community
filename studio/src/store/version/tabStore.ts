import { Tab } from '@/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface TabStore {
	tabs: Record<string, Tab[]>;
	removeAllTabs: (versionId: string) => void;
	removeAllTabsExcept: (versionId: string) => void;
	setCurrentTab: (versionId: string, id: string) => void;
	removeTab: (versionId: string, id: string) => void;
	addTab: (versionId: string, tab: Tab) => void;
	getTabByPath: (versionId: string, path: string) => Tab | undefined;
	getTabById: (versionId: string, id: string) => Tab | undefined;
	getPreviousTab: (versionId: string, currentTabId: string) => Tab | undefined;
	getTabsByVersionId: (versionId: string) => Tab[];
	getCurrentTab: (versionId: string) => Tab | null;
	updateCurrentTab: (versionId: string, tab: Tab) => void;
}

const useTabStore = create<TabStore>()(
	devtools(
		persist(
			(set, get) => ({
				tabs: {},
				getCurrentTab: (versionId: string) => {
					const tabs = get().tabs[versionId] ?? [];
					return tabs?.find((tab) => tab.isActive) ?? null;
				},
				getTabsByVersionId: (versionId: string) => {
					return get().tabs[versionId] ?? [];
				},
				removeTab: (versionId: string, id: string) => {
					const tabs = get().tabs[versionId];
					if (!tabs) return;
					const newTabs = tabs.filter((tab) => tab.id !== id);
					set((state) => {
						return {
							tabs: {
								...state.tabs,
								[versionId]: newTabs,
							},
						};
					});
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
					console.log({ currentTabIndex, currentTabId });
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
								[versionId]: tabs.map((t) => ({
									...t,
									isActive: t.id === id,
								})),
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
			}),
			{
				name: 'tab-storage',
			},
		),
	),
);

export default useTabStore;
