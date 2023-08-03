import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { useTranslation } from 'react-i18next';
import useTaskStore from '@/store/task/taskStore';
import { Separator } from '@/components/Separator';
import { Button } from '@/components/Button';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { generateId, joinChannel, leaveChannel } from '@/utils';
import { useToast } from '@/hooks';
interface TestTaskProps {
	open: boolean;
	onClose: () => void;
}
export default function TestTask({ open, onClose }: TestTaskProps) {
	const { t } = useTranslation();
	const { task, testTask } = useTaskStore();
	const [loading, setLoading] = useState(false);
	const { notify } = useToast();
	const { versionId, appId, orgId, taskId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
		taskId: string;
	}>();

	function testTaskHandler() {
		setLoading(true);
		const debugChannel = generateId();
		joinChannel(debugChannel);
		testTask({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			taskId: taskId as string,
			debugChannel,
			onSuccess: () => {
				leaveChannel(debugChannel);
				setLoading(false);
			},
			onError: ({ error, details }) => {
				notify({
					title: error,
					description: details,
					type: 'error',
				});
				leaveChannel(debugChannel);
				setLoading(false);
			},
		});
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
					<DrawerTitle>{t('endpoint.create.title')}</DrawerTitle>
				</DrawerHeader>
				<div className='p-6'>
					<div className='flex items-center justify-between flex-1'>
						<span className='text-xl font-semibold text-default'>{task.name}</span>
						<Button variant='primary' onClick={testTaskHandler} loading={loading}>
							{t('task.run')}
						</Button>
					</div>
					<Separator />
					<span className='text-xl font-semibold text-default'>{t('task.console')}</span>
					<div className='whitespace-pre text-default leading-6 text-sm font-mono'>
						<>{`2023-03-01T09:28:45 Started deployment process
2023-03-01T09:28:45 Started processing HR portal database (2ms)
2023-03-01T09:28:45 Completed processing database (2ms)
2023-03-01T09:28:45 Started processing Accounting database (2ms)
2023-03-01T09:28:45 Completed processing Accounting database (2ms)
2023-03-01T09:28:45 Created default collections (2ms)
2023-03-01T09:28:45 Deployed endpoints (2ms)`}</>
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
