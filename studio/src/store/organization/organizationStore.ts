import OrganizationService from '@/services/OrganizationService';
import { APIError } from '@/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface OrganizationStore {
	organization: object;
	organizations: object[];
	getAllOrganizationByUser: () => Promise<object[] | APIError>;
}

const useOrganizationStore = create<OrganizationStore>()(
	devtools(
		persist(
			(set) => ({
				organization: {},
				organizations: [],
				getAllOrganizationByUser: async () => {
					try {
						const res = await OrganizationService.getAllOrganizationsByUser();
						set({ organizations: res });
						return res;
					} catch (error) {
						return error;
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
