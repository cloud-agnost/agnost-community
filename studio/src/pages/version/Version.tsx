import { VersionLayout } from '@/layouts/VersionLayout';
import useEnvironmentStore from '@/store/environment/environmentStore.ts';
import useVersionStore from '@/store/version/versionStore.ts';
import { LoaderFunctionArgs, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/utils';
import useAuthStore from '@/store/auth/authStore.ts';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { useEffect } from 'react';
export default function Version() {
	const { pathname } = useLocation();
	const paths = pathname.split('/').filter((item) => /^[a-zA-Z-_]+$/.test(item));
	const navigate = useNavigate();
	const canView = useAuthorizeVersion('version.view');

	useEffect(() => {
		if (!canView) {
			navigate('/404');
		}
	}, [canView]);

	return (
		<VersionLayout className={cn(paths.at(-1))}>
			<Outlet />
		</VersionLayout>
	);
}

Version.loader = async ({ params }: LoaderFunctionArgs) => {
	if (!useAuthStore.getState().isAuthenticated()) return null;

	const { appId, orgId, versionId } = params as {
		appId: string;
		orgId: string;
		versionId: string;
	};

	const environment = await useEnvironmentStore
		.getState()
		.getAppVersionEnvironment({ orgId, appId, versionId });

	useVersionStore.getState().getVersionById({ orgId, appId, versionId }).catch(console.error);

	useEnvironmentStore
		.getState()
		.getEnvironmentResources({ orgId, appId, versionId, envId: environment._id })
		.catch(console.error);

	return null;
};
