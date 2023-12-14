import ApplicationCreateModal from '@/features/application/ApplicationCreateModal';
import { OrganizationMenu } from '@/features/organization';
import { Layout } from '@/layouts/Layout';
import { useState } from 'react';
import { Outlet, useMatch } from 'react-router-dom';

export default function OrganizationDetails() {
	const [openAppCreateModal, setOpenAppCreateModal] = useState(false);
	const hideTabMenu = useMatch('/organization/:orgId/apps/:appId/*');
	const isProfile = useMatch('/organization/:orgId/profile/*');
	return (
		<Layout>
			<ApplicationCreateModal
				key={openAppCreateModal.toString()}
				isOpen={openAppCreateModal}
				closeModal={() => setOpenAppCreateModal(false)}
			/>
			{!hideTabMenu && !isProfile && (
				<div className='org-menu-container'>
					<OrganizationMenu />
				</div>
			)}
			<Outlet
				context={{
					openAppCreateModal: () => setOpenAppCreateModal(true),
					closeAppCreateModal: () => setOpenAppCreateModal(false),
				}}
			/>
		</Layout>
	);
}
