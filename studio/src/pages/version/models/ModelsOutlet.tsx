import { LoaderFunctionArgs, Outlet } from 'react-router-dom';
import useModelStore from '@/store/database/modelStore.ts';
import useAuthStore from '@/store/auth/authStore.ts';

export default function ModelsOutlet() {
	return <Outlet />;
}

ModelsOutlet.loader = async function ({ params }: LoaderFunctionArgs) {
	if (!useAuthStore.getState().isAuthenticated()) return null;

	const apiParams = params as {
		orgId: string;
		appId: string;
		versionId: string;
		dbId: string;
	};

	const { getModelsOfDatabase } = useModelStore.getState();
	await getModelsOfDatabase(apiParams);
	return null;
};
