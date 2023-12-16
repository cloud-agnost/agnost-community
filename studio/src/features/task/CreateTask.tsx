import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form } from '@/components/Form';
import { useTabNavigate, useToast } from '@/hooks';
import useResourceStore from '@/store/resources/resourceStore';
import useTaskStore from '@/store/task/taskStore';
import { APIError, CreateTaskSchema, TabTypes } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import * as z from 'zod';
import TaskForm from './TaskForm';
import { useMutation } from '@tanstack/react-query';
import useEnvironmentStore from '@/store/environment/environmentStore';
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
		defaultValues: {
			logExecution: true,
		},
	});
	const { pathname } = useLocation();
	const { versionId, appId, orgId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();
	const { getResources } = useResourceStore();
	const { getEnvironmentResources, environment } = useEnvironmentStore();

	useEffect(() => {
		if (open) {
			getResources({
				orgId: orgId as string,
				type: 'scheduler',
			});
		}
	}, [open]);

	const { mutateAsync: createTaskMutate, isPending } = useMutation({
		mutationFn: createTask,
		onSuccess: (task) => {
			navigate({
				title: task.name,
				path: `${pathname}/${task._id}`,
				isActive: true,
				isDashboard: false,
				type: TabTypes.Task,
			});
			getEnvironmentResources({
				orgId: environment?.orgId,
				appId: environment?.appId,
				envId: environment?._id,
				versionId: environment?.versionId,
			});
			handleClose();
		},
		onError: ({ error, details }: APIError) => {
			notify({ type: 'error', description: details, title: error });
		},
	});
	function onSubmit(data: z.infer<typeof CreateTaskSchema>) {
		createTaskMutate({
			...data,
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			resourceId: resources[0]._id,
		});
	}

	function handleClose() {
		form.reset();
		onClose();
	}

	return (
		<Drawer open={open} onOpenChange={handleClose}>
			<DrawerContent position='right' size='lg' className='h-full'>
				<DrawerHeader>
					<DrawerTitle>{t('task.add')}</DrawerTitle>
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
