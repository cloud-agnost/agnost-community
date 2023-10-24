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
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import useMiddlewareStore from '@/store/middleware/middlewareStore.ts';
import { useLocation, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { nameSchema } from '@/features/version/Middlewares/formSchema.ts';
import { Middleware, TabTypes } from '@/types';
import { useTabNavigate } from '@/hooks';
import { useToast } from '@/hooks';
const MiddlewareFormSchema = z.object({
	name: nameSchema,
});

interface AddMiddlewareDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreate?: (middleware: Middleware) => void;
}

export default function AddMiddlewareDrawer({
	open,
	onOpenChange,
	onCreate,
}: AddMiddlewareDrawerProps) {
	const { t } = useTranslation();
	const { notify } = useToast();
	const [loading, setLoading] = useState(false);
	const { createMiddleware } = useMiddlewareStore();
	const navigate = useTabNavigate();
	const { pathname } = useLocation();
	const { orgId, appId, versionId } = useParams();

	useEffect(() => {
		if (!open) form.reset();
	}, [open]);

	const form = useForm<z.infer<typeof MiddlewareFormSchema>>({
		resolver: zodResolver(MiddlewareFormSchema),
		defaultValues: {
			name: '',
		},
	});

	async function onSubmit(data: z.infer<typeof MiddlewareFormSchema>) {
		if (!orgId || !appId || !versionId) return;
		setLoading(true);
		await createMiddleware({
			orgId,
			appId,
			versionId,
			name: data.name,
			onSuccess: (mw) => {
				notify({
					title: t('general.success'),
					description: t('version.middleware.add.success'),
					type: 'success',
				});
				onOpenChange(false);
				if (onCreate) onCreate(mw);
				else {
					navigate({
						title: data.name,
						path: `${pathname}/${mw._id}`,
						isActive: true,
						isDashboard: false,
						type: TabTypes.Middleware,
					});
				}
				setLoading(false);
			},
			onError: (error) => {
				notify({
					type: 'error',
					title: error.error,
					description: error.details,
				});
				setLoading(false);
			},
		});
	}

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent position='right'>
				<DrawerHeader>
					<DrawerTitle>{t('version.middleware.add_middleware')}</DrawerTitle>
				</DrawerHeader>
				<Form {...form}>
					<form className='p-6' onSubmit={(e) => e.preventDefault()}>
						<FormField
							control={form.control}
							name='name'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('version.middleware.name')}</FormLabel>
									<FormControl>
										<Input
											onKeyDown={(e) => {
												if (e.code === 'Enter') form.handleSubmit(onSubmit)();
											}}
											value={field.value}
											onChange={field.onChange}
											error={Boolean(form.formState.errors.name)}
											placeholder={
												t('forms.placeholder', {
													label: t('general.name'),
												}) ?? ''
											}
										/>
									</FormControl>
									<FormDescription>{t('forms.max64.description')}</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className='flex justify-end mt-4'>
							<Button
								loading={loading}
								size='lg'
								type='button'
								onClick={() => {
									form.handleSubmit(onSubmit)();
								}}
							>
								{t('general.save')}
							</Button>
						</div>
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
