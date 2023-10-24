import { useTranslation } from 'react-i18next';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from 'components/Drawer';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from 'components/Form';
import { Input } from 'components/Input';
import { Button } from 'components/Button';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import useMiddlewareStore from '@/store/middleware/middlewareStore.ts';
import { nameSchema } from '@/features/version/Middlewares/formSchema.ts';
import { useToast } from '@/hooks';
const MiddlewareFormSchema = z.object({
	name: nameSchema,
});

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

	const form = useForm<z.infer<typeof MiddlewareFormSchema>>({
		resolver: zodResolver(MiddlewareFormSchema),
	});

	async function init() {
		if (!middleware) return;
		if (editMiddlewareDrawerIsOpen) {
			form.reset({
				name: middleware.name,
			});
		} else {
			form.reset({
				name: '',
			});
		}
	}

	useEffect(() => {
		init();
	}, [editMiddlewareDrawerIsOpen]);

	async function onSubmit(data: z.infer<typeof MiddlewareFormSchema>) {
		if (!middleware) return;
		setLoading(true);
		try {
			const params = {
				orgId: middleware.orgId,
				appId: middleware.appId,
				versionId: middleware.versionId,
				mwId: middleware._id,
			};
			updateMiddleware({
				...params,
				name: data.name,
				onSuccess: () => {
					notify({
						title: t('general.success'),
						description: t('version.middleware.edit.success'),
						type: 'success',
					});
				},
				onError: (error) => {
					notify({
						title: error.error,
						description: error.details,
						type: 'error',
					});
				},
			});
			setEditMiddlewareDrawerIsOpen(false);
		} finally {
			setLoading(false);
		}
	}

	function onOpenChange(status: boolean) {
		setMiddleware(null);
		setEditMiddlewareDrawerIsOpen(status);
	}

	return (
		<Drawer open={editMiddlewareDrawerIsOpen} onOpenChange={onOpenChange}>
			<DrawerContent className='flex gap-0 flex-col' position='right'>
				<DrawerHeader>
					<DrawerTitle>{t('version.middleware.edit.default')}</DrawerTitle>
				</DrawerHeader>
				<Form {...form}>
					<form className='p-6 flex flex-col gap-3 flex-1' onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name='name'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('version.middleware.name')}</FormLabel>
									<FormControl>
										<Input
											error={Boolean(form.formState.errors.name)}
											placeholder={
												t('forms.placeholder', {
													label: t('general.name'),
												}) ?? ''
											}
											{...field}
										/>
									</FormControl>
									<FormDescription>{t('forms.max64.description')}</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className='flex justify-end mt-4'>
							<Button loading={loading} size='lg'>
								{t('general.save')}
							</Button>
						</div>
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
