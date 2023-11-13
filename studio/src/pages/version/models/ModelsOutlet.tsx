import useAuthStore from '@/store/auth/authStore.ts';
import useDatabaseStore from '@/store/database/databaseStore';
import { LoaderFunctionArgs, Outlet } from 'react-router-dom';

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
	const { database, getDatabaseOfAppById } = useDatabaseStore.getState();
	if (database._id !== apiParams.dbId) getDatabaseOfAppById(apiParams);

	return null;
};
