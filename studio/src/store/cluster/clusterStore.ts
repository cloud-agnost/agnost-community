import { AuthService, ClusterService } from '@/services';
import { APIError } from '@/types';
import { OnboardingData, User, UserDataToRegister } from '@/types/type.ts';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import useAuthStore from '../auth/authStore';

interface ClusterStore {
	loading: boolean;
	error: APIError | null;
	isCompleted: boolean;
	canClusterSendEmail: boolean;
	checkClusterSetup: () => Promise<boolean>;
	checkClusterSmtpStatus: () => Promise<boolean>;
	initializeClusterSetup: (data: UserDataToRegister) => Promise<User>;
	finalizeClusterSetup: (req: OnboardingData) => Promise<User | APIError>;
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
					try {
						const user = await AuthService.initializeClusterSetup(data);
						if (data.onSuccess) data.onSuccess();
						useAuthStore.getState().setUser(user);
						return user;
					} catch (error) {
						set({ error: error as APIError });
						if (data.onError) data.onError(error as APIError);
						throw error;
					}
				},
				finalizeClusterSetup: async (data: OnboardingData) => {
					return AuthService.finalizeClusterSetup(data);
				},
			}),
			{
				name: 'cluster-storage',
			},
		),
	),
);

export default useClusterStore;
