import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { VersionLayout } from '@/layouts/VersionLayout';
import useApplicationStore from '@/store/app/applicationStore';
import useVersionStore from '@/store/version/versionStore.ts';
import { cn, joinChannel } from '@/utils';
import _ from 'lodash';
import { useEffect } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';

export default function Version() {
	const { pathname } = useLocation();
	const { getVersionById, version } = useVersionStore();
	const { getAppById, application } = useApplicationStore();
	const paths = pathname.split('/').filter((item) => /^[a-zA-Z-_]+$/.test(item));
	const canView = useAuthorizeVersion('version.view');

	const { appId, orgId, versionId } = useParams<{
		appId: string;
		orgId: string;
		versionId: string;
	}>();

	useEffect(() => {
		//TODO: move to loader
		if (!canView) {
			// navigate('/404');
		}
	}, [canView]);

	useEffect(() => {
		if (_.isEmpty(application)) {
			getAppById(orgId as string, appId as string);
		} else {
			joinChannel(appId as string);
		}
	}, [appId]);

	useEffect(() => {
		if (_.isEmpty(version)) {
			getVersionById({
				appId: appId as string,
				orgId: orgId as string,
				versionId: versionId as string,
			});
		} else {
			joinChannel(versionId as string);
		}
	}, [versionId]);

	return (
		<VersionLayout
			className={cn(
				paths.slice(-1).pop(),
				paths.some((p) => p === 'settings') && '!overflow-hidden',
			)}
		>
			<Outlet />
		</VersionLayout>
	);
}
