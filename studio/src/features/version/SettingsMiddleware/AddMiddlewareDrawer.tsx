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
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { nameSchema } from '@/features/version/SettingsMiddleware/formSchema.ts';

const MiddlewareFormSchema = z.object({
	name: nameSchema,
});

interface AddMiddlewareDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function AddMiddlewareDrawer({ open, onOpenChange }: AddMiddlewareDrawerProps) {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const { createMiddleware } = useMiddlewareStore();
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
		try {
			await createMiddleware({
				orgId,
				appId,
				versionId,
				name: data.name,
			});
			onOpenChange(false);
		} finally {
			setLoading(false);
		}
	}

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent position='right'>
				<DrawerHeader>
					<DrawerTitle>{t('version.middleware.add_middleware')}</DrawerTitle>
				</DrawerHeader>
				<Form {...form}>
					<form className='p-6' onSubmit={form.handleSubmit(onSubmit)}>
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
