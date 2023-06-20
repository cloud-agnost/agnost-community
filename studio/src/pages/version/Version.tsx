import { LoaderFunctionArgs, Outlet } from 'react-router-dom';
import { VersionLayout } from '@/layouts/VersionLayout';
import useVersionStore from '@/store/version/versionStore.ts';

export default function Version() {
	return (
		<VersionLayout>
			<Outlet />
		</VersionLayout>
	);
}

Version.loader = async ({ params }: LoaderFunctionArgs) => {
	const { appId, orgId } = params;
	console.log(appId, orgId);
	if (!appId || !orgId) return null;
	await useVersionStore.getState().getAllVersionsVisibleToUser(orgId, appId);
	return null;
};
