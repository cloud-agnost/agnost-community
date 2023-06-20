import OrganizationService from '@/services/OrganizationService';
import {
	APIError,
	Application,
	CreateOrganizationRequest,
	LeaveOrganizationRequest,
	Organization,
	CreateApplicationRequest,
	CreateApplicationResponse,
} from '@/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
interface OrganizationStore {
	loading: boolean;
	organization: Organization | null;
	organizations: Organization[];
	applications: Application[];
	temp: Application[];
	getAllOrganizationByUser: () => Promise<Organization[] | APIError>;
	createOrganization: (req: CreateOrganizationRequest) => Promise<Organization | APIError>;
	selectOrganization: (organization: Organization) => void;
	leaveOrganization: (req: LeaveOrganizationRequest) => Promise<void>;
	getOrganizationApps: (organizationId: string) => Promise<Application[] | APIError>;
	createApplication: (req: CreateApplicationRequest) => Promise<Application | APIError>;
	searchApplications: (query: string) => Promise<Application[] | APIError>;
}

const useOrganizationStore = create<OrganizationStore>()(
	devtools(
		persist(
			(set, get) => ({
				loading: false,
				organization: null,
				organizations: [],
				applications: [],
				temp: [],
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
						set({ loading: true });
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
						if (onSuccess) onSuccess();
						return res;
					} catch (error) {
						if (onError) onError(error as APIError);
						throw error as APIError;
					} finally {
						set({ loading: false });
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
						if (onSuccess) onSuccess();
					} catch (error) {
						if (onError) onError(error as APIError);
						throw error as APIError;
					}
				},
				getOrganizationApps: async (organizationId: string) => {
					try {
						set({ loading: true });
						const res = await OrganizationService.getOrganizationApps(organizationId);
						set({ applications: res, temp: res });
						return res;
					} catch (error) {
						throw error as APIError;
					} finally {
						set({ loading: false });
					}
				},
				createApplication: async ({
					orgId,
					name,
					onSuccess,
					onError,
				}: CreateApplicationRequest) => {
					try {
						set({ loading: true });
						const res = await OrganizationService.createApplication({ orgId, name });
						if (onSuccess) onSuccess();
						set({ applications: [...get().applications, res.app] });
						return res.app;
					} catch (error) {
						if (onError) onError(error as APIError);
						throw error as APIError;
					} finally {
						set({ loading: false });
					}
				},
				searchApplications: async (query: string) => {
					try {
						if (query === '') {
							set({ applications: get().temp });
							return get().temp;
						}
						set({ loading: true });
						const res = get().temp.filter((app) =>
							app.name.toLowerCase().includes(query.toLowerCase()),
						);
						set({ applications: res });
						return res;
					} catch (error) {
						throw error as APIError;
					} finally {
						set({ loading: false });
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
