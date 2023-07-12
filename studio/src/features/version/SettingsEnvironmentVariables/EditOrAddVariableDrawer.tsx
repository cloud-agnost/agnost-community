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

const MiddlewareFormSchema = z.object({
	name: z
		.string({
			required_error: translate('forms.required', {
				label: translate('general.name'),
			}),
		})
		.min(2, translate('forms.min2.error', { label: translate('general.name') }))
		.max(64, translate('forms.max64.error', { label: translate('general.name') }))
		.regex(/^[a-zA-Z0-9_]*$/, {
			message: translate('forms.alphanumeric', { label: translate('general.name') }),
		})
		.trim()
		.refine(
			(value) => value.trim().length > 0,
			translate('forms.required', {
				label: translate('general.name'),
			}),
		),
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
		console.log(data);
		if (!orgId || !appId || !versionId) return;
		setLoading(true);
		try {
			onOpenChange(false);
			editMode
				? await edit(orgId, appId, versionId, data)
				: await add(orgId, appId, versionId, data);
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
