import { Middlewares } from '@/features/version/Middlewares';
import { useId, useState } from 'react';
import { Row } from '@tanstack/react-table';
import { Middleware } from '@/types';
import { LoaderFunctionArgs } from 'react-router-dom';
import useAuthStore from '@/store/auth/authStore.ts';
import useMiddlewareStore from '@/store/middleware/middlewareStore.ts';

VersionMiddlewares.loader = async ({ params, request }: LoaderFunctionArgs) => {
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

export default function VersionMiddlewares() {
	const [selectedRows, setSelectedRows] = useState<Row<Middleware>[]>();
	const id = useId();

	return (
		<div id={id} className='pt-12 px-6 space-y-6 h-full flex flex-col overflow-auto'>
			<Middlewares parentId={id} setSelectedRows={setSelectedRows} selectedRows={selectedRows} />
		</div>
	);
}
