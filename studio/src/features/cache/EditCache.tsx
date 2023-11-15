import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form } from '@/components/Form';
import { useToast } from '@/hooks';
import CacheForm from './CacheForm';
import { CacheSchema } from '@/types';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useEffect } from 'react';
import useCacheStore from '@/store/cache/cacheStore';

interface CreateCacheProps {
	open: boolean;
	onClose: () => void;
}

export default function EditCache({ open, onClose }: CreateCacheProps) {
	const { t } = useTranslation();
	const { updateCache, cache } = useCacheStore();
	const { versionId, appId, orgId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();
	const { notify } = useToast();
	const form = useForm<z.infer<typeof CacheSchema>>({
		resolver: zodResolver(CacheSchema),
	});
	function resetAndClose() {
		form.reset({
			name: '',
			assignUniqueName: false,
		});
		onClose();
	}
	function onSubmit(data: z.infer<typeof CacheSchema>) {
		updateCache({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			cacheId: cache._id,
			...data,
			onSuccess: () => {
				resetAndClose();
			},
			onError: ({ error, details }) => {
				notify({ type: 'error', description: details, title: error });
			},
		});
	}

	useEffect(() => {
		form.reset({
			name: cache.name,
			assignUniqueName: cache.assignUniqueName,
		});
	}, [cache]);
	return (
		<Drawer open={open} onOpenChange={resetAndClose}>
			<DrawerContent position='right' size='lg' className='h-full'>
				<DrawerHeader>
					<DrawerTitle>
						{t('cache.edit', {
							name: cache.name,
						})}
					</DrawerTitle>
				</DrawerHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='p-6 scroll'>
						<CacheForm edit />
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}