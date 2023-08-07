import TestMessageQueue from '@/features/queue/TestMessageQueue';
import { useToast } from '@/hooks';
import { VersionEditorLayout } from '@/layouts/VersionLayout';
import useMessageQueueStore from '@/store/queue/messageQueueStore';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoaderFunctionArgs, useOutletContext, useParams } from 'react-router-dom';
EditMessageQueue.loader = async ({ params }: LoaderFunctionArgs) => {
	const { queueId, orgId, versionId, appId } = params;
	if (!queueId) return null;

	await useMessageQueueStore.getState().getQueueById({
		orgId: orgId as string,
		appId: appId as string,
		versionId: versionId as string,
		queueId: queueId as string,
	});

	return null;
};

export default function EditMessageQueue() {
	const { t } = useTranslation();
	const { notify } = useToast();
	const { updateQueueLogic, queue } = useMessageQueueStore();
	const [queueLogic, setQueueLogic] = useState<string | undefined>(queue.logic);
	const [loading, setLoading] = useState(false);
	const [isTestQueueOpen, setIsTestQueueOpen] = useState(false);
	const { setIsQueueEditModalOpen } = useOutletContext() as {
		setIsQueueEditModalOpen: (isOpen: boolean) => void;
	};
	const { versionId, appId, orgId, queueId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
		queueId: string;
	}>();

	function saveLogic() {
		setLoading(true);
		updateQueueLogic({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			queueId: queueId as string,
			logic: queueLogic as string,
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
			onEditModalOpen={() => setIsQueueEditModalOpen(true)}
			onTestModalOpen={() => setIsTestQueueOpen(true)}
			onSaveLogic={saveLogic}
			loading={loading}
			logic={queue?.logic}
			setLogic={setQueueLogic}
		>
			<div className='flex items-center flex-1'>
				<span className='text-xl font-semibold text-default'>{queue.name}</span>
			</div>
			<TestMessageQueue open={isTestQueueOpen} onClose={() => setIsTestQueueOpen(false)} />
		</VersionEditorLayout>
	);
}
