import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form } from '@/components/Form';
import { useToast } from '@/hooks';
import useMessageQueueStore from '@/store/queue/messageQueueStore';
import { APIError, MessageQueueSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import * as z from 'zod';
import MessageQueueForm from './MessageQueueForm';
import { useEffect } from 'react';
import { removeEmptyFields } from '@/utils';
import useResourceStore from '@/store/resources/resourceStore';
import useEnvironmentStore from '@/store/environment/environmentStore';
import { useMutation } from '@tanstack/react-query';
interface CreateQueueProps {
	open: boolean;
	onClose: () => void;
}

export default function EditMessageQueue({ open, onClose }: CreateQueueProps) {
	const { t } = useTranslation();
	const { updateQueue, queue } = useMessageQueueStore();
	const { getResource } = useResourceStore();
	const environment = useEnvironmentStore((state) => state.environment);
	const { versionId, appId, orgId } = useParams() as Record<string, string>;
	const { notify } = useToast();
	const form = useForm<z.infer<typeof MessageQueueSchema>>({
		resolver: zodResolver(MessageQueueSchema),
	});

	const { mutateAsync: updateQueueMutate, isPending } = useMutation({
		mutationFn: updateQueue,
		mutationKey: ['updateQueue'],
		onSuccess: () => {
			onClose();
		},
		onError: ({ error, details }: APIError) => {
			notify({ type: 'error', description: details, title: error });
		},
	});
	function onSubmit(data: z.infer<typeof MessageQueueSchema>) {
		const params = removeEmptyFields(data) as z.infer<typeof MessageQueueSchema>;
		updateQueueMutate({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			queueId: queue._id,
			...params,
		});
	}

	useEffect(() => {
		if (queue) {
			form.reset(queue);
			const iid = environment?.mappings?.find((m) => m.design.iid === queue.iid)?.resource.iid;
			if (iid) {
				getResource({
					orgId,
					iid,
				});
			}
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
						<MessageQueueForm loading={isPending} edit />
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
