import { APIError } from '@/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { VersionService } from '@/services';
interface VersionStore {
	loading: boolean;
	error: APIError | null;
	versions: any[];
	getAllVersionsVisibleToUser: (orgId: string, appId: string) => Promise<void>;
}

const useVersionStore = create<VersionStore>()(
	devtools(
		persist(
			(set) => ({
				loading: false,
				error: null,
				versions: [],
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
