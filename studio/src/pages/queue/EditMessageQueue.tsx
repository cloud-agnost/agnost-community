import { Button } from '@/components/Button';
import { CodeEditor } from '@/components/CodeEditor';
import { Pencil } from '@/components/icons';
import { useToast } from '@/hooks';
import useMessageQueueStore from '@/store/queue/messageQueueStore';
import { FloppyDisk, TestTube } from '@phosphor-icons/react';
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
		<div className='p-4 space-y-6 h-full'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center flex-1'>
					<span className='text-xl font-semibold text-default'>{queue.name}</span>
				</div>
				<div className='space-x-4'>
					<Button
						variant='secondary'
						iconOnly
						onClick={() => {
							setIsQueueEditModalOpen(true);
						}}
					>
						<Pencil className='text-icon-base w-5 h-5' />
					</Button>
					<Button
						variant='secondary'
						onClick={() => {
							console.log('test');
						}}
					>
						<TestTube size={20} className='text-icon-base mr-2' />
						{t('endpoint.test.test')}
					</Button>
					<Button variant='primary' onClick={saveLogic} loading={loading}>
						<FloppyDisk size={20} className='text-icon-secondary mr-2' />
						{t('general.save')}
					</Button>
				</div>
			</div>

			<CodeEditor
				containerClassName='h-[95%]'
				value={queue.logic}
				onChange={setQueueLogic}
				onSave={saveLogic}
			/>
		</div>
	);
}
