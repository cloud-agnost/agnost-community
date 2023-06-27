import { APIError, GetVersionRequest, Version, Tab } from '@/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { VersionService } from '@/services';

interface VersionStore {
	loading: boolean;
	error: APIError | null;
	versions: Version[];
	tabs: Tab[];
	getAllVersionsVisibleToUser: (req: GetVersionRequest) => Promise<void>;
	removeTab: (id: string) => string | undefined;
	addTab: (tab: Omit<Tab, 'id'>) => void;
	getTabByPath: (path: string) => Tab | undefined;
	getTabById: (id: string) => Tab | undefined;
	getPreviousTab: (currentTabId: string) => Tab | undefined;
}

const useVersionStore = create<VersionStore>()(
	devtools(
		persist(
			(set, get) => ({
				loading: false,
				error: null,
				versions: [],
				tabs: [],
				getAllVersionsVisibleToUser: async (req: GetVersionRequest) => {
					set({ loading: true });
					try {
						const versions = await VersionService.getAllVersionsVisibleToUser(req);
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
