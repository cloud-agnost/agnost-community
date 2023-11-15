import { useToast } from '@/hooks';
import useMiddlewareStore from '@/store/middleware/middlewareStore.ts';
import { APIError, MiddlewareSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from 'components/Drawer';
import { Form } from 'components/Form';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import MiddlewareForm from './MiddlewareForm';

export default function EditMiddlewareDrawer() {
	const { t } = useTranslation();
	const { notify } = useToast();
	const { middleware, closeEditMiddlewareDrawer, isEditMiddlewareDrawerOpen, updateMiddleware } =
		useMiddlewareStore();

	const form = useForm<z.infer<typeof MiddlewareSchema>>({
		resolver: zodResolver(MiddlewareSchema),
		defaultValues: {
			name: middleware?.name,
		},
	});

	useEffect(() => {
		if (isEditMiddlewareDrawerOpen && middleware) {
			form.reset({
				name: middleware.name,
			});
		}
	}, [isEditMiddlewareDrawerOpen]);

	const { mutate: updateMiddlewareMutation, isPending } = useMutation({
		mutationFn: updateMiddleware,
		onSuccess: () => {
			onOpenChange();
		},
		onError: (error: APIError) => {
			notify({
				title: error.error,
				description: error.details,
				type: 'error',
			});
		},
	});

	async function onSubmit(data: z.infer<typeof MiddlewareSchema>) {
		if (!middleware) return;
		updateMiddlewareMutation({
			orgId: middleware.orgId,
			appId: middleware.appId,
			versionId: middleware.versionId,
			mwId: middleware._id,
			name: data.name,
		});
	}

	function onOpenChange() {
		closeEditMiddlewareDrawer();
		form.reset({
			name: '',
		});
	}

	return (
		<Drawer open={isEditMiddlewareDrawerOpen} onOpenChange={onOpenChange}>
			<DrawerContent className='flex gap-0 flex-col' position='right'>
				<DrawerHeader>
					<DrawerTitle>{t('version.middleware.edit.default')}</DrawerTitle>
				</DrawerHeader>
				<Form {...form}>
					<form className='p-6 flex flex-col gap-3 flex-1' onSubmit={form.handleSubmit(onSubmit)}>
						<MiddlewareForm loading={isPending} />
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}