import OrganizationService from '@/services/OrganizationService';
import {
	APIError,
	CreateOrganizationRequest,
	Organization,
	LeaveOrganizationRequest,
} from '@/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface OrganizationStore {
	loading: boolean;
	organization: Organization | null;
	organizations: Organization[];
	getAllOrganizationByUser: () => Promise<Organization[] | APIError>;
	createOrganization: (req: CreateOrganizationRequest) => Promise<Organization | APIError>;
	selectOrganization: (organization: Organization) => void;
	leaveOrganization: (req: LeaveOrganizationRequest) => Promise<void>;
}

const useOrganizationStore = create<OrganizationStore>()(
	devtools(
		persist(
			(set, get) => ({
				loading: false,
				organization: null,
				organizations: [],
				getAllOrganizationByUser: async () => {
					try {
						set({ loading: true });
						const res = await OrganizationService.getAllOrganizationsByUser();
						set({ organizations: res, loading: false });
						return res;
					} catch (error) {
						throw error as APIError;
					}
				},
				createOrganization: async ({ name, onSuccess, onError }: CreateOrganizationRequest) => {
					try {
						const res = await OrganizationService.createOrganization(name);
						set({
							organizations: [
								{
									...res,
									role: 'Admin',
								},
								...get().organizations,
							],
						});
						onSuccess();
						return res;
					} catch (error) {
						onError(error as APIError);
						throw error as APIError;
					}
				},
				selectOrganization: (organization: Organization) => {
					set({ organization });
				},
				leaveOrganization: async ({
					organizationId,
					onSuccess,
					onError,
				}: LeaveOrganizationRequest) => {
					try {
						await OrganizationService.leaveOrganization(organizationId);
						set({
							organizations: get().organizations.filter(
								(organization) => organization._id !== organizationId,
							),
						});
						onSuccess();
					} catch (error) {
						onError(error as APIError);
						throw error as APIError;
					}
				},
			}),
			{
				name: 'organization-storage',
			},
		),
	),
);

export default useOrganizationStore;
