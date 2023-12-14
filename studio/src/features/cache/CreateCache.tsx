import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form } from '@/components/Form';
import { useToast } from '@/hooks';
import CacheForm from './CacheForm';
import { APIError, CreateCacheSchema } from '@/types';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import useCacheStore from '@/store/cache/cacheStore';
import { useMutation } from '@tanstack/react-query';

interface CreateCacheProps {
	open: boolean;
	onClose: () => void;
}

export default function CreateCache({ open, onClose }: CreateCacheProps) {
	const { t } = useTranslation();
	const { createCache } = useCacheStore();
	const { versionId, appId, orgId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();
	const { notify } = useToast();
	const form = useForm<z.infer<typeof CreateCacheSchema>>({
		resolver: zodResolver(CreateCacheSchema),
		defaultValues: {
			assignUniqueName: true,
		},
	});
	function resetAndClose() {
		form.reset();
		onClose();
	}

	const { mutateAsync: crateMutate, isPending } = useMutation({
		mutationFn: createCache,
		onSuccess: () => {
			resetAndClose();
		},
		onError: ({ error, details }: APIError) => {
			notify({ type: 'error', description: details, title: error });
		},
	});

	function onSubmit(data: z.infer<typeof CreateCacheSchema>) {
		crateMutate({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			...data,
		});
	}

	return (
		<Drawer open={open} onOpenChange={resetAndClose}>
			<DrawerContent position='right' size='lg' className='h-full'>
				<DrawerHeader>
					<DrawerTitle>{t('cache.create')}</DrawerTitle>
				</DrawerHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='p-6 scroll'>
						<CacheForm loading={isPending} />
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
