import { LoaderFunctionArgs, Outlet } from 'react-router-dom';
import { VersionLayout } from '@/layouts/VersionLayout';
import useEnvironmentStore from '@/store/environment/environmentStore.ts';

export default function Version() {
	return (
		<VersionLayout>
			<Outlet />
		</VersionLayout>
	);
}

Version.loader = async ({ params }: LoaderFunctionArgs) => {
	const { appId, orgId, versionId } = params;
	if (!appId || !orgId || !versionId) return null;

	const environment = await useEnvironmentStore
		.getState()
		.getAppVersionEnvironment({ orgId, appId, versionId });

	return {
		environment,
	};
};
