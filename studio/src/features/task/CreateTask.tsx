import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form } from '@/components/Form';
import { useTabNavigate, useToast } from '@/hooks';
import useResourceStore from '@/store/resources/resourceStore';
import useTaskStore from '@/store/task/taskStore';
import { CreateTaskSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import * as z from 'zod';
import TaskForm from './TaskForm';
interface CreateTaskProps {
	open: boolean;
	onClose: () => void;
}

export default function CreateTask({ open, onClose }: CreateTaskProps) {
	const { t } = useTranslation();
	const { createTask } = useTaskStore();
	const { notify } = useToast();
	const { resources } = useResourceStore();
	const navigate = useTabNavigate();
	const form = useForm<z.infer<typeof CreateTaskSchema>>({
		resolver: zodResolver(CreateTaskSchema),
	});
	const { pathname } = useLocation();
	const { versionId, appId, orgId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();
	const { getResources } = useResourceStore();

	useEffect(() => {
		getResources({
			type: 'scheduler',
		});
	}, []);
	function onSubmit(data: z.infer<typeof CreateTaskSchema>) {
		createTask({
			...data,
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			resourceId: resources[0]._id,
			onSuccess: (task) => {
				form.reset({
					name: '',
					cronExpression: '',
					logExecution: false,
				});
				navigate({
					title: task.name,
					path: `${pathname}/${task._id}`,
					isActive: true,
					isDashboard: false,
					type: 'Task',
				});
				onClose();
			},
			onError: ({ error, details }) => {
				form.reset({
					name: '',
					cronExpression: '',
					logExecution: false,
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
				});
				onClose();
			}}
		>
			<DrawerContent position='right' size='lg' className='h-full'>
				<DrawerHeader>
					<DrawerTitle>{t('task.add')}</DrawerTitle>
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
