import TestMessageQueue from '@/features/queue/TestMessageQueue';
import { useToast } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { VersionEditorLayout } from '@/layouts/VersionLayout';
import useMessageQueueStore from '@/store/queue/messageQueueStore';
import { APIError } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export default function EditMessageQueue() {
	const { t } = useTranslation();
	const { notify } = useToast();
	const canEdit = useAuthorizeVersion('queue.update');
	const { updateQueueLogic, queue, openEditModal, setLogics, deleteLogic, logics } =
		useMessageQueueStore();
	const [isTestQueueOpen, setIsTestQueueOpen] = useState(false);

	const { versionId, appId, orgId, queueId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
		queueId: string;
	}>();

	const { mutateAsync: updateQueueCode, isPending } = useMutation({
		mutationFn: updateQueueLogic,
		mutationKey: ['updateQueueLogic'],
		onSuccess: () => {
			notify({
				title: t('general.success'),
				description: t('queue.editLogicSuccess'),
				type: 'success',
			});
		},
		onError: ({ error, details }: APIError) => {
			notify({
				title: error,
				description: details,
				type: 'error',
			});
		},
	});

	function saveLogic(logic: string) {
		updateQueueCode({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			queueId: useMessageQueueStore.getState().queue._id as string,
			logic: logic,
		});
	}
	return (
		<VersionEditorLayout
			onEditModalOpen={() => openEditModal(queue)}
			onTestModalOpen={() => setIsTestQueueOpen(true)}
			onSaveLogic={saveLogic}
			loading={isPending}
			name={queue._id}
			canEdit={canEdit}
			logic={logics[queue._id]}
			setLogic={(val) => setLogics(queue._id, val)}
			deleteLogic={() => deleteLogic(queue._id)}
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
