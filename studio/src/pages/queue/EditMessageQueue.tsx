import TestMessageQueue from '@/features/queue/TestMessageQueue';
import { useToast } from '@/hooks';
import { VersionEditorLayout } from '@/layouts/VersionLayout';
import useMessageQueueStore from '@/store/queue/messageQueueStore';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoaderFunctionArgs, useParams } from 'react-router-dom';
import useTabStore from '@/store/version/tabStore';
EditMessageQueue.loader = async ({ params }: LoaderFunctionArgs) => {
	const { queueId, orgId, versionId, appId } = params;
	if (!queueId) return null;
	const { getCurrentTab, updateCurrentTab, closeDeleteTabModal } = useTabStore.getState();
	const { queue } = useMessageQueueStore.getState();
	if (queue?._id === queueId && history.state?.type !== 'tabChanged') {
		useMessageQueueStore.setState({
			editedLogic: queue.logic,
		});
		updateCurrentTab(versionId as string, {
			...getCurrentTab(versionId as string),
			isDirty: false,
		});
		closeDeleteTabModal();
		return { queue };
	}

	await useMessageQueueStore.getState().getQueueById({
		orgId: orgId as string,
		appId: appId as string,
		versionId: versionId as string,
		queueId: queueId,
	});

	return { props: {} };
};

export default function EditMessageQueue() {
	const { t } = useTranslation();
	const { notify } = useToast();
	const { updateQueueLogic, queue, openEditModal, editedLogic, setEditedLogic } =
		useMessageQueueStore();
	const [loading, setLoading] = useState(false);
	const [isTestQueueOpen, setIsTestQueueOpen] = useState(false);

	const { versionId, appId, orgId, queueId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
		queueId: string;
	}>();

	function saveLogic(logic: string) {
		setLoading(true);
		updateQueueLogic({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			queueId: queueId as string,
			logic: logic ?? editedLogic,
			onSuccess: () => {
				setLoading(false);
				notify({
					title: t('general.success'),
					description: t('queue.editLogicSuccess'),
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
			onEditModalOpen={() => openEditModal(queue)}
			onTestModalOpen={() => setIsTestQueueOpen(true)}
			onSaveLogic={(value) => saveLogic(value as string)}
			loading={loading}
			logic={editedLogic}
			setLogic={(value) => setEditedLogic(value as string)}
			name={queue._id}
			breadCrumbItems={[
				{
					name: t('queue.title').toString(),
					url: `/organization/${orgId}/apps/${appId}/version/${versionId}/queue`,
				},
				{
					name: queue?.name,
				},
			]}
		>
			<div className='flex items-center flex-1'>
				<span className='text-xl font-semibold text-default'>{queue.name}</span>
			</div>
			<TestMessageQueue open={isTestQueueOpen} onClose={() => setIsTestQueueOpen(false)} />
		</VersionEditorLayout>
	);
}
