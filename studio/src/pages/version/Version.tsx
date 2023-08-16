import { VersionLayout } from '@/layouts/VersionLayout';
import useEnvironmentStore from '@/store/environment/environmentStore.ts';
import useVersionStore from '@/store/version/versionStore.ts';
import { LoaderFunctionArgs, Outlet, useLocation, useNavigate } from 'react-router-dom';
import useMiddlewareStore from '@/store/middleware/middlewareStore.ts';
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

Version.loader = async ({ params, request }: LoaderFunctionArgs) => {
	if (!useAuthStore.getState().isAuthenticated()) return null;
	const { appId, orgId, versionId } = params;
	if (!appId || !orgId || !versionId) return null;

	const url = new URL(request.url);

	const environment = await useEnvironmentStore
		.getState()
		.getAppVersionEnvironment({ orgId, appId, versionId });

	const version = await useVersionStore.getState().getVersionById({ orgId, appId, versionId });

	await useEnvironmentStore
		.getState()
		.getEnvironmentResources({ orgId, appId, versionId, envId: environment._id });

	await useMiddlewareStore.getState().getMiddlewaresOfAppVersion(
		{
			orgId,
			appId,
			versionId,
			page: 0,
			size: 15,
			search: url.searchParams.get('q') || undefined,
		},
		true,
	);

	return { version, environment };
};
