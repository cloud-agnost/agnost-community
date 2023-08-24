import { LoaderFunctionArgs, Outlet } from 'react-router-dom';
import useAuthStore from '@/store/auth/authStore.ts';
import useMiddlewareStore from '@/store/middleware/middlewareStore.ts';

VersionMiddlewaresOutlet.loader = async ({ params, request }: LoaderFunctionArgs) => {
	if (!useAuthStore.getState().isAuthenticated()) return null;
	const { appId, orgId, versionId } = params;
	if (!appId || !orgId || !versionId) return null;

	const url = new URL(request.url);

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

	return null;
};

export default function VersionMiddlewaresOutlet() {
	return (
		<div className='pt-6 px-6 space-y-6 h-full flex flex-col overflow-auto'>
			<Outlet />
		</div>
	);
}
