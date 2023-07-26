import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { OrganizationCreateModal } from '@/features/organization';
import { RequireAuth } from '@/router';
import useOrganizationStore from '@/store/organization/organizationStore.ts';
import useAuthStore from '@/store/auth/authStore.ts';

Organization.loader = async function () {
	const { getAllOrganizationByUser } = useOrganizationStore.getState();

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
