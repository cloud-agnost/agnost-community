import { APIError, GetVersionRequest, Version } from '@/types';
import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import { VersionService } from '@/services';

interface VersionStore {
	loading: boolean;
	error: APIError | null;
	versions: Version[];
	versionPage: number;
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
