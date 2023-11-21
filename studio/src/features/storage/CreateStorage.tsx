import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form } from '@/components/Form';
import { useToast } from '@/hooks';
import useStorageStore from '@/store/storage/storageStore';
import { APIError, CreateStorageSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import * as z from 'zod';
import StorageForm from './StorageForm';
import { useMutation } from '@tanstack/react-query';

interface CreateStorageProps {
	open: boolean;
	onClose: () => void;
}

export default function CreateStorage({ open, onClose }: CreateStorageProps) {
	const { t } = useTranslation();
	const { createStorage } = useStorageStore();
	const { versionId, appId, orgId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();
	const { notify } = useToast();
	const form = useForm<z.infer<typeof CreateStorageSchema>>({
		resolver: zodResolver(CreateStorageSchema),
	});
	const { mutateAsync: createMutation, isPending } = useMutation({
		mutationFn: createStorage,
		onSuccess: () => onCloseHandler(),
		onError: ({ error, details }: APIError) => {
			notify({ type: 'error', description: details, title: error });
		},
	});

	function onSubmit(data: z.infer<typeof CreateStorageSchema>) {
		createMutation({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			...data,
		});
	}

	function onCloseHandler() {
		form.reset({
			name: undefined,
			resourceId: undefined,
		});
		onClose();
	}
	return (
		<Drawer open={open} onOpenChange={onCloseHandler}>
			<DrawerContent position='right' size='lg' className='h-full'>
				<DrawerHeader>
					<DrawerTitle>{t('storage.create')}</DrawerTitle>
				</DrawerHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='p-6 scroll'>
						<StorageForm loading={isPending} />
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
