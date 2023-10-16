import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form } from '@/components/Form';
import { useToast } from '@/hooks';
import useStorageStore from '@/store/storage/storageStore';
import { CreateStorageSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import * as z from 'zod';
import StorageForm from './StorageForm';

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

	function onSubmit(data: z.infer<typeof CreateStorageSchema>) {
		createStorage({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			...data,
			onSuccess: () => {
				form.reset({
					name: '',
					resourceId: '',
				});
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
				form.reset({
					name: '',
					resourceId: '',
				});
				onClose();
			}}
		>
			<DrawerContent position='right' size='lg' className='h-full'>
				<DrawerHeader>
					<DrawerTitle>{t('storage.create')}</DrawerTitle>
				</DrawerHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='p-6 scroll'>
						<StorageForm />
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
