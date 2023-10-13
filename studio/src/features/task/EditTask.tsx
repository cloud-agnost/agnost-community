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
import { useEffect } from 'react';
interface EditTaskProps {
	open: boolean;
	onClose: () => void;
}

export default function EditTask({ open, onClose }: EditTaskProps) {
	const { t } = useTranslation();
	const { updateTask, task } = useTaskStore();
	const { notify } = useToast();
	const { resources } = useResourceStore();
	const { versionId, appId, orgId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();

	const form = useForm<z.infer<typeof CreateTaskSchema>>({
		resolver: zodResolver(CreateTaskSchema),
	});

	function onSubmit(data: z.infer<typeof CreateTaskSchema>) {
		updateTask({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			taskId: task._id as string,
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

	useEffect(() => {
		if (task) {
			form.reset(task);
		}
	}, [task]);
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
