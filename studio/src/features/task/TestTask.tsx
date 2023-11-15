import { Alert, AlertTitle, AlertDescription } from '@/components/Alert';
import { Button } from '@/components/Button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Logs } from '@/components/Log';
import { Separator } from '@/components/Separator';
import { useToast } from '@/hooks';
import useEnvironmentStore from '@/store/environment/environmentStore';
import useTaskStore from '@/store/task/taskStore';
import { APIError, Log } from '@/types';
import { generateId, joinChannel, leaveChannel } from '@/utils';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
interface TestTaskProps {
	open: boolean;
	onClose: () => void;
}
export default function TestTask({ open, onClose }: TestTaskProps) {
	const { t } = useTranslation();
	const { task, testTask, taskLogs } = useTaskStore();
	const { notify } = useToast();
	const debugChannel = generateId();
	const { environment } = useEnvironmentStore();
	const { versionId, appId, orgId, taskId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
		taskId: string;
	}>();
	const { mutateAsync: testTaskMutation, isPending } = useMutation({
		mutationFn: testTask,
		onError: ({ error, details }: APIError) => {
			notify({
				title: error,
				description: details,
				type: 'error',
			});
		},
		onSettled: () => {
			leaveChannel(debugChannel);
		},
	});
	function testTaskHandler() {
		joinChannel(debugChannel);
		testTaskMutation({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			taskId: taskId as string,
			debugChannel,
		});
	}

	return (
		<Drawer open={open} onOpenChange={onClose}>
			<DrawerContent position='right' size='lg' className='h-full'>
				<DrawerHeader>
					<DrawerTitle>
						{t('task.test', {
							name: task.name,
						})}
					</DrawerTitle>
				</DrawerHeader>
				<div className='p-6 space-y-6 h-full'>
					{environment?.serverStatus === 'Deploying' && (
						<div className='px-5'>
							<Alert variant='warning'>
								<AlertTitle>{t('endpoint.test.deploy.warning')}</AlertTitle>
								<AlertDescription>{t('endpoint.test.deploy.description')}</AlertDescription>
							</Alert>
						</div>
					)}
					<div className='flex items-center justify-between flex-1'>
						<span className='text-xl font-semibold text-default'>{task.name}</span>
						<Button variant='primary' onClick={testTaskHandler} loading={isPending}>
							{t('task.run')}
						</Button>
					</div>
					<Separator />
					<div className='h-5/6'>
						<p className='text-sm text-default font-sfCompact mb-4'>{t('task.console')}</p>
						<Logs logs={taskLogs[taskId as string] as Log[]} />
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
}