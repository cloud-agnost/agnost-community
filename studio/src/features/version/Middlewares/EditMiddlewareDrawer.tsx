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
import { CodeEditor } from 'components/CodeEditor';
import { logicSchema, nameSchema } from '@/features/version/Middlewares/formSchema.ts';

const MiddlewareFormSchema = z.object({
	name: nameSchema,
	logic: logicSchema,
});

export default function EditMiddlewareDrawer() {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const {
		middleware,
		setEditMiddlewareDrawerIsOpen,
		editMiddlewareDrawerIsOpen,
		setMiddleware,
		updateMiddleware,
		getMiddlewareById,
		saveMiddlewareCode,
	} = useMiddlewareStore();

	const form = useForm<z.infer<typeof MiddlewareFormSchema>>({
		resolver: zodResolver(MiddlewareFormSchema),
	});

	async function init() {
		if (!middleware) return;
		if (editMiddlewareDrawerIsOpen) {
			const res = await getMiddlewareById({
				orgId: middleware.orgId,
				appId: middleware.appId,
				versionId: middleware.versionId,
				mwId: middleware._id,
			});
			form.reset({
				name: res.name,
				logic: res.logic,
			});
		} else {
			form.reset({
				name: '',
				logic: '',
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
			await updateMiddleware({
				...params,
				name: data.name,
			});
			await saveMiddlewareCode({
				...params,
				logic: data.logic,
			});
			await setEditMiddlewareDrawerIsOpen(false);
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
						<FormField
							control={form.control}
							name='logic'
							render={({ field }) => (
								<FormItem className='flex-1 flex flex-col'>
									<FormLabel>{t('version.handler_code')}</FormLabel>
									<FormControl className='flex-1 özgem'>
										<CodeEditor containerClassName='flex-1' {...field} />
									</FormControl>
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
