import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form } from '@/components/Form';
import { useTabNavigate, useToast } from '@/hooks';
import useMessageQueueStore from '@/store/queue/messageQueueStore';
import { APIError, CreateMessageQueueSchema, TabTypes } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import * as z from 'zod';
import MessageQueueForm from './MessageQueueForm';
import { removeEmptyFields } from '@/utils';
import { useMutation } from '@tanstack/react-query';
interface CreateQueueProps {
	open: boolean;
	onClose: () => void;
}

export default function CreateMessageQueue({ open, onClose }: CreateQueueProps) {
	const { t } = useTranslation();
	const { createQueue } = useMessageQueueStore();
	const navigate = useTabNavigate();
	const { pathname } = useLocation();
	const { versionId, appId, orgId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();
	const { notify } = useToast();
	const form = useForm<z.infer<typeof CreateMessageQueueSchema>>({
		resolver: zodResolver(CreateMessageQueueSchema),
	});

	const { mutateAsync: createQueueMutate, isPending } = useMutation({
		mutationFn: createQueue,
		mutationKey: ['updateQueue'],
		onSuccess: (queue) => {
			handleClose();
			navigate({
				title: queue.name,
				path: `${pathname}/${queue._id}`,
				isActive: true,
				isDashboard: false,
				type: TabTypes.MessageQueue,
			});
		},
		onError: ({ error, details }: APIError) => {
			handleClose();
			notify({ type: 'error', description: details, title: error });
		},
	});

	function onSubmit(data: z.infer<typeof CreateMessageQueueSchema>) {
		const params = removeEmptyFields(data) as z.infer<typeof CreateMessageQueueSchema>;
		createQueueMutate({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			...params,
			resourceId: data.resourceId,
		});
	}

	function handleClose() {
		form.reset({
			name: '',
			delay: undefined,
			logExecution: false,
			resourceId: '',
		});
		onClose();
	}
	return (
		<Drawer open={open} onOpenChange={handleClose}>
			<DrawerContent position='right' size='lg' className='h-full'>
				<DrawerHeader>
					<DrawerTitle>{t('queue.create.title')}</DrawerTitle>
				</DrawerHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='p-6 scroll'>
						<MessageQueueForm loading={isPending} />
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
