import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form } from '@/components/Form';
import { useToast } from '@/hooks';
import { CreateMessageQueueSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import * as z from 'zod';
import MessageQueueForm from './MessageQueueForm';
import useMessageQueueStore from '@/store/queue/messageQueueStore';
interface CreateQueueProps {
	open: boolean;
	onClose: () => void;
}

export default function CreateMessageQueue({ open, onClose }: CreateQueueProps) {
	const { t } = useTranslation();
	const { createQueue } = useMessageQueueStore();
	const { versionId, appId, orgId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();
	const { notify } = useToast();
	const form = useForm<z.infer<typeof CreateMessageQueueSchema>>({
		resolver: zodResolver(CreateMessageQueueSchema),
	});

	function onSubmit(data: z.infer<typeof CreateMessageQueueSchema>) {
		createQueue({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			...data,
			onSuccess: () => {
				form.reset({
					name: '',
					delay: '',
					logExecution: false,
				});
				onClose();
			},
			onError: ({ error, details }) => {
				form.reset({
					name: '',
					delay: '',
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
					delay: '',
					logExecution: false,
				});
				onClose();
			}}
		>
			<DrawerContent position='right' size='lg' className='h-full'>
				<DrawerHeader>
					<DrawerTitle>{t('queue.create.title')}</DrawerTitle>
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
