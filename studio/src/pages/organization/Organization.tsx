import { useState } from 'react';
import { LoaderFunctionArgs, Outlet } from 'react-router-dom';
import { OrganizationCreateModal } from '@/features/organization';
import { RequireAuth } from '@/router';
import useOrganizationStore from '@/store/organization/organizationStore.ts';
import useAuthStore from '@/store/auth/authStore.ts';
import useApplicationStore from '@/store/app/applicationStore.ts';

Organization.loader = async function ({ params }: LoaderFunctionArgs) {
	const { orgId } = params;
	const { getAllOrganizationByUser } = useOrganizationStore.getState();
	const { getAppsByOrgId } = useApplicationStore.getState();
	const { isAuthenticated } = useAuthStore.getState();

	if (isAuthenticated()) getAllOrganizationByUser();

	useOrganizationStore.subscribe(
		(state) => state.organization,
		(organization) => {
			if (organization) {
				getAppsByOrgId(organization._id);
			} else if (orgId) {
				getAppsByOrgId(orgId);
			}
		},
		{ fireImmediately: true },
	);
	useAuthStore.subscribe(
		(state) => state.user,
		(user, prevUser) => {
			if (user && prevUser?._id !== user?._id) getAllOrganizationByUser();
		},
	);

	return null;
};

export default function Organization() {
	const [openOrgCreateModal, setOpenOrgCreateModal] = useState(false);

	return (
		<RequireAuth>
			<>
				<OrganizationCreateModal
					key={openOrgCreateModal.toString()}
					isOpen={openOrgCreateModal}
					closeModal={() => setOpenOrgCreateModal(false)}
				/>

				<Outlet
					context={{
						openOrgCreateModal: () => setOpenOrgCreateModal(true),
						closeOrgCreateModal: () => setOpenOrgCreateModal(false),
					}}
				/>
			</>
		</RequireAuth>
	);
}
