import { useMemo, useState } from 'react';
import { Middleware } from '@/types';
import { LoaderFunctionArgs, useLoaderData, useParams } from 'react-router-dom';
import useMiddlewareStore from '@/store/middleware/middlewareStore.ts';
import { VersionEditorLayout } from '@/layouts/VersionLayout';
import { BreadCrumbItem } from 'components/BreadCrumb';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks';
EditMiddleware.loader = async ({ params }: LoaderFunctionArgs) => {
	const { middlewareId, orgId, appId, versionId } = params as Record<string, string>;
	const res = await useMiddlewareStore.getState().getMiddlewareById({
		orgId,
		appId,
		versionId,
		mwId: middlewareId,
	});
	return { middlewareFromApi: res };
};

export default function EditMiddleware() {
	const { notify } = useToast();
	const { middlewareFromApi } = useLoaderData() as { middlewareFromApi: Middleware };
	const { middlewareId, orgId, appId, versionId } = useParams() as Record<string, string>;
	const { saveMiddlewareCode, setEditMiddlewareDrawerIsOpen, middlewares } = useMiddlewareStore();
	const [loading, setLoading] = useState(false);
	const [middleware, setMiddleware] = useState<Middleware>(middlewareFromApi);
	const { t } = useTranslation();
	const name = useMemo(() => {
		return middlewares.find((mw) => mw._id === middlewareId)?.name;
	}, [middlewares, middlewareId]);

	async function saveLogic() {
		if (!middleware?.logic) return;
		try {
			setLoading(true);
			saveMiddlewareCode({
				orgId,
				appId,
				versionId,
				mwId: middlewareId,
				logic: middleware?.logic,
				onSuccess: () => {
					notify({
						title: t('general.success'),
						description: t('version.middleware.edit.success'),
						type: 'success',
					});
				},
				onError: (error) => {
					notify({
						title: t('general.error'),
						description: error.details,
						type: 'error',
					});
				},
			});
		} finally {
			setLoading(false);
		}
	}
	function openEditDrawer() {
		setEditMiddlewareDrawerIsOpen(true);
		setMiddleware(middleware);
	}

	function setLogic(logic?: string) {
		if (!logic) return;
		setMiddleware((prev) => {
			if (!prev) return prev;
			return { ...prev, logic };
		});
	}
	const url = `/organization/${orgId}/apps/${appId}/version/${versionId}/middleware`;
	const breadcrumbItems: BreadCrumbItem[] = [
		{
			name: t('version.middleware.default').toString(),
			url,
		},
		{
			name,
		},
	];
	return (
		<VersionEditorLayout
			className='p-0'
			breadCrumbItems={breadcrumbItems}
			onEditModalOpen={openEditDrawer}
			onSaveLogic={saveLogic}
			loading={loading}
			logic={middleware?.logic}
			setLogic={setLogic}
			name={middlewareId}
		>
			<span className='text-default text-xl'>{name}</span>
		</VersionEditorLayout>
	);
}
