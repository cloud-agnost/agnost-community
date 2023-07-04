import { APIError, Tab } from '@/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { VersionService } from '@/services';

interface VersionStore {
	loading: boolean;
	error: APIError | null;
	versions: any[];
	currentTab: Tab | null;
	tabs: Tab[];
	getAllVersionsVisibleToUser: (orgId: string, appId: string) => Promise<void>;
	removeTab: (id: string) => string | undefined;
	addTab: (tab: Omit<Tab, 'id'>) => void;
	getTabByPath: (path: string) => Tab | undefined;
	getTabById: (id: string) => Tab | undefined;
	getPreviousTab: (currentTabId: string) => Tab | undefined;
	removeAllTabs: () => void;
	removeAllTabsExcept: (id: string) => void;
	setCurrentTab: (tab: Tab | null) => void;
}

const useVersionStore = create<VersionStore>()(
	devtools(
		persist(
			(set, get) => ({
				loading: false,
				error: null,
				versions: [],
				tabs: [],
				currentTab: null,
				getAllVersionsVisibleToUser: async (orgId: string, appId: string) => {
					set({ loading: true });
					try {
						const versions = await VersionService.getAllVersionsVisibleToUser(orgId, appId);
						set({ versions });
					} catch (error) {
						set({ error: error as APIError });
					} finally {
						set({ loading: false });
					}
				},
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
							currentTab: newTab,
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

					let index = currentTabIndex - 1;
					if (index === -1) index = currentTabIndex + 1;

					return get().tabs[index];
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
				name: 'version-storage',
			},
		),
		{
			name: 'version-storage',
		},
	),
);

export default useVersionStore;
