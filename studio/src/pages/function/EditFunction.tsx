import { useSaveLogicOnSuccess, useToast } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { VersionEditorLayout } from '@/layouts/VersionLayout';
import useFunctionStore from '@/store/function/functionStore';
import { APIError } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export default function EditFunction() {
	const { t } = useTranslation();
	const { toast } = useToast();
	const canEdit = useAuthorizeVersion('function.update');
	const {
		function: helper,
		saveFunctionCode,
		openEditFunctionDrawer,
		logics,
		setLogics,
		deleteLogic,
	} = useFunctionStore();

	const { versionId, appId, orgId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
		funcId: string;
	}>();
	const onSuccess = useSaveLogicOnSuccess(t('function.editLogicSuccess'));
	const { mutate: saveFunctionCodeMutation, isPending } = useMutation({
		mutationFn: saveFunctionCode,
		onSuccess,
		onError: (error: APIError) => {
			toast({
				title: error.details,
				action: 'error',
			});
		},
	});

	function saveLogic(logic: string) {
		saveFunctionCodeMutation({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			funcId: useFunctionStore.getState().function._id as string,
			logic: logic,
		});
	}
	return (
		<VersionEditorLayout
			onEditModalOpen={() => openEditFunctionDrawer(helper)}
			onSaveLogic={saveLogic}
			loading={isPending}
			name={helper._id}
			logic={logics[helper._id]}
			setLogic={(val) => setLogics(helper._id, val)}
			deleteLogic={() => deleteLogic(helper._id)}
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
		/>
	);
}
