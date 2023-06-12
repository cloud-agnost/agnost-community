import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AuthService, ClusterService } from '@/services';
import { APIError } from '@/types';
import { OnboardingData, User, UserDataToRegister } from '@/types/type.ts';

interface ClusterStore {
	loading: boolean;
	error: APIError | null;
	isCompleted: boolean;
	canClusterSendEmail: boolean;
	checkClusterSetup: () => Promise<boolean>;
	checkClusterSmtpStatus: () => Promise<boolean>;
	initializeClusterSetup: (data: UserDataToRegister) => Promise<User | APIError>;
	finalizeClusterSetup: (req: OnboardingData) => Promise<User | APIError>;
	initializeAccountSetup: () => void;
	finalizeAccountSetup: () => void;
}

const useClusterStore = create<ClusterStore>()(
	devtools(
		persist(
			(set) => ({
				loading: false,
				isCompleted: false,
				canClusterSendEmail: false,
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
				checkClusterSmtpStatus: async () => {
					try {
						const { status } = await ClusterService.canClusterSendEmail();
						set({ canClusterSendEmail: status });
						return status;
					} catch (error) {
						set({ error: error as APIError });
						throw error;
					}
				},
				initializeClusterSetup: async (data: UserDataToRegister) => {
					return AuthService.initializeClusterSetup(data);
				},
				finalizeClusterSetup: async (data: OnboardingData) => {
					return AuthService.finalizeClusterSetup(data);
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
