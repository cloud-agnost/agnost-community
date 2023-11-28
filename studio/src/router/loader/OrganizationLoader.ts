import useApplicationStore from '@/store/app/applicationStore';
import useAuthStore from '@/store/auth/authStore';
import useOrganizationStore from '@/store/organization/organizationStore';
import { Organization } from '@/types';
import { LoaderFunctionArgs } from 'react-router-dom';

export default async function organizationLoader({ params }: LoaderFunctionArgs) {
	const { isAuthenticated } = useAuthStore.getState();
	const { orgId, appId } = params;

	if (isAuthenticated()) {
		const unSubscribeOrg = useOrganizationStore.subscribe(
			(state) => state.organizations,
			() => {
				useOrganizationStore.setState((prev) => {
					const organization = prev.organizations.find((org) => org._id === orgId);
					if (organization) prev.organization = organization;
					else prev.organization = {} as Organization;

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
}
