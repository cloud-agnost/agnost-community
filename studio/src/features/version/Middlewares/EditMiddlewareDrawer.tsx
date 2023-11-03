import { useToast } from '@/hooks';
import useMiddlewareStore from '@/store/middleware/middlewareStore.ts';
import { Middleware, MiddlewareSchema } from '@/types';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from 'components/Drawer';
import { Form } from 'components/Form';
import { useEffect, useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import MiddlewareForm from './MiddlewareForm';
import { zodResolver } from '@hookform/resolvers/zod';

export default function EditMiddlewareDrawer() {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const { notify } = useToast();
	const {
		middleware,
		setEditMiddlewareDrawerIsOpen,
		editMiddlewareDrawerIsOpen,
		setMiddleware,
		updateMiddleware,
	} = useMiddlewareStore();

	const form = useForm<z.infer<typeof MiddlewareSchema>>({
		resolver: zodResolver(MiddlewareSchema),
		defaultValues: {
			name: middleware?.name,
		},
	});

	useEffect(() => {
		if (editMiddlewareDrawerIsOpen && middleware) {
			form.reset({
				name: middleware.name,
			});
		} else {
			form.reset({
				name: '',
			});
		}
	}, [editMiddlewareDrawerIsOpen]);

	async function onSubmit(data: z.infer<typeof MiddlewareSchema>) {
		if (!middleware) return;
		setLoading(true);
		updateMiddleware({
			orgId: middleware.orgId,
			appId: middleware.appId,
			versionId: middleware.versionId,
			mwId: middleware._id,
			name: data.name,
			onSuccess: () => {
				setLoading(false);
				setEditMiddlewareDrawerIsOpen(false);
				notify({
					title: t('general.success'),
					description: t('version.middleware.edit.success'),
					type: 'success',
				});
			},
			onError: (error) => {
				setLoading(false);
				notify({
					title: error.error,
					description: error.details,
					type: 'error',
				});
			},
		});
	}

	function onOpenChange(status: boolean) {
		setMiddleware({} as Middleware);
		setEditMiddlewareDrawerIsOpen(status);
		form.reset({
			name: '',
		});
	}

	return (
		<Drawer open={editMiddlewareDrawerIsOpen} onOpenChange={onOpenChange}>
			<DrawerContent className='flex gap-0 flex-col' position='right'>
				<DrawerHeader>
					<DrawerTitle>{t('version.middleware.edit.default')}</DrawerTitle>
				</DrawerHeader>
				<Form {...form}>
					<form className='p-6 flex flex-col gap-3 flex-1' onSubmit={form.handleSubmit(onSubmit)}>
						<MiddlewareForm loading={loading} />
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
