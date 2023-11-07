import { useToast } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { VersionEditorLayout } from '@/layouts/VersionLayout';
import useFunctionStore from '@/store/function/functionStore';
import useTabStore from '@/store/version/tabStore';
import { APIError } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { LoaderFunctionArgs, useParams } from 'react-router-dom';

EditFunction.loader = async ({ params }: LoaderFunctionArgs) => {
	const { funcId, orgId, versionId, appId } = params as Record<string, string>;
	if (!funcId) return null;
	const { editedLogic, getFunctionById } = useFunctionStore.getState();
	const { getCurrentTab, updateCurrentTab, closeDeleteTabModal } = useTabStore.getState();
	const { function: helper } = useFunctionStore.getState();
	if (helper?._id === funcId) {
		updateCurrentTab(versionId, {
			...getCurrentTab(versionId),
			isDirty: helper.logic !== editedLogic,
		});
		closeDeleteTabModal();
		return { helper };
	}

	await getFunctionById({
		orgId: orgId,
		appId: appId,
		versionId: versionId,
		funcId: funcId,
	});

	return { props: {} };
};

export default function EditFunction() {
	const { t } = useTranslation();
	const { notify } = useToast();
	const canEdit = useAuthorizeVersion('function.update');
	const {
		function: helper,
		saveFunctionCode,
		openEditFunctionDrawer,
		editedLogic,
		setEditedLogic,
	} = useFunctionStore();

	const { versionId, appId, orgId, funcId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
		funcId: string;
	}>();
	const { mutate: saveFunctionCodeMutation, isPending } = useMutation({
		mutationFn: saveFunctionCode,
		onSuccess: () => {
			notify({
				title: t('general.success'),
				description: t('endpoint.editLogicSuccess'),
				type: 'success',
			});
		},
		onError: (error: APIError) => {
			notify({
				title: error.error,
				description: error.details,
				type: 'error',
			});
		},
	});

	function saveLogic(logic: string) {
		saveFunctionCodeMutation({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			funcId: funcId as string,
			logic: logic ?? editedLogic,
		});
	}
	return (
		<VersionEditorLayout
			onEditModalOpen={() => openEditFunctionDrawer(helper)}
			onSaveLogic={saveLogic}
			loading={isPending}
			logic={editedLogic}
			setLogic={setEditedLogic}
			name={helper._id}
			breadCrumbItems={[
				{
					name: t('function.title').toString(),
					url: `/organization/${orgId}/apps/${appId}/version/${versionId}/function`,
				},
				{
					name: helper?.name,
				},
			]}
			canEdit={canEdit}
		>
			<div className='flex items-center flex-1'>
				<span className='text-xl font-semibold text-default'>{helper.name}</span>
			</div>
		</VersionEditorLayout>
	);
}
