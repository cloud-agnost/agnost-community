import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form } from '@/components/Form';
import { useToast } from '@/hooks';
import StorageForm from './StorageForm';
import { StorageSchema } from '@/types';
import { useTranslation } from 'react-i18next';
import useStorageStore from '@/store/storage/storageStore';
import { useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

interface CreateStorageProps {
	open: boolean;
	onClose: () => void;
}

export default function EditStorage({ open, onClose }: CreateStorageProps) {
	const { t } = useTranslation();
	const { updateStorage, storage } = useStorageStore();
	const { versionId, appId, orgId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();
	const { notify } = useToast();
	const form = useForm<z.infer<typeof StorageSchema>>({
		resolver: zodResolver(StorageSchema),
		defaultValues: {
			name: storage.name,
			// resourceId: storage.resourceId,
		},
	});

	function onSubmit(data: z.infer<typeof StorageSchema>) {
		updateStorage({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			storageId: storage._id,
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
					<DrawerTitle>
						{t('storage.edit', {
							name: storage.name,
						})}
					</DrawerTitle>
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
