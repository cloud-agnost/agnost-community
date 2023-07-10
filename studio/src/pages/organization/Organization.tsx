import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { OrganizationCreateModal } from '@/features/organization';

export default function Organization() {
	const [openOrgCreateModal, setOpenOrgCreateModal] = useState(false);

	return (
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
	);
}
