import { OrganizationCreateModal } from '@/features/Organization';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

async function loader(params: any) {
	console.log(params);
	return null;
}

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

Organization.loader = loader;
