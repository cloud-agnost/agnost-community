import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from 'components/Drawer';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from 'components/Form';
import { Input, Textarea } from 'components/Input';
import { Button } from 'components/Button';
import { ReactNode, useEffect } from 'react';
import { APIError, NameSchema, TimestampsSchema } from '@/types';
import { Separator } from 'components/Separator';
import { SettingsFormItem } from 'components/SettingsFormItem';
import { Switch } from 'components/Switch';
import { translate } from '@/utils';
import useModelStore from '@/store/database/modelStore.ts';
import useVersionStore from '@/store/version/versionStore.ts';
import { useParams } from 'react-router-dom';

const Schema = z.object({
	name: NameSchema,
	description: z
		.string({
			required_error: translate('forms.required', { label: translate('general.description') }),
		})
		.optional(),
	timestamps: TimestampsSchema,
});

interface EditOrCreateModelDrawerProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	editMode?: boolean;
	children?: ReactNode;
}

export default function EditOrCreateModelDrawer({
	open,
	onOpenChange,
	editMode = false,
	children,
}: EditOrCreateModelDrawerProps) {
	const { t } = useTranslation();
	const {
		createModel,
		updateNameAndDescription,
		modelToEdit,
		enableTimestamps,
		disableTimestamps,
	} = useModelStore();
	const version = useVersionStore((state) => state.version);
	const { dbId } = useParams();

	const form = useForm<z.infer<typeof Schema>>({
		resolver: zodResolver(Schema),
		defaultValues: {
			timestamps: {
				enabled: false,
				createdAt: 'createdAt',
				updatedAt: 'updatedAt',
			},
		},
	});

	useEffect(() => {
		if (!open) {
			form.reset();
		}
	}, [open]);

	useEffect(() => {
		setDefaultsForEdit();
	}, [open, modelToEdit]);

	useEffect(() => {
		form.clearErrors('timestamps');
	}, [form.getValues('timestamps.enabled')]);

	function setDefaultsForEdit() {
		if (!modelToEdit || !open) return;
		form.setValue('name', modelToEdit.name);
		form.setValue('description', modelToEdit.description);
		form.setValue('timestamps.enabled', modelToEdit.timestamps.enabled);
		form.setValue('timestamps.createdAt', modelToEdit.timestamps.createdAt);
		form.setValue('timestamps.updatedAt', modelToEdit.timestamps.updatedAt);
	}

	async function onSubmit(data: z.infer<typeof Schema>) {
		try {
			if (editMode && modelToEdit) {
				await update(data);
			} else {
				await create(data);
			}
			onOpenChange?.(false);
			form.reset();
		} catch (e) {
			const error = e as APIError;
			error.fields?.forEach((field) => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				form.setError(field.param, {
					message: field.msg,
				});
			});
		}
	}

	async function create(data: z.infer<typeof Schema>) {
		if (!version || !dbId) return;
		await createModel({
			versionId: version._id,
			appId: version.appId,
			orgId: version.orgId,
			dbId: dbId,
			name: data.name,
			description: data.description,
			timestamps: {
				enabled: data.timestamps.enabled,
				createdAt: data.timestamps.enabled ? data.timestamps.createdAt : undefined,
				updatedAt: data.timestamps.enabled ? data.timestamps.updatedAt : undefined,
			},
		});
	}

	async function update(data: z.infer<typeof Schema>) {
		if (!modelToEdit) return;
		await updateNameAndDescription({
			dbId: modelToEdit.dbId,
			appId: modelToEdit.appId,
			orgId: modelToEdit.orgId,
			modelId: modelToEdit._id,
			versionId: modelToEdit.versionId,
			name: data.name,
			description: data.description,
		});
		if (modelToEdit.timestamps.enabled !== data.timestamps.enabled) {
			if (data.timestamps.enabled) {
				await enableTimestamps({
					dbId: modelToEdit.dbId,
					appId: modelToEdit.appId,
					orgId: modelToEdit.orgId,
					modelId: modelToEdit._id,
					versionId: modelToEdit.versionId,
					createdAt: data.timestamps.createdAt,
					updatedAt: data.timestamps.updatedAt,
				});
			} else {
				await disableTimestamps({
					dbId: modelToEdit.dbId,
					appId: modelToEdit.appId,
					orgId: modelToEdit.orgId,
					modelId: modelToEdit._id,
					versionId: modelToEdit.versionId,
				});
			}
		}
	}

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			{children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
			<DrawerContent className='overflow-x-hidden'>
				<DrawerHeader className='relative'>
					<DrawerTitle>
						{editMode && modelToEdit ? t('database.models.edit') : t('database.models.create')}
					</DrawerTitle>
				</DrawerHeader>
				<div className='p-6 space-y-6'>
					<Form {...form}>
						<form className='space-y-6' onSubmit={form.handleSubmit(onSubmit)}>
							<FormField
								control={form.control}
								name='name'
								render={({ field, formState: { errors } }) => (
									<FormItem className='space-y-1'>
										<FormLabel>{t('database.models.add.name.field')}</FormLabel>
										<FormControl>
											<Input
												error={Boolean(errors.name)}
												type='text'
												placeholder={
													t('forms.placeholder', {
														label: t('database.models.add.name.field').toLowerCase(),
													}) as string
												}
												{...field}
											/>
										</FormControl>
										<FormDescription>{t('forms.max64.description')}</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Separator />
							<FormField
								control={form.control}
								name='description'
								render={({ field }) => (
									<FormItem className='space-y-1'>
										<FormLabel>{t('database.models.add.description.field')}</FormLabel>
										<FormControl>
											<Textarea
												rows={4}
												placeholder={t('database.models.add.description.field').toString()}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Separator />
							<FormField
								control={form.control}
								name='timestamps.enabled'
								render={({ field }) => (
									<FormItem className='space-y-1'>
										<FormControl>
											<SettingsFormItem
												twoColumns
												className='py-0'
												title={t('database.models.add.timestamps.enabled.field')}
												description={t('database.models.add.timestamps.enabled.desc')}
											>
												<Switch
													name={field.name}
													ref={field.ref}
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</SettingsFormItem>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							{(() => {
								const isEnabled = form.watch('timestamps.enabled');
								const Component = (
									<>
										<Separator />
										<div className='grid grid-cols-2 gap-4'>
											<FormField
												control={form.control}
												name='timestamps.createdAt'
												render={({ field, formState: { errors } }) => (
													<FormItem className='space-y-1'>
														<FormLabel>
															{t('database.models.add.timestamps.createdAt.field')}
														</FormLabel>
														<FormControl>
															<Input
																error={Boolean(errors.timestamps?.createdAt)}
																type='text'
																readOnly={
																	editMode && !!modelToEdit && modelToEdit?.timestamps.enabled
																}
																placeholder={
																	t('forms.placeholder', {
																		label: t(
																			'database.models.add.timestamps.createdAt.field',
																		).toLowerCase(),
																	}) as string
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
												name='timestamps.updatedAt'
												render={({ field, formState: { errors } }) => (
													<FormItem className='space-y-1'>
														<FormLabel>
															{t('database.models.add.timestamps.updatedAt.field')}
														</FormLabel>
														<FormControl>
															<Input
																error={Boolean(errors.timestamps?.updatedAt)}
																type='text'
																readOnly={
																	editMode && !!modelToEdit && modelToEdit?.timestamps.enabled
																}
																placeholder={
																	t('forms.placeholder', {
																		label: t(
																			'database.models.add.timestamps.updatedAt.field',
																		).toLowerCase(),
																	}) as string
																}
																{...field}
															/>
														</FormControl>
														<FormDescription>{t('forms.max64.description')}</FormDescription>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									</>
								);

								if (isEnabled && (!editMode || !modelToEdit)) return Component;
								if (isEnabled && editMode && modelToEdit && !modelToEdit?.timestamps.enabled)
									return Component;
							})()}
							<div className='flex justify-end'>
								<Button size='lg'>
									{editMode && modelToEdit ? t('general.save') : t('general.create')}
								</Button>
							</div>
						</form>
					</Form>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
