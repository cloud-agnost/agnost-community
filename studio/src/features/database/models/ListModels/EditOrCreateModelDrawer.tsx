import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Input, Textarea } from 'components/Input';
import { Button } from 'components/Button';
import { NAME_SCHEMA, TIMESTAMPS_SCHEMA } from '@/constants';
import { useEffect, useMemo } from 'react';
import { APIError, Database } from '@/types';
import { Separator } from 'components/Separator';
import { SettingsFormItem } from 'components/SettingsFormItem';
import { Switch } from 'components/Switch';
import { translate } from '@/utils';
import useModelStore from '@/store/database/modelStore.ts';
import useVersionStore from '@/store/version/versionStore.ts';
import { useParams } from 'react-router-dom';
import useDatabaseStore from '@/store/database/databaseStore.ts';

const Schema = z.object({
	name: NAME_SCHEMA.refine((value) => /^(?![0-9])/.test(value), {
		message: translate('forms.notStartWithNumber', {
			label: translate('general.name'),
		}).toString(),
	}),
	schema: z.string().optional(),
	description: z.string({
		required_error: translate('forms.required', { label: translate('general.description') }),
	}),
	timestamps: TIMESTAMPS_SCHEMA,
});

interface EditOrCreateModelDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editMode?: boolean;
}

export default function EditOrCreateModelDrawer({
	open,
	onOpenChange,
	editMode,
}: EditOrCreateModelDrawerProps) {
	const { t } = useTranslation();
	const { createModel, updateNameAndDescription, modelToEdit } = useModelStore();
	const version = useVersionStore((state) => state.version);
	const databases = useDatabaseStore((state) => state.databases);
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

	const database = useMemo(() => {
		return databases.find((db) => db._id === dbId) as Database;
	}, [dbId]);

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
	}

	async function onSubmit(data: z.infer<typeof Schema>) {
		try {
			if (editMode) {
				await update(data);
			} else {
				await create(data);
			}
			onOpenChange(false);
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
	}

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className='overflow-x-hidden'>
				<DrawerHeader className='relative'>
					<DrawerTitle>
						{editMode ? t('database.models.edit') : t('database.models.create')}
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
							{['PostgreSQL', 'SQL Server'].includes(database?.type) && (
								<>
									<FormField
										control={form.control}
										name='schema'
										render={({ field, formState: { errors } }) => (
											<FormItem className='space-y-1'>
												<FormLabel>
													{t('database.models.add.schema.field')} {''}
													<span className='text-[10px]'>({t('general.optional')})</span>
												</FormLabel>
												<FormControl>
													<Input
														error={Boolean(errors.schema)}
														type='text'
														placeholder={t('forms.placeholder', {
															label: t('database.models.add.schema.field').toLowerCase(),
														}).toString()}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<Separator />
								</>
							)}
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
							{!editMode && (
								<>
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

									{form.getValues('timestamps.enabled') && (
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
									)}
								</>
							)}
							<div className='flex justify-end'>
								<Button size='lg'>{editMode ? t('general.save') : t('general.create')}</Button>
							</div>
						</form>
					</Form>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
