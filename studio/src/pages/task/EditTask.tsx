import { Separator } from '@/components/Separator';
import { TestTask } from '@/features/task';
import { useToast } from '@/hooks';
import { VersionEditorLayout } from '@/layouts/VersionLayout';
import useTaskStore from '@/store/task/taskStore';
import cronstrue from 'cronstrue';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoaderFunctionArgs, useParams } from 'react-router-dom';

EditTask.loader = async ({ params }: LoaderFunctionArgs) => {
	const { taskId, orgId, versionId, appId } = params;
	if (!taskId) return null;

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
	const { task, saveTaskLogic, openEditTaskModal } = useTaskStore();
	const [taskLogic, setTaskLogic] = useState<string | undefined>(task.logic);
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
			logic: logic ?? taskLogic,
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
			logic={taskLogic}
			setLogic={setTaskLogic}
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
