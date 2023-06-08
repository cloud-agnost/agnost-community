import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ClusterService } from '@/services';
import { APIError } from '@/types';
import { User } from '@/types/type.ts';

interface ClusterStore {
	loading: boolean;
	error: APIError | null;
	isCompleted: boolean;
	checkClusterSetup: () => Promise<boolean>;
	initializeClusterSetup: () => Promise<User | undefined> | void;
	finalizeClusterSetup: () => void;
	initializeAccountSetup: () => void;
	finalizeAccountSetup: () => void;
}

const useClusterStore = create<ClusterStore>()(
	devtools(
		persist(
			(set) => ({
				loading: false,
				isCompleted: false,
				error: null,
				checkClusterSetup: async () => {
					try {
						const { status } = await ClusterService.checkCompleted();
						set({ isCompleted: status });
						return status;
					} catch (error) {
						set({ error: error as APIError });
						throw error;
					}
				},
				initializeClusterSetup: () => {
					// TODO: Implement
				},
				finalizeClusterSetup: () => {
					// TODO: Implement
				},
				initializeAccountSetup: () => {
					// TODO: Implement
				},
				finalizeAccountSetup: () => {
					// TODO: Implement
				},
				completeAccountSetupFollowingInviteAccept: () => {
					// TODO: Implement
				},
			}),
			{
				name: 'cluster-storage',
			},
		),
	),
);

export default useClusterStore;
