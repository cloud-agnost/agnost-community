import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form } from '@/components/Form';
import { useToast } from '@/hooks';
import { CreateMessageQueueSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import * as z from 'zod';
import MessageQueueForm from './MEssageQueueForm';
import useMessageQueueStore from '@/store/queue/messageQueueStore';
interface CreateQueueProps {
	open: boolean;
	onClose: () => void;
}

export default function EditMessageQueue({ open, onClose }: CreateQueueProps) {
	const { t } = useTranslation();
	const { updateQueue, queue } = useMessageQueueStore();
	const { versionId, appId, orgId, queueId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
		queueId: string;
	}>();
	const { notify } = useToast();
	const form = useForm<z.infer<typeof CreateMessageQueueSchema>>({
		resolver: zodResolver(CreateMessageQueueSchema),
		defaultValues: {
			name: queue?.name,
			delay: queue?.delay.toString(),
			logExecution: queue?.logExecution,
		},
	});

	function onSubmit(data: z.infer<typeof CreateMessageQueueSchema>) {
		updateQueue({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			queueId: queueId as string,
			resourceId: '64aff4ab40d7d62bf137a1ab',
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
					<DrawerTitle>{t('endpoint.create.title')}</DrawerTitle>
				</DrawerHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='p-6 scroll'>
						<MessageQueueForm />
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
