import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { VersionLayout } from '@/layouts/VersionLayout';
import useVersionStore from '@/store/version/versionStore.ts';
import { cn } from '@/utils';
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
export default function Version() {
	const { pathname } = useLocation();
	const { getVersionById, version } = useVersionStore();
	const paths = pathname.split('/').filter((item) => /^[a-zA-Z-_]+$/.test(item));
	const navigate = useNavigate();
	const canView = useAuthorizeVersion('version.view');

	const { appId, orgId, versionId } = useParams<{
		appId: string;
		orgId: string;
		versionId: string;
	}>();

	useEffect(() => {
		if (!canView) {
			navigate('/404');
		}
	}, [canView]);

	useEffect(() => {
		if (versionId && versionId !== version?._id && appId && orgId) {
			getVersionById({ appId, orgId, versionId });
		}
	}, [appId, orgId, versionId]);

	return (
		<VersionLayout className={cn(paths.at(-1))}>
			<Outlet />
		</VersionLayout>
	);
}
