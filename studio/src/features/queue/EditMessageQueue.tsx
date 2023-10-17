import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form } from '@/components/Form';
import { useToast } from '@/hooks';
import useMessageQueueStore from '@/store/queue/messageQueueStore';
import { MessageQueueSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import * as z from 'zod';
import MessageQueueForm from './MessageQueueForm';
import { useEffect } from 'react';
import { removeEmptyFields } from '@/utils';
interface CreateQueueProps {
	open: boolean;
	onClose: () => void;
}

export default function EditMessageQueue({ open, onClose }: CreateQueueProps) {
	const { t } = useTranslation();
	const { updateQueue, queue } = useMessageQueueStore();
	const { versionId, appId, orgId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
		queueId: string;
	}>();
	const { notify } = useToast();
	const form = useForm<z.infer<typeof MessageQueueSchema>>({
		resolver: zodResolver(MessageQueueSchema),
	});
	function onSubmit(data: z.infer<typeof MessageQueueSchema>) {
		const params = removeEmptyFields(data) as z.infer<typeof MessageQueueSchema>;
		updateQueue({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			queueId: queue._id as string,
			...params,
			onSuccess: () => {
				onClose();
			},
			onError: ({ error, details }) => {
				notify({ type: 'error', description: details, title: error });
			},
		});
	}

	useEffect(() => {
		if (queue) {
			form.reset(queue);
		}
	}, [queue]);

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
						{t('queue.edit', {
							name: queue?.name,
						})}
					</DrawerTitle>
				</DrawerHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='p-6 scroll'>
						<MessageQueueForm edit />
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
