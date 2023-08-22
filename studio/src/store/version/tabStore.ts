import { Tab } from '@/types';
import { devtools, persist } from 'zustand/middleware';
import { create } from 'zustand';

interface TabStore {
	tabs: Record<string, Tab[]>;
	removeAllTabs: (versionId: string) => void;
	removeAllTabsExcept: (versionId: string) => void;
	setCurrentTab: (versionId: string, id: number) => void;
	removeTab: (versionId: string, id: number) => string | undefined;
	addTab: (versionId: string, tab: Tab) => void;
	getTabByPath: (versionId: string, path: string) => Tab | undefined;
	getTabById: (versionId: string, id: number) => Tab | undefined;
	getPreviousTab: (versionId: string, currentTabId: number) => Tab | undefined;
	getTabsByVersionId: (versionId: string) => Tab[];
	getCurrentTab: (versionId: string) => Tab | null;
	getCurrentTabId: (versionId: string) => number | undefined;
}

const useTabStore = create<TabStore>()(
	devtools(
		persist(
			(set, get) => ({
				tabs: {},
				getCurrentTabId: (versionId: string) => {
					const tabs = get().tabs[versionId] ?? [];
					return tabs?.findIndex((tab) => tab.isActive);
				},
				getCurrentTab: (versionId: string) => {
					const tabs = get().tabs[versionId] ?? [];
					return tabs?.find((tab) => tab.isActive) ?? null;
				},
				getTabsByVersionId: (versionId: string) => {
					return get().tabs[versionId] ?? [];
				},
				removeTab: (versionId: string, id: number) => {
					const tabs = get().tabs[versionId];
					if (!tabs) return;

					const prev = get().getPreviousTab(versionId, id)?.path;
					const newTabs = tabs.filter((_, index) => index !== id);
					set((state) => {
						return {
							tabs: {
								...state.tabs,
								[versionId]: newTabs,
							},
						};
					});

					return prev;
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
					return get().tabs[versionId][id];
				},
				getPreviousTab: (versionId, currentTabId) => {
					const tabs = get().tabs[versionId] ?? [];
					const currentTabIndex = tabs.findIndex((_, index) => index === currentTabId);
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
				setCurrentTab: (versionId, id: number) => {
					set((state) => {
						const tabs = state.tabs[versionId] ?? [];
						return {
							tabs: {
								...state.tabs,
								[versionId]: tabs.map((t, index) => ({
									...t,
									isActive: index === id,
								})),
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
