import { Outlet, redirect } from 'react-router-dom';
import useClusterStore from '@/store/cluster/clusterStore.ts';

async function loader() {
	const status = await useClusterStore.getState().checkClusterSetup();
	await useClusterStore.getState().checkClusterSmtpStatus();

	// TODO: Check if user is logged in
	if (!status) {
		return redirect('/onboarding');
	}
	return null;
}

export default function Root() {
	return <Outlet />;
}

Root.loader = loader;
