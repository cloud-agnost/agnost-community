import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form } from '@/components/Form';
import { useToast } from '@/hooks';
import useTaskStore from '@/store/task/taskStore';
import { APIError, CreateTaskSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import * as z from 'zod';
import TaskForm from './TaskForm';
import useResourceStore from '@/store/resources/resourceStore';
import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
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
		taskId: string;
	}>();

	const form = useForm<z.infer<typeof CreateTaskSchema>>({
		resolver: zodResolver(CreateTaskSchema),
	});
	const { mutateAsync: updateTaskMutation, isPending } = useMutation({
		mutationFn: updateTask,
		onSuccess: handleClose,
		onError: ({ error, details }: APIError) => {
			notify({
				title: error,
				description: details,
				type: 'error',
			});
		},
	});
	function onSubmit(data: z.infer<typeof CreateTaskSchema>) {
		updateTaskMutation({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			taskId: task._id,
			resourceId: resources[0]._id,
			...data,
		});
	}

	function handleClose() {
		onClose();
		form.reset();
	}

	useEffect(() => {
		if (task) {
			form.reset(task);
		}
	}, [task]);
	return (
		<Drawer open={open} onOpenChange={handleClose}>
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
						<TaskForm loading={isPending} />
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
