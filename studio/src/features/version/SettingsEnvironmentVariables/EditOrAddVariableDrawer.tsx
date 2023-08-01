import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from 'components/Drawer';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/Form';
import { Input } from 'components/Input';
import { Button } from 'components/Button';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { translate } from '@/utils';
import useVersionStore from '@/store/version/versionStore.ts';
import { Alert, AlertDescription, AlertTitle } from 'components/Alert';
import { APIError } from '@/types';
import { NAME_SCHEMA } from '@/constants';

const MiddlewareFormSchema = z.object({
	name: NAME_SCHEMA,
	value: z
		.string({
			required_error: translate('forms.required', {
				label: translate('general.value'),
			}),
		})
		.trim()
		.refine(
			(value) => value.trim().length > 0,
			translate('forms.required', {
				label: translate('general.value'),
			}),
		),
});

interface EditOrAddVariableDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editMode?: boolean;
}

export default function EditOrAddVariableDrawer({
	open,
	onOpenChange,
	editMode = false,
}: EditOrAddVariableDrawerProps) {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const { orgId, appId, versionId } = useParams();
	const { param, addParam, updateParam } = useVersionStore();
	const [error, setError] = useState<APIError | null>(null);

	useEffect(() => {
		if (!open) form.reset();
		else if (param && editMode) {
			form.setValue('name', param.name);
			form.setValue('value', param.value);
		}
	}, [open, param]);

	const form = useForm<z.infer<typeof MiddlewareFormSchema>>({
		resolver: zodResolver(MiddlewareFormSchema),
	});

	async function onSubmit(data: z.infer<typeof MiddlewareFormSchema>) {
		if (!orgId || !appId || !versionId) return;
		setLoading(true);
		setError(null);
		try {
			editMode
				? await edit(orgId, appId, versionId, data)
				: await add(orgId, appId, versionId, data);
			onOpenChange(false);
		} catch (e) {
			const error = e as APIError;
			if (error.fields) {
				error.fields.forEach((field) => {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					form.setError(field.param, {
						message: field.msg,
					});
				});
			} else setError(error);
		} finally {
			setLoading(false);
		}
	}

	async function add(
		orgId: string,
		appId: string,
		versionId: string,
		data: z.infer<typeof MiddlewareFormSchema>,
	) {
		await addParam({
			appId,
			orgId,
			versionId,
			...data,
		});
	}

	async function edit(
		orgId: string,
		appId: string,
		versionId: string,
		data: z.infer<typeof MiddlewareFormSchema>,
	) {
		if (!param?._id) return;
		await updateParam({
			appId,
			orgId,
			versionId,
			paramId: param?._id,
			...data,
		});
	}

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent position='right'>
				<DrawerHeader>
					<DrawerTitle>
						{editMode ? t('version.variable.edit') : t('version.variable.add')}
					</DrawerTitle>
				</DrawerHeader>
				<Form {...form}>
					<form className='p-6 flex flex-col gap-6' onSubmit={form.handleSubmit(onSubmit)}>
						{error && (
							<Alert className='!max-w-full' variant='error'>
								<AlertTitle>{error.error}</AlertTitle>
								<AlertDescription>{error.details}</AlertDescription>
							</Alert>
						)}
						<FormField
							control={form.control}
							name='name'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('general.name')}</FormLabel>
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
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='value'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('general.value')}</FormLabel>
									<FormControl>
										<Input
											error={Boolean(form.formState.errors.value)}
											placeholder={
												t('forms.placeholder', {
													label: t('general.value'),
												}) ?? ''
											}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className='flex justify-end mt-4'>
							<Button loading={loading} size='lg'>
								{editMode ? t('general.save') : t('general.add')}
							</Button>
						</div>
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
