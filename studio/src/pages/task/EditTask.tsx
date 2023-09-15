import { Separator } from '@/components/Separator';
import { TestTask } from '@/features/task';
import { useToast } from '@/hooks';
import { VersionEditorLayout } from '@/layouts/VersionLayout';
import useTaskStore from '@/store/task/taskStore';
import cronstrue from 'cronstrue';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoaderFunctionArgs, useParams } from 'react-router-dom';
import useTabStore from '@/store/version/tabStore';
EditTask.loader = async ({ params }: LoaderFunctionArgs) => {
	const { taskId, orgId, versionId, appId } = params;
	if (!taskId) return null;
	const { getCurrentTab, updateCurrentTab, closeDeleteTabModal } = useTabStore.getState();
	const { task } = useTaskStore.getState();
	if (task?._id === taskId && history.state?.type !== 'tabChanged') {
		useTaskStore.setState({
			editedLogic: task.logic,
		});
		updateCurrentTab(versionId as string, {
			...getCurrentTab(versionId as string),
			isDirty: false,
		});
		closeDeleteTabModal();
		return { task };
	}

	await useTaskStore.getState().getTask({
		orgId: orgId as string,
		appId: appId as string,
		versionId: versionId as string,
		taskId: taskId as string,
	});

	return { props: {} };
};

export default function EditTask() {
	const { t } = useTranslation();
	const { notify } = useToast();
	const { task, saveTaskLogic, openEditTaskModal, editedLogic, setEditedLogic } = useTaskStore();
	const [loading, setLoading] = useState(false);
	const [isTestTaskOpen, setIsTestTaskOpen] = useState(false);

	const { versionId, appId, orgId, taskId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
		taskId: string;
	}>();

	function saveLogic(logic: string) {
		setLoading(true);
		saveTaskLogic({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			taskId: taskId as string,
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
			onEditModalOpen={() => openEditTaskModal(task)}
			onTestModalOpen={() => setIsTestTaskOpen(true)}
			onSaveLogic={(value) => saveLogic(value as string)}
			loading={loading}
			logic={editedLogic}
			setLogic={(value) => setEditedLogic(value as string)}
			name={task._id}
			breadCrumbItems={[
				{
					name: t('task.title').toString(),
					url: `/organization/${orgId}/apps/${appId}/version/${versionId}/task`,
				},
				{
					name: task?.name,
				},
			]}
		>
			<div className='flex items-center gap-4 flex-1'>
				<span className='text-xl text-default'>{task.name}</span>
				<Separator orientation='vertical' className='h-[24px] w-[1px]' />
				<span className='text-default font-sfCompact text-sm'>
					{cronstrue.toString(task.cronExpression)}
				</span>
			</div>
			<TestTask open={isTestTaskOpen} onClose={() => setIsTestTaskOpen(false)} />
		</VersionEditorLayout>
	);
}
