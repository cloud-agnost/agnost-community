import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { VersionLayout } from '@/layouts/VersionLayout';
import useVersionStore from '@/store/version/versionStore.ts';
import { cn } from '@/utils';
import { useEffect } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
export default function Version() {
	const { pathname } = useLocation();
	const { getVersionById } = useVersionStore();
	const paths = pathname.split('/').filter((item) => /^[a-zA-Z-_]+$/.test(item));
	const canView = useAuthorizeVersion('version.view');

	const { appId, orgId, versionId } = useParams<{
		appId: string;
		orgId: string;
		versionId: string;
	}>();

	useEffect(() => {
		if (!canView) {
			// navigate('/404');
		}
	}, [canView]);

	useEffect(() => {
		getVersionById({
			appId: appId as string,
			orgId: orgId as string,
			versionId: versionId as string,
		});
	}, [appId, orgId, versionId]);

	return (
		<VersionLayout className={cn(paths.at(-1))}>
			<Outlet />
		</VersionLayout>
	);
}
