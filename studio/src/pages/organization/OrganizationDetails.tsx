import ApplicationCreateModal from '@/features/application/ApplicationCreateModal';
import { Layout } from '@/layouts/Layout';
import { useState } from 'react';
import { LoaderFunctionArgs, Outlet, useMatch } from 'react-router-dom';
import { OrganizationMenu } from '@/features/Organization';
import useOrganizationStore from '@/store/organization/organizationStore.ts';
import useAuthStore from '@/store/auth/authStore.ts';
import useApplicationStore from '@/store/app/applicationStore.ts';

OrganizationDetails.loader = function ({ params }: LoaderFunctionArgs) {
	const { isAuthenticated } = useAuthStore.getState();
	const { orgId, appId } = params;

	if (isAuthenticated()) {
		const unSubscribeOrg = useOrganizationStore.subscribe(
			(state) => state.organizations,
			() => {
				useOrganizationStore.setState((prev) => {
					const organization = prev.organizations.find((org) => org._id === orgId);
					if (organization) prev.organization = organization;
					else prev.organization = null;

					unSubscribeOrg();
					return prev;
				});
			},
		);

		const unSubscribeApp = useApplicationStore.subscribe(
			(state) => state.applications,
			() => {
				useApplicationStore.setState((prev) => {
					const application = prev.applications.find((app) => app._id === appId);
					if (application) prev.application = application;

					unSubscribeApp();
					return prev;
				});
			},
		);
	}

	return null;
};

export default function OrganizationDetails() {
	const [openAppCreateModal, setOpenAppCreateModal] = useState(false);
	const hideTabMenu = useMatch('/organization/:orgId/apps/:appId/*');
	return (
		<Layout>
			<ApplicationCreateModal
				key={openAppCreateModal.toString()}
				isOpen={openAppCreateModal}
				closeModal={() => setOpenAppCreateModal(false)}
			/>
			{!hideTabMenu && (
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
