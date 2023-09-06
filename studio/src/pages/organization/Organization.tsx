import { OrganizationCreateModal } from '@/features/organization';
import { RequireAuth } from '@/router';
import useApplicationStore from '@/store/app/applicationStore.ts';
import useAuthStore from '@/store/auth/authStore.ts';
import useOrganizationStore from '@/store/organization/organizationStore.ts';
import { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';

export default function Organization() {
	const [openOrgCreateModal, setOpenOrgCreateModal] = useState(false);
	const { orgId } = useParams();
	const { getAllOrganizationByUser, getOrgPermissions } = useOrganizationStore();
	const { getAppPermissions } = useApplicationStore();
	const { isAuthenticated } = useAuthStore();
	const isLoggedIn = isAuthenticated();
	useEffect(() => {
		if (isLoggedIn) getAllOrganizationByUser();
	}, [isLoggedIn]);

	useEffect(() => {
		getAppPermissions();
		getOrgPermissions();
	}, [orgId]);

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
