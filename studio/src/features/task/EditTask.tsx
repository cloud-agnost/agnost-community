import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form } from '@/components/Form';
import { useToast } from '@/hooks';
import useTaskStore from '@/store/task/taskStore';
import { CreateTaskSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import * as z from 'zod';
import TaskForm from './TaskForm';
import useResourceStore from '@/store/resources/resourceStore';

interface EditTaskProps {
	open: boolean;
	onClose: () => void;
}

export default function EditTask({ open, onClose }: EditTaskProps) {
	const { t } = useTranslation();
	const { updateTask, task } = useTaskStore();
	const { notify } = useToast();
	const { resources } = useResourceStore();
	const { versionId, appId, orgId, taskId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
		taskId: string;
	}>();

	const form = useForm<z.infer<typeof CreateTaskSchema>>({
		resolver: zodResolver(CreateTaskSchema),
		defaultValues: {
			name: task.name,
			cronExpression: task.cronExpression,
			logExecution: task.logExecution,
		},
	});

	function onSubmit(data: z.infer<typeof CreateTaskSchema>) {
		updateTask({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			taskId: taskId as string,
			resourceId: resources[0]._id,
			...data,
			onSuccess: () => {
				onClose();
			},
			onError: ({ error, details }) => {
				notify({ type: 'error', description: details, title: error });
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
						{t('task.edit', {
							name: task.name,
						})}
					</DrawerTitle>
				</DrawerHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='p-6 scroll'>
						<TaskForm />
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
