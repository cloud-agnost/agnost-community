import { VersionService } from '@/services';
import { APIError, GetVersionRequest, Tab, Version } from '@/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface VersionStore {
	loading: boolean;
	error: APIError | null;
	versions: Version[];
	versionPage: number;
	tabs: Tab[];
	getAllVersionsVisibleToUser: (req: GetVersionRequest) => Promise<void>;
	setVersionPage: (page: number) => void;
}

const useVersionStore = create<VersionStore>()(
	devtools(
		(set, get) => ({
			loading: false,
			error: null,
			versions: [],
			versionPage: 0,
			tabs: [],
			getAllVersionsVisibleToUser: async (req: GetVersionRequest) => {
				set({ loading: true });
				try {
					const versions = await VersionService.getAllVersionsVisibleToUser(req);
					if (!get().versionPage) set({ versions });
					else set((prev) => ({ versions: [...prev.versions, ...versions] }));
				} catch (error) {
					set({ error: error as APIError });
				} finally {
					set({ loading: false });
				}
			},
			setVersionPage: (page: number) => {
				set({ versionPage: page });
			},
		}),
		{
			name: 'version-storage',
		},
	),
);

export default useVersionStore;
