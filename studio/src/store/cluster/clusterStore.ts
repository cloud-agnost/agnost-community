import { create } from '@/helpers';
import { AuthService, ClusterService } from '@/services';
import {
	APIError,
	ClusterComponent,
	ClusterSetupResponse,
	SetupCluster,
	TransferClusterOwnershipParams,
	UpdateClusterComponentParams,
} from '@/types';
import { BaseRequest, User, UserDataToRegister } from '@/types/type.ts';
import { devtools } from 'zustand/middleware';
import useAuthStore from '../auth/authStore';
import useEnvironmentStore from '../environment/environmentStore';
import useOrganizationStore from '../organization/organizationStore';

interface ClusterStore {
	loading: boolean;
	error: APIError | null;
	isCompleted: boolean;
	canClusterSendEmail: boolean;
	clusterComponents: ClusterComponent[];
	isEditClusterComponentOpen: boolean;
	clusterComponent: ClusterComponent;
	clusterInfo: any;
}

type Actions = {
	checkClusterSetup: (req?: BaseRequest) => Promise<boolean>;
	checkClusterSmtpStatus: () => Promise<boolean>;
	initializeClusterSetup: (data: UserDataToRegister) => Promise<User>;
	finalizeClusterSetup: (params: SetupCluster) => Promise<ClusterSetupResponse>;
	getClusterComponents: () => Promise<ClusterComponent[]>;
	updateClusterComponent: (data: UpdateClusterComponentParams) => Promise<void>;
	openEditClusterComponent: (editedClusterComponent: ClusterComponent) => void;
	closeEditClusterComponent: () => void;
	transferClusterOwnership: (params: TransferClusterOwnershipParams) => Promise<void>;
	getClusterInfo: () => Promise<any>;
	updateSmtpSettings: (data: any) => Promise<any>;
	reset: () => void;
};

const initialState: ClusterStore = {
	loading: false,
	isCompleted: false,
	canClusterSendEmail: false,
	error: null,
	clusterComponents: [],
	clusterComponent: {} as ClusterComponent,
	isEditClusterComponentOpen: false,
	clusterInfo: {},
};

const useClusterStore = create<ClusterStore & Actions>()(
	devtools((set) => ({
		...initialState,
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
		finalizeClusterSetup: async (params: SetupCluster) => {
			try {
				const clusterSetupResponse = await AuthService.finalizeClusterSetup(params);
				set({ isCompleted: true });
				useOrganizationStore.setState({
					organization: {
						...clusterSetupResponse.org,
						role: 'Admin',
					},
				});
				useEnvironmentStore.setState({ environment: clusterSetupResponse.env });
				if (params.onSuccess) params.onSuccess(clusterSetupResponse);

				return clusterSetupResponse;
			} catch (error) {
				set({ error: error as APIError });
				if (params.onError) params.onError(error as APIError);
				throw error;
			}
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
		getClusterInfo: async () => {
			try {
				const clusterInfo = await ClusterService.getClusterInfo();
				set({ clusterInfo });
				return clusterInfo;
			} catch (error) {
				set({ error: error as APIError });
				throw error;
			}
		},
		updateSmtpSettings: async (data: any) => {
			try {
				const smtpSettings = await ClusterService.updateSmtpSettings(data);
				return smtpSettings;
			} catch (error) {
				set({ error: error as APIError });
				throw error;
			}
		},
		reset: () => set(initialState),
	})),
);

export default useClusterStore;
