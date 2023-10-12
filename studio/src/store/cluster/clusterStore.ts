import { AuthService, ClusterService } from '@/services';
import {
	APIError,
	ClusterComponent,
	TransferClusterOwnershipParams,
	UpdateClusterComponentParams,
} from '@/types';
import { BaseRequest, OnboardingData, User, UserDataToRegister } from '@/types/type.ts';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import useAuthStore from '../auth/authStore';

interface ClusterStore {
	loading: boolean;
	error: APIError | null;
	isCompleted: boolean;
	canClusterSendEmail: boolean;
	clusterComponents: ClusterComponent[];
	isEditClusterComponentOpen: boolean;
	clusterComponent: ClusterComponent;
	checkClusterSetup: (req?: BaseRequest) => Promise<boolean>;
	checkClusterSmtpStatus: () => Promise<boolean>;
	initializeClusterSetup: (data: UserDataToRegister) => Promise<User>;
	finalizeClusterSetup: (req: OnboardingData) => Promise<User | APIError>;
	getClusterComponents: () => Promise<ClusterComponent[]>;
	updateClusterComponent: (data: UpdateClusterComponentParams) => Promise<void>;
	openEditClusterComponent: (editedClusterComponent: ClusterComponent) => void;
	closeEditClusterComponent: () => void;
	transferClusterOwnership: (params: TransferClusterOwnershipParams) => Promise<void>;
}

const useClusterStore = create<ClusterStore>()(
	devtools(
		persist(
			(set) => ({
				loading: false,
				isCompleted: false,
				canClusterSendEmail: false,
				error: null,
				clusterComponents: [],
				clusterComponent: {} as ClusterComponent,
				isEditClusterComponentOpen: false,
				checkClusterSetup: async (req) => {
					try {
						const { status } = await ClusterService.checkCompleted();
						set({ isCompleted: status });
						req?.onSuccess?.(status);
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
				getClusterComponents: async () => {
					try {
						const clusterComponents = await ClusterService.getClusterComponents();
						set({ clusterComponents });
						return clusterComponents;
					} catch (error) {
						set({ error: error as APIError });
						throw error;
					}
				},
				updateClusterComponent: async (data: UpdateClusterComponentParams) => {
					try {
						await ClusterService.updateClusterComponent(data);
						if (data.onSuccess) data.onSuccess();
					} catch (error) {
						if (data.onError) data.onError(error as APIError);
						throw error;
					}
				},
				openEditClusterComponent: (editedClusterComponent) => {
					set({ isEditClusterComponentOpen: true, clusterComponent: editedClusterComponent });
				},
				closeEditClusterComponent: () => {
					set({ isEditClusterComponentOpen: false, clusterComponent: {} as ClusterComponent });
				},
				transferClusterOwnership: async (params: TransferClusterOwnershipParams) => {
					try {
						await ClusterService.transferClusterOwnership(params);
						if (params.onSuccess) params.onSuccess();
					} catch (error) {
						if (params.onError) params.onError(error as APIError);
						throw error;
					}
				},
			}),
			{
				name: 'cluster-storage',
			},
		),
	),
);

export default useClusterStore;
