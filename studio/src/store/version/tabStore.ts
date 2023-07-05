import { Tab } from '@/types';
import { devtools, persist } from 'zustand/middleware';
import { create } from 'zustand';

interface TabStore {
	tabs: Tab[];
	currentTab: Tab | null;
	removeAllTabs: () => void;
	removeAllTabsExcept: (id: string) => void;
	setCurrentTab: (tab: Tab | null) => void;
	removeTab: (id: string) => string | undefined;
	addTab: (tab: Omit<Tab, 'id'>) => void;
	getTabByPath: (path: string) => Tab | undefined;
	getTabById: (id: string) => Tab | undefined;
	getPreviousTab: (currentTabId: string) => Tab | undefined;
}

const useTabStore = create<TabStore>()(
	devtools(
		persist(
			(set, get) => ({
				tabs: [],
				currentTab: null,
				removeTab: (id: string) => {
					const prevPath = get().getPreviousTab(id)?.path;

					set((state) => ({
						tabs: state.tabs.filter((tab) => tab.id !== id),
					}));

					return prevPath;
				},
				addTab: (tab) => {
					if (get().getTabByPath(tab.path)) return;

					const newTab = tab as Tab;
					newTab.id = crypto.randomUUID();

					set((state) => {
						return {
							tabs: [...state.tabs, newTab],
						};
					});
				},
				getTabByPath: (path: string) => {
					return get().tabs.find((tab) => tab.path === path);
				},
				getTabById: (id: string) => {
					return get().tabs.find((tab) => tab.id === id);
				},
				getPreviousTab: (currentTabId: string) => {
					const currentTabIndex = get().tabs.findIndex((tab) => tab.id === currentTabId);
					if (currentTabIndex === -1) return;
					return get().tabs[currentTabIndex - 1];
				},
				removeAllTabs: () => {
					set({ tabs: [] });
				},
				removeAllTabsExcept: (id: string) => {
					set((state) => ({
						tabs: state.tabs.filter((tab) => tab.id === id),
					}));
				},
				setCurrentTab: (tab) => {
					set({ currentTab: tab });
				},
			}),
			{
				name: 'tab-storage',
			},
		),
	),
);

export default useTabStore;
