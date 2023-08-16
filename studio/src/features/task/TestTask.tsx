import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { useTranslation } from 'react-i18next';
import useTaskStore from '@/store/task/taskStore';
import { Separator } from '@/components/Separator';
import { Button } from '@/components/Button';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { generateId, joinChannel, leaveChannel } from '@/utils';
import { useToast } from '@/hooks';
import Logs from '../../components/Logs/Logs';
interface TestTaskProps {
	open: boolean;
	onClose: () => void;
}
export default function TestTask({ open, onClose }: TestTaskProps) {
	const { t } = useTranslation();
	const { task, testTask, taskLogs } = useTaskStore();
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
					<DrawerTitle>
						{t('task.test', {
							name: task.name,
						})}
					</DrawerTitle>
				</DrawerHeader>
				<div className='p-6 space-y-6'>
					<div className='flex items-center justify-between flex-1'>
						<span className='text-xl font-semibold text-default'>{task.name}</span>
						<Button variant='primary' onClick={testTaskHandler} loading={loading}>
							{t('task.run')}
						</Button>
					</div>
					<Separator />
					<p className='text-sm text-default font-sfCompact mb-4'>{t('task.console')}</p>
					<Logs logs={taskLogs[taskId as string] as string[]} />
				</div>
			</DrawerContent>
		</Drawer>
	);
}
