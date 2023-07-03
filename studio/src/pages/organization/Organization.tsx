import { OrganizationCreateModal } from '@/features/Organization';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

export default function Organization() {
	const [openOrgCreateModal, setOpenOrgCreateModal] = useState(false);

	return (
		<>
			<OrganizationCreateModal
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
