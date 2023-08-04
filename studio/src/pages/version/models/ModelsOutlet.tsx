import { LoaderFunctionArgs, Outlet } from 'react-router-dom';
import useModelStore from '@/store/database/modelStore.ts';

export default function ModelsOutlet() {
	return <Outlet />;
}

ModelsOutlet.loader = async function ({ params }: LoaderFunctionArgs) {
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
