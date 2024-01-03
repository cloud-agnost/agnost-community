import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form } from '@/components/Form';
import { useToast } from '@/hooks';
import CacheForm from './CacheForm';
import { APIError, CacheSchema } from '@/types';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useEffect } from 'react';
import useCacheStore from '@/store/cache/cacheStore';
import { useMutation } from '@tanstack/react-query';

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
	const { toast } = useToast();
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
	const { mutateAsync: updateMutate, isPending } = useMutation({
		mutationFn: updateCache,
		onSuccess: () => {
			toast({
				title: t('cache.edit_success') as string,
				action: 'success',
			});
			resetAndClose();
		},
		onError: ({ details }: APIError) => {
			toast({ action: 'error', title: details });
		},
	});
	function onSubmit(data: z.infer<typeof CacheSchema>) {
		updateMutate({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			cacheId: cache._id,
			...data,
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
						<CacheForm edit loading={isPending} />
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
