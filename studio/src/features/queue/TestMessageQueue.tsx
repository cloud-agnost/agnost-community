import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { useTranslation } from 'react-i18next';
import { Separator } from '@/components/Separator';
import { Button } from '@/components/Button';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { generateId, joinChannel, leaveChannel } from '@/utils';
import { useToast } from '@/hooks';
import useMessageQueueStore from '@/store/queue/messageQueueStore';
import { CodeEditor } from '@/components/CodeEditor';
import { Logs } from '@/components/Log';

interface TestMessageQueueProps {
	open: boolean;
	onClose: () => void;
}
export default function TestMessageQueue({ open, onClose }: TestMessageQueueProps) {
	const { t } = useTranslation();
	const { queue, testQueue, testQueueLogs } = useMessageQueueStore();
	const [loading, setLoading] = useState(false);
	const [payload, setPayload] = useState(testQueueLogs[queue?._id]?.payload ?? {});
	const { notify } = useToast();
	const { versionId, appId, orgId, queueId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
		queueId: string;
	}>();
	function testTaskHandler() {
		setLoading(true);
		const debugChannel = generateId();
		joinChannel(debugChannel);
		testQueue({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			queueId: queueId as string,
			debugChannel,
			payload,
			onSuccess: () => {
				setLoading(false);
			},
			onError: ({ error, details }) => {
				notify({
					title: error,
					description: details,
					type: 'error',
				});
				setLoading(false);
			},
		});
		setTimeout(() => {
			leaveChannel(debugChannel);
		}, 1000);
	}
	return (
		<Drawer
			open={open}
			onOpenChange={() => {
				onClose();
			}}
		>
			<DrawerContent position='right' size='lg' className='h-full'>
				<DrawerHeader>
					<DrawerTitle>{t('queue.test.title')}</DrawerTitle>
				</DrawerHeader>
				<div className='p-6'>
					<div className='flex items-center justify-between flex-1'>
						<span className='text-xl font-semibold text-default'>{queue.name}</span>
						<Button variant='primary' onClick={testTaskHandler} loading={loading}>
							{t('queue.test.submit')}
						</Button>
					</div>
					<Separator className='my-6' />
					<p className='text-sm text-default font-sfCompact mb-4'>{t('queue.test.payload')}</p>
					<CodeEditor
						value={JSON.stringify(payload, null, 2)}
						onChange={(value) => setPayload(JSON.parse(value as string))}
						defaultLanguage='json'
						className='h-96'
					/>
					<Separator className='my-6' />
					<p className='text-sm text-default font-sfCompact mb-4'>{t('task.console')}</p>
					<Logs logs={testQueueLogs[queue?._id]?.logs as string[]} />
				</div>
			</DrawerContent>
		</Drawer>
	);
}
