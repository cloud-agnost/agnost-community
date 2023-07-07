import ApplicationCreateModal from '@/features/application/ApplicationCreateModal';
import { Layout } from '@/layouts/Layout';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { OrganizationMenu } from '@/features/Organization';

export default function OrganizationDetails() {
	const [openAppCreateModal, setOpenAppCreateModal] = useState(false);
	return (
		<Layout>
			<ApplicationCreateModal
				key={openAppCreateModal.toString()}
				isOpen={openAppCreateModal}
				closeModal={() => setOpenAppCreateModal(false)}
			/>
			<div className='org-menu-container'>
				<OrganizationMenu />
			</div>
			<Outlet
				context={{
					openAppCreateModal: () => setOpenAppCreateModal(true),
					closeAppCreateModal: () => setOpenAppCreateModal(false),
				}}
			/>
		</Layout>
	);
}
