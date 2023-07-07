import { VersionLayout } from '@/layouts/VersionLayout';
import useEnvironmentStore from '@/store/environment/environmentStore.ts';
import useVersionStore from '@/store/version/versionStore.ts';
import { LoaderFunctionArgs, Outlet } from 'react-router-dom';

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

	const version = await useVersionStore.getState().getVersionById({ orgId, appId, versionId });

	return { version, environment };
};
