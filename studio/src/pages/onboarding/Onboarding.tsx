import useClusterStore from '@/store/cluster/clusterStore.ts';
import { OnboardingLayout } from '@/layouts/OnboardingLayout';
import { Outlet } from 'react-router-dom';

async function loader() {
	const status = await useClusterStore.getState().checkClusterSetup();
	if (status) {
		// TODO: Check if user is logged in
	}
	return null;
}

export default function Onboarding() {
	return (
		<OnboardingLayout>
			<Outlet />
		</OnboardingLayout>
	);
}

Onboarding.loader = loader;
