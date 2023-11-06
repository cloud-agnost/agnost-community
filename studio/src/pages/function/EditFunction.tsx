import { useToast } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { VersionEditorLayout } from '@/layouts/VersionLayout';
import useFunctionStore from '@/store/function/functionStore';
import useTabStore from '@/store/version/tabStore';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoaderFunctionArgs, useParams } from 'react-router-dom';

EditFunction.loader = async ({ params }: LoaderFunctionArgs) => {
	const { funcId, orgId, versionId, appId } = params;
	if (!funcId) return null;
	const { getCurrentTab, updateCurrentTab, closeDeleteTabModal } = useTabStore.getState();
	const { function: helper } = useFunctionStore.getState();
	if (helper?._id === funcId && history.state?.type !== 'tabChanged') {
		useFunctionStore.setState({
			editedLogic: helper.logic,
		});
		updateCurrentTab(versionId as string, {
			...getCurrentTab(versionId as string),
			isDirty: false,
		});
		closeDeleteTabModal();
		return { helper };
	}

	await useFunctionStore.getState().getFunctionById({
		orgId: orgId as string,
		appId: appId as string,
		versionId: versionId as string,
		funcId: funcId as string,
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
	const [loading, setLoading] = useState(false);

	const { versionId, appId, orgId, funcId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
		funcId: string;
	}>();

	function saveLogic(logic: string) {
		setLoading(true);
		saveFunctionCode({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			funcId: funcId as string,
			logic: logic ?? editedLogic,
			onSuccess: () => {
				setLoading(false);
				notify({
					title: t('general.success'),
					description: t('endpoint.editLogicSuccess'),
					type: 'success',
				});
			},
			onError: ({ error, details }) => {
				setLoading(false);
				notify({
					title: error,
					description: details,
					type: 'error',
				});
			},
		});
	}
	return (
		<VersionEditorLayout
			onEditModalOpen={() => openEditFunctionDrawer(helper)}
			onSaveLogic={(value) => saveLogic(value as string)}
			loading={loading}
			logic={editedLogic}
			setLogic={(value) => setEditedLogic(value as string)}
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
