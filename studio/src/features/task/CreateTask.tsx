import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form } from '@/components/Form';
import { useToast } from '@/hooks';
import { CreateTaskSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import * as z from 'zod';
import useTaskStore from '@/store/task/taskStore';
import TaskForm from './TaskForm';

interface CreateTaskProps {
	open: boolean;
	onClose: () => void;
}

export default function CreateTask({ open, onClose }: CreateTaskProps) {
	const { t } = useTranslation();
	const { createTask } = useTaskStore();
	const { notify } = useToast();
	const form = useForm<z.infer<typeof CreateTaskSchema>>({
		resolver: zodResolver(CreateTaskSchema),
	});
	const { versionId, appId, orgId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();

	function onSubmit(data: z.infer<typeof CreateTaskSchema>) {
		createTask({
			...data,
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			onSuccess: () => {
				form.reset({
					name: '',
					cronExpression: '',
					logExecution: false,
					resourceId: '',
				});
				onClose();
			},
			onError: ({ error, details }) => {
				form.reset({
					name: '',
					cronExpression: '',
					logExecution: false,
					resourceId: '',
				});
				notify({ type: 'error', description: details, title: error });
			},
		});
	}

	return (
		<Drawer
			open={open}
			onOpenChange={() => {
				form.reset({
					name: '',
					cronExpression: '',
					logExecution: false,
					resourceId: '',
				});
				onClose();
			}}
		>
			<DrawerContent position='right' size='lg' className='h-full'>
				<DrawerHeader>
					<DrawerTitle>{t('endpoint.create.title')}</DrawerTitle>
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
