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
import {
	FIELD_ICON_MAP,
	MAX_LENGTHS,
	NAME_SCHEMA,
	REFERENCE_FIELD_ACTION,
	TIMESTAMPS_SCHEMA,
} from '@/constants';
import { useEffect, useState } from 'react';
import { APIError, BasicValueListType, Field, FieldType, Model, ReferenceAction } from '@/types';
import { capitalize, cn, toDisplayName } from '@/utils';
import { useParams } from 'react-router-dom';
import { Switch } from 'components/Switch';
import { SettingsFormItem } from 'components/SettingsFormItem';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/Select';
import { Separator } from 'components/Separator';
import useModelStore from '@/store/database/modelStore.ts';
import useTypeStore from '@/store/types/typeStore.ts';

type View = keyof FieldType['view'];

interface EditOrCreateModelDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editMode?: boolean;
	type?: FieldType;
}

const defaultValueDisabledTypes = [
	'reference',
	'object',
	'object-list',
	'encrypted-text',
	'geo-point',
	'rich-text',
	'binary',
	'json',
];

export default function EditOrCreateFieldDrawer({
	open,
	onOpenChange,
	editMode,
	type,
}: EditOrCreateModelDrawerProps) {
	const { t } = useTranslation();
	const basicValueListTypes = useTypeStore((state) => state.bvlTypes);
	const fieldTypes = useTypeStore((state) => state.fieldTypes);
	const fieldToEdit = useModelStore((state) => state.fieldToEdit) as Field;
	const addNewField = useModelStore((state) => state.addNewField);
	const updateField = useModelStore((state) => state.updateField);
	const getReferenceModels = useModelStore((state) => state.getReferenceModels);
	const [models, setModels] = useState<Model[]>([]);

	const MAX_LENGTH = MAX_LENGTHS[editMode ? fieldToEdit?.type : type?.name ?? ''];

	const params = useParams() as {
		orgId: string;
		appId: string;
		versionId: string;
		dbId: string;
		modelId: string;
	};

	const TYPE = editMode ? fieldToEdit?.type : type?.name ?? '';
	const hasMaxLength = ['text', 'encrypted-text'].includes(TYPE);
	const isDecimal = TYPE === 'decimal';
	const isBasicValueList = TYPE === 'basic-values-list';
	const isEnum = TYPE === 'enum';
	const isReference = TYPE === 'reference';
	const hasTimestamps = ['object', 'object-list'].includes(TYPE);
	const hasDefaultValue = !defaultValueDisabledTypes.includes(TYPE);

	const view = editMode
		? fieldTypes.find((type) => type.name === fieldToEdit?.type)?.view
		: type?.view;

	const views = Object.entries(view ?? {})
		.filter(([, value]) => !!value)
		.map(([key]) => key) as View[];

	const Schema = z.object({
		general: z
			.object({
				name: NAME_SCHEMA.refine((value) => /^(?![0-9])/.test(value), {
					message: t('forms.notStartWithNumber', {
						label: t('general.name'),
					}).toString(),
				}),
				required: z.boolean(),
				unique: z.boolean(),
				indexed: z.boolean(),
				searchable: z.boolean(),
				immutable: z.boolean(),
				defaultValue: z.string().optional(),
				description: z.string().optional(),
				maxLength: z
					.string()
					.regex(/^\d+$/, {
						message: t('forms.number', {
							label: capitalize(t('general.max_length').toLowerCase()),
						}).toString(),
					})
					.refine((value) => Number(value) > 0 && Number(value) <= MAX_LENGTH, {
						message: t('forms.maxLength.error', {
							length: MAX_LENGTH,
							label: capitalize(t('general.max_length').toLowerCase()),
						}).toString(),
					})
					.optional(),
				decimalDigits: z
					.string()
					.regex(/^\d+$/, {
						message: t('forms.number', {
							label: capitalize(t('general.decimal_digits').toLowerCase()),
						}).toString(),
					})
					.refine((value) => Number(value) > 0 && Number(value) <= MAX_LENGTH, {
						message: t('forms.maxLength.error', {
							length: MAX_LENGTH,
							label: capitalize(t('general.decimal_digits').toLowerCase()),
						}).toString(),
					})
					.optional(),
				basicValueList: z
					.string()
					.refine((value) => basicValueListTypes.includes(value), {
						message: t('forms.invalid', {
							label: t('database.fields.basic_value_list_type'),
						}).toString(),
					})
					.optional(),
				referenceModelIid: z
					.string()
					.refine((value) => models.some((model) => model.iid === value), {
						message: t('forms.invalid', {
							label: t('database.fields.reference_model'),
						}).toString(),
					})
					.optional(),
				referenceAction: z.enum(REFERENCE_FIELD_ACTION).optional(),
				enumSelectList: z.string().optional(),
				timeStamps: TIMESTAMPS_SCHEMA,
			})
			.superRefine((arg, ctx) => {
				if (hasMaxLength && !arg.maxLength) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: t('forms.required', {
							label: capitalize(t('general.max_length').toLowerCase()),
						}).toString(),
						path: ['maxLength'],
					});
				}

				if (isDecimal && !arg.decimalDigits) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: t('forms.required', {
							label: capitalize(t('general.decimal_digits').toLowerCase()),
						}).toString(),
						path: ['decimalDigits'],
					});
				}

				if (isBasicValueList && !arg.basicValueList) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: t('forms.required', {
							label: capitalize(t('database.fields.basic_value_list_type').toLowerCase()),
						}).toString(),
						path: ['basicValueList'],
					});
				}

				if (isEnum && (!arg.enumSelectList || arg.enumSelectList?.trim().length === 0)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: t('forms.enterAtLeastOneValue').toString(),
						path: ['enumSelectList'],
					});
				}

				if (isReference && !arg.referenceModelIid) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: t('forms.required', {
							label: capitalize(t('database.fields.reference_model').toLowerCase()),
						}).toString(),
						path: ['referenceModelIid'],
					});
				}

				if (isReference && !arg.referenceAction) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: t('forms.required', {
							label: capitalize(t('database.fields.reference_action').toLowerCase()),
						}).toString(),
						path: ['referenceAction'],
					});
				}
			}),
	});

	const form = useForm<z.infer<typeof Schema>>({
		resolver: zodResolver(Schema),
		defaultValues: {
			general: {
				immutable: false,
				indexed: false,
				required: false,
				searchable: false,
				unique: false,
				timeStamps: {
					enabled: true,
					createdAt: 'createdAt',
					updatedAt: 'updatedAt',
				},
				referenceModelIid: fieldToEdit?.reference?.iid,
			},
		},
	});

	useEffect(() => {
		if (!open) form.reset();
		else getModels();
	}, [open]);

	useEffect(() => {
		if (fieldToEdit && open && editMode) setDefaultsForEdit();
	}, [fieldToEdit, open, editMode]);

	async function getModels() {
		if (TYPE !== 'reference') return;

		const models = await getReferenceModels({
			orgId: params?.orgId,
			appId: params?.appId,
			versionId: params?.versionId,
			dbId: params?.dbId,
		});

		setModels(models);
	}

	async function onSubmit(data: z.infer<typeof Schema>) {
		if (!params) return;
		const dataForAPI = {
			fieldId: editMode ? fieldToEdit._id : '',
			type: editMode ? fieldToEdit.type : type?.name ?? '',
			orgId: params.orgId,
			appId: params.appId,
			versionId: params.versionId,
			dbId: params.dbId,
			modelId: params.modelId,
			name: data.general.name,
			required: data.general.required,
			unique: data.general.unique,
			immutable: data.general.immutable,
			indexed: data.general.indexed,
			defaultValue: data.general.defaultValue,
			description: data.general.description,
			text: {
				searchable: data.general.searchable,
				maxLength: Number(data.general.maxLength),
			},
			richText: {
				searchable: data.general.searchable,
			},
			encryptedText: {
				maxLength: Number(data.general.maxLength),
			},
			decimal: {
				decimalDigits: Number(data.general.decimalDigits),
			},
			reference: {
				iid: data.general.referenceModelIid as string,
				action: data.general.referenceAction as ReferenceAction,
			},
			enum: {
				selectList: data.general.enumSelectList?.trim().split('\n') as string[],
			},
			object: {
				timestamps: data.general.timeStamps,
			},
			objectList: {
				timestamps: data.general.timeStamps,
			},
			basicValuesList: {
				type: data.general.basicValueList as BasicValueListType,
			},
		};
		try {
			editMode ? await updateField(dataForAPI) : await addNewField(dataForAPI);
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

	function setDefaultsForEdit() {
		form.setValue('general.name', fieldToEdit.name);
		form.setValue('general.required', fieldToEdit.required);
		form.setValue('general.unique', fieldToEdit.unique);
		form.setValue('general.immutable', fieldToEdit.immutable);
		form.setValue('general.indexed', fieldToEdit.indexed);
		form.setValue('general.defaultValue', fieldToEdit.defaultValue);
		form.setValue('general.description', fieldToEdit.description);

		if (fieldToEdit.text) {
			form.setValue('general.searchable', fieldToEdit.text.searchable);
			form.setValue('general.maxLength', fieldToEdit.text.maxLength.toString());
		}

		if (fieldToEdit.richText) {
			form.setValue('general.searchable', fieldToEdit.richText.searchable);
		}

		if (fieldToEdit.encryptedText) {
			form.setValue('general.maxLength', fieldToEdit.encryptedText.maxLength.toString());
		}

		if (fieldToEdit.decimal) {
			form.setValue('general.decimalDigits', fieldToEdit.decimal.decimalDigits.toString());
		}

		if (fieldToEdit.enum) {
			form.setValue('general.enumSelectList', fieldToEdit.enum.selectList.join('\n'));
		}

		if (fieldToEdit.object) {
			form.setValue('general.timeStamps.enabled', fieldToEdit.object.timestamps?.enabled);
			form.setValue('general.timeStamps.createdAt', fieldToEdit.object.timestamps?.createdAt);
			form.setValue('general.timeStamps.updatedAt', fieldToEdit.object.timestamps?.updatedAt);
		}

		if (fieldToEdit.objectList) {
			form.setValue('general.timeStamps.enabled', fieldToEdit.objectList.timestamps?.enabled);
			form.setValue('general.timeStamps.createdAt', fieldToEdit.objectList.timestamps?.createdAt);
			form.setValue('general.timeStamps.updatedAt', fieldToEdit.objectList.timestamps?.updatedAt);
		}

		if (fieldToEdit.reference) {
			form.setValue('general.referenceAction', fieldToEdit.reference.action);
			form.setValue('general.referenceModelIid', fieldToEdit.reference.iid);
		}
	}

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className='overflow-x-hidden'>
				<DrawerHeader>
					<DrawerTitle>
						{editMode
							? t('database.fields.edit')
							: t('database.fields.add_field', {
									field: toDisplayName(type ? type?.name : ''),
							  })}
					</DrawerTitle>
				</DrawerHeader>
				<div className='p-6 space-y-6'>
					<Form {...form}>
						<form className='space-y-6' onSubmit={form.handleSubmit(onSubmit)}>
							<FormField
								control={form.control}
								name='general.name'
								render={({ field, formState: { errors } }) => (
									<FormItem className='space-y-1'>
										<FormLabel>{t('database.fields.form.name')}</FormLabel>
										<FormControl>
											<Input
												error={Boolean(errors.general?.name)}
												type='text'
												placeholder={
													t('forms.placeholder', {
														label: t('database.fields.form.name').toLowerCase(),
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
								name='general.description'
								render={({ field }) => (
									<FormItem className='space-y-1'>
										<FormLabel>{t('database.fields.field_desc')}</FormLabel>
										<FormControl>
											<Textarea
												error={Boolean(form.formState.errors.general?.description)}
												placeholder={t('database.fields.field_desc_placeholder').toString()}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Separator />
							{hasMaxLength && (
								<>
									<FormField
										control={form.control}
										name='general.maxLength'
										render={({ field, formState: { errors } }) => (
											<FormItem className='space-y-1'>
												<FormLabel>{t('general.max_length')}</FormLabel>
												<FormControl>
													<Input
														error={Boolean(errors.general?.maxLength)}
														type='number'
														placeholder={
															t('forms.placeholder', {
																label: t('general.max_length').toLowerCase(),
															}) as string
														}
														{...field}
													/>
												</FormControl>
												<FormMessage />
												<FormDescription>
													{t('forms.maxLength.description', {
														length: MAX_LENGTH,
													})}
												</FormDescription>
											</FormItem>
										)}
									/>
									<Separator />
								</>
							)}
							{isDecimal && (
								<>
									<FormField
										control={form.control}
										name='general.decimalDigits'
										render={({ field, formState: { errors } }) => (
											<FormItem className='space-y-1'>
												<FormLabel>{t('general.decimal_digits')}</FormLabel>
												<FormControl>
													<Input
														error={Boolean(errors.general?.decimalDigits)}
														type='number'
														placeholder={
															t('forms.placeholder', {
																label: t('general.decimal_digits').toLowerCase(),
															}) as string
														}
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
							{isEnum && (
								<>
									<FormField
										control={form.control}
										name='general.enumSelectList'
										render={({ field }) => (
											<FormItem className='space-y-1'>
												<FormLabel>{t('database.fields.enum_values')}</FormLabel>
												<FormControl>
													<Textarea
														error={Boolean(form.formState.errors.general?.enumSelectList)}
														rows={4}
														placeholder={t('database.fields.enum_placeholder').toString()}
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
							{isBasicValueList && (
								<>
									<FormField
										control={form.control}
										name='general.basicValueList'
										render={({ field, formState: { errors } }) => (
											<FormItem className='space-y-1'>
												<FormLabel>{t('database.fields.basic_value_list_type')}</FormLabel>
												<FormControl>
													<Select
														defaultValue={field.value}
														value={field.value}
														name={field.name}
														onValueChange={field.onChange}
													>
														<FormControl>
															<SelectTrigger
																className={cn(
																	'w-full input',
																	errors.general?.basicValueList && 'input-error',
																)}
															>
																<SelectValue
																	className={cn('text-subtle')}
																	placeholder={t('database.fields.basic_value_list_placeholder')}
																/>
															</SelectTrigger>
														</FormControl>
														<SelectContent align='center'>
															{basicValueListTypes.map((type, index) => {
																const Icon = FIELD_ICON_MAP[type];
																return (
																	<SelectItem
																		checkClassName='right-2 left-auto top-1/2 -translate-y-1/2'
																		className='px-3 py-[6px] w-full max-w-full cursor-pointer'
																		key={index}
																		value={type}
																	>
																		<div className='flex items-center gap-2'>
																			{Icon && <Icon className='text-icon-base text-xl' />}
																			{toDisplayName(type)}
																		</div>
																	</SelectItem>
																);
															})}
														</SelectContent>
													</Select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<Separator />
								</>
							)}
							{hasTimestamps && (
								<>
									<FormField
										control={form.control}
										name='general.timeStamps.enabled'
										render={({ field }) => (
											<FormItem className='space-y-1'>
												<FormControl>
													<SettingsFormItem
														twoColumns
														as='label'
														className='py-0 space-y-0'
														contentClassName='flex items-center justify-center'
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
									{!form.getValues('general.timeStamps.enabled') && <Separator />}
									{form.getValues('general.timeStamps.enabled') && (
										<>
											<div className='grid grid-cols-2 gap-4'>
												<FormField
													control={form.control}
													name='general.timeStamps.createdAt'
													render={({ field, formState: { errors } }) => (
														<FormItem className='space-y-1'>
															<FormLabel>
																{t('database.models.add.timestamps.createdAt.field')}
															</FormLabel>
															<FormControl>
																<Input
																	error={Boolean(errors.general?.timeStamps?.createdAt)}
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
													name='general.timeStamps.updatedAt'
													render={({ field, formState: { errors } }) => (
														<FormItem className='space-y-1'>
															<FormLabel>
																{t('database.models.add.timestamps.updatedAt.field')}
															</FormLabel>
															<FormControl>
																<Input
																	error={Boolean(errors.general?.timeStamps?.updatedAt)}
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
											<Separator />
										</>
									)}
								</>
							)}
							{isReference && (
								<>
									<div className='grid grid-cols-2 gap-4'>
										<FormField
											control={form.control}
											name='general.referenceAction'
											render={({ field, formState: { errors } }) => (
												<FormItem className='space-y-1'>
													<FormLabel>{t('database.fields.reference_action')}</FormLabel>
													<FormControl>
														<Select
															defaultValue={field.value}
															value={field.value}
															name={field.name}
															onValueChange={field.onChange}
														>
															<FormControl>
																<SelectTrigger
																	className={cn(
																		'w-full input',
																		errors.general?.referenceAction && 'input-error',
																	)}
																>
																	<SelectValue
																		className={cn('text-subtle')}
																		placeholder={t('database.fields.reference_action_placeholder')}
																	/>
																</SelectTrigger>
															</FormControl>
															<SelectContent align='center'>
																{REFERENCE_FIELD_ACTION.map((action, index) => {
																	return (
																		<SelectItem
																			checkClassName='right-2 left-auto top-1/2 -translate-y-1/2'
																			className='px-3 py-[6px] w-full max-w-full cursor-pointer'
																			key={index}
																			value={action}
																		>
																			<div className='flex items-center gap-2'>{action}</div>
																		</SelectItem>
																	);
																})}
															</SelectContent>
														</Select>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name='general.referenceModelIid'
											render={({ field, formState: { errors } }) => {
												return (
													<FormItem className='space-y-1'>
														<FormLabel>{t('database.fields.reference_model')}</FormLabel>
														<FormControl>
															<Select
																value={field.value}
																name={field.name}
																onValueChange={field.onChange}
															>
																<FormControl>
																	<SelectTrigger
																		className={cn(
																			'w-full input',
																			errors.general?.referenceModelIid && 'input-error',
																		)}
																	>
																		<SelectValue
																			className='text-subtle'
																			placeholder={t('database.fields.reference_model_placeholder')}
																		/>
																	</SelectTrigger>
																</FormControl>
																<SelectContent align='center'>
																	{models.map((model, index) => {
																		return (
																			<SelectItem
																				checkClassName='right-2 left-auto top-1/2 -translate-y-1/2'
																				className='px-3 py-[6px] w-full max-w-full cursor-pointer'
																				key={index}
																				value={model.iid}
																			>
																				{model.name}
																			</SelectItem>
																		);
																	})}
																</SelectContent>
															</Select>
														</FormControl>
														<FormMessage />
													</FormItem>
												);
											}}
										/>
									</div>
									<Separator />
								</>
							)}
							<div className='space-y-4'>
								{views.map((key, index) => (
									<FormField
										key={index}
										control={form.control}
										name={`general.${key}`}
										render={({ field }) => (
											<FormItem>
												<SettingsFormItem
													as='label'
													className='py-0 space-y-0'
													contentClassName='flex items-center justify-center'
													title={t(`general.${key}`)}
													description={t(`database.fields.form.${key}_desc`)}
													twoColumns
												>
													<Switch
														disabled={editMode && key === 'unique'}
														checked={field.value}
														onCheckedChange={field.onChange}
													/>
												</SettingsFormItem>
												<FormMessage />
											</FormItem>
										)}
									/>
								))}
								<FormField
									control={form.control}
									name='general.required'
									render={({ field }) => (
										<FormItem className='space-y-1'>
											<FormControl>
												<SettingsFormItem
													as='label'
													className='py-0 space-y-0'
													contentClassName='flex items-center justify-center'
													title={t('general.required')}
													description={t('database.fields.form.required_desc')}
													twoColumns
												>
													<Switch
														disabled={editMode && !fieldToEdit.required}
														checked={field.value}
														onCheckedChange={field.onChange}
													/>
												</SettingsFormItem>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							{hasDefaultValue && (
								<>
									<Separator />
									<div className='space-y-6'>
										<FormField
											control={form.control}
											name='general.defaultValue'
											render={({ field }) => (
												<FormItem className={cn('flex-1 flex flex-col ')}>
													<FormLabel>{t('database.fields.form.default_value')}</FormLabel>
													<FormControl className='flex-1'>
														<Input
															error={Boolean(form.formState.errors.general?.defaultValue)}
															placeholder={
																t('forms.placeholder', {
																	label: t('database.fields.form.default_value').toLowerCase(),
																}) as string
															}
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</>
							)}
							<div className='flex justify-end'>
								<Button size='lg'>{editMode ? t('general.save') : t('general.add')}</Button>
							</div>
						</form>
					</Form>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
