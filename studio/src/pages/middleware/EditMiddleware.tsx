import { useToast } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { VersionEditorLayout } from '@/layouts/VersionLayout';
import useMiddlewareStore from '@/store/middleware/middlewareStore.ts';
import { APIError } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { BreadCrumbItem } from 'components/BreadCrumb';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export default function EditMiddleware() {
	const { notify } = useToast();
	const { middlewareId, orgId, appId, versionId } = useParams() as Record<string, string>;
	const canEdit = useAuthorizeVersion('middleware.update');
	const {
		saveMiddlewareCode,
		openEditMiddlewareDrawer,
		middleware,
		logics,
		setLogics,
		deleteLogic,
	} = useMiddlewareStore();
	const { t } = useTranslation();

	const { mutate, isPending } = useMutation({
		mutationKey: ['saveMiddlewareCode'],
		mutationFn: (logic: string) => {
			return saveMiddlewareCode({
				orgId,
				appId,
				versionId,
				mwId: middlewareId,
				logic: logic,
			});
		},
		onSuccess: () => {
			notify({
				title: t('general.success'),
				description: t('version.middleware.edit.success'),
				type: 'success',
			});
		},
		onError(error: APIError) {
			notify({
				title: t('general.error'),
				description: error.details,
				type: 'error',
			});
		},
	});
	async function saveLogic(logic: string) {
		if (!logics[middlewareId] || !canEdit) return;
		mutate(logic);
	}
	function openEditDrawer() {
		openEditMiddlewareDrawer(middleware);
	}

	const url = `/organization/${orgId}/apps/${appId}/version/${versionId}/middleware`;
	const breadcrumbItems: BreadCrumbItem[] = [
		{
			name: t('version.middleware.default').toString(),
			url,
		},
		{
			name: middleware.name,
		},
	];

	return (
		<VersionEditorLayout
			className='p-0'
			breadCrumbItems={breadcrumbItems}
			onEditModalOpen={openEditDrawer}
			onSaveLogic={saveLogic}
			loading={isPending}
			name={middlewareId}
			canEdit={canEdit}
			logic={logics[middlewareId]}
			setLogic={(val) => setLogics(middlewareId, val)}
			deleteLogic={() => deleteLogic(middlewareId)}
		>
			<span className='text-default text-xl'>{middleware.name}</span>
		</VersionEditorLayout>
	);
}
