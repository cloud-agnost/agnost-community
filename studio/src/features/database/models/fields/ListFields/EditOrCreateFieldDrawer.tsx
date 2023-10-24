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
	DATABASE,
	MAX_LENGTHS,
	MYSQL_RESERVED_WORDS,
	NAME_SCHEMA,
	POSTGRES_RESERVED_WORDS,
	REFERENCE_FIELD_ACTION,
	SQL_SERVER_RESERVED_WORDS,
	TIMESTAMPS_SCHEMA,
} from '@/constants';
import { useEffect, useMemo, useState } from 'react';
import { APIError, Database, Field, FieldType, Model, ReferenceAction } from '@/types';
import { capitalize, cn, toDisplayName } from '@/utils';
import { useParams } from 'react-router-dom';
import { Switch } from 'components/Switch';
import { SettingsFormItem } from 'components/SettingsFormItem';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/Select';
import { Separator } from 'components/Separator';
import useModelStore from '@/store/database/modelStore.ts';
import useTypeStore from '@/store/types/typeStore.ts';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';

type View = keyof FieldType['view'];

interface EditOrCreateModelDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editMode?: boolean;
	type?: FieldType;
}

const defaultValueDisabledTypes = [
	'time',
	'object',
	'object-list',
	'encrypted-text',
	'basic-values-list',
	'geo-point',
	'rich-text',
	'binary',
	'json',
];

const booleanDefaults = [
	{
		label: 'Not set',
		value: '',
	},
	{
		label: 'True',
		value: 'true',
	},
	{
		label: 'False',
		value: 'false',
	},
];

const datetimeDefaults = [
	{
		label: 'Not set',
		value: '',
	},
	{
		label: 'Current date',
		value: '$$NOW',
	},
];

export default function EditOrCreateFieldDrawer({
	open,
	onOpenChange,
	editMode,
	type,
}: EditOrCreateModelDrawerProps) {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const databases = useDatabaseStore((state) => state.databases);
	const fieldTypes = useTypeStore((state) => state.fieldTypes);
	const fieldToEdit = useModelStore((state) => state.fieldToEdit) as Field;
	const addNewField = useModelStore((state) => state.addNewField);
	const updateField = useModelStore((state) => state.updateField);
	const getReferenceModels = useModelStore((state) => state.getReferenceModels);
	const [models, setModels] = useState<Model[]>([]);
	const canCreate = useAuthorizeVersion('model.create');
	const MAX_LENGTH = MAX_LENGTHS[editMode ? fieldToEdit?.type : type?.name ?? ''];

	const { dbId, modelId, appId, versionId, orgId } = useParams() as {
		orgId: string;
		appId: string;
		versionId: string;
		dbId: string;
		modelId: string;
	};

	const database = useMemo(() => {
		return databases.find((database) => database._id === dbId) as Database;
	}, [databases, dbId]);

	const TYPE = editMode ? fieldToEdit?.type : type?.name ?? '';
	const hasMaxLength = ['text', 'encrypted-text'].includes(TYPE);
	const isDecimal = TYPE === 'decimal';
	const isBoolean = TYPE === 'boolean';
	const isMoney = TYPE === 'monetary';
	const isInteger = TYPE === 'integer';
	const isEnum = TYPE === 'enum';
	const isReference = TYPE === 'reference';
	const isDatetime = TYPE === 'datetime';
	const isDate = TYPE === 'date';
	const isGeoPoint = TYPE === 'geo-point';

	const hasDefaultValue = !defaultValueDisabledTypes.includes(TYPE);

	const defaults = isDatetime || isDate ? datetimeDefaults : isBoolean ? booleanDefaults : [];

	const view = editMode
		? fieldTypes.find((type) => type.name === fieldToEdit?.type)?.view
		: type?.view;

	if (database.type === DATABASE.SQLServer && ['rich-text'].includes(TYPE) && view?.indexed) {
		view.indexed = false;
	}

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
					.optional(),
				decimalDigits: z
					.string()
					.regex(/^\d+$/, {
						message: t('forms.number', {
							label: capitalize(t('general.decimal_digits').toLowerCase()),
						}).toString(),
					})
					.refine((value) => Number(value) > 0 && Number(value) <= (MAX_LENGTH as number), {
						message: t('forms.maxLength.error', {
							length: MAX_LENGTH,
							label: capitalize(t('general.decimal_digits').toLowerCase()),
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
				if (isInteger && arg?.defaultValue && !Number.isInteger(Number(arg.defaultValue))) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: t('forms.invalid', {
							label: capitalize(t('general.default_value').toLowerCase()),
						}).toString(),
						path: ['defaultValue'],
					});
				}

				if (hasMaxLength && Number(arg?.defaultValue?.length) > Number(arg.maxLength)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: t('forms.maxLength.error', {
							length: arg.maxLength,
							label: capitalize(t('general.default_value').toLowerCase()),
						}).toString(),
						path: ['defaultValue'],
					});
				}

				if (
					isEnum &&
					arg?.defaultValue &&
					!arg.enumSelectList?.trim().split('\n').includes(arg.defaultValue)
				) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: t('forms.invalid', {
							label: capitalize(t('general.default_value').toLowerCase()),
						}).toString(),
						path: ['defaultValue'],
					});
				}

				if (isDecimal && arg?.defaultValue) {
					if (isNaN(Number(arg.defaultValue))) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: t('forms.invalid', {
								label: capitalize(t('general.default_value').toLowerCase()),
							}).toString(),
							path: ['defaultValue'],
						});
					}
					if (arg?.decimalDigits) {
						const decimalDigits = Number(arg.decimalDigits);
						const decimalDigitsLength = arg.defaultValue?.split('.')[1]?.length ?? 0;

						if (decimalDigitsLength > decimalDigits) {
							ctx.addIssue({
								code: z.ZodIssueCode.custom,
								message: t('forms.decimal.decimal_digits', {
									decimal_digits: decimalDigits,
								}).toString(),
								path: ['defaultValue'],
							});
						}
					}
				}

				if (isMoney && arg?.defaultValue && isNaN(Number(arg.defaultValue))) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: t('forms.invalid', {
							label: capitalize(t('general.default_value').toLowerCase()),
						}).toString(),
						path: ['defaultValue'],
					});
				}

				if (hasMaxLength && !arg.maxLength) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: t('forms.required', {
							label: capitalize(t('general.max_length').toLowerCase()),
						}).toString(),
						path: ['maxLength'],
					});
				}

				if (
					editMode &&
					hasMaxLength &&
					((fieldToEdit.text?.maxLength && Number(arg.maxLength) < fieldToEdit.text.maxLength) ||
						(fieldToEdit.encryptedText?.maxLength &&
							Number(arg.maxLength) < fieldToEdit.encryptedText.maxLength))
				) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: t('forms.fieldMaxLength.error').toString(),
						path: ['maxLength'],
					});
				}

				if (hasMaxLength) {
					const valueAsNumber = Number(arg.maxLength);
					const isText = TYPE === 'text' && typeof MAX_LENGTH === 'object';
					const isBetween = (min: number, max: number) =>
						valueAsNumber >= min && valueAsNumber <= max;

					const conditionForText = isText && !isBetween(1, MAX_LENGTH[database.type]);
					const conditionForEncryptedText =
						typeof MAX_LENGTH === 'number' && !isBetween(1, MAX_LENGTH);

					if (conditionForText || conditionForEncryptedText) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: t('forms.maxLength.error', {
								length: conditionForText ? MAX_LENGTH[database.type] : MAX_LENGTH,
								label: capitalize(t('general.max_length').toLowerCase()),
							}).toString(),
							path: ['maxLength'],
						});
					}
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

				if (isReference && database.type !== DATABASE.MongoDB && !arg.referenceAction) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: t('forms.required', {
							label: capitalize(t('database.fields.reference_action').toLowerCase()),
						}).toString(),
						path: ['referenceAction'],
					});
				}

				if (isReference && database.type !== DATABASE.MongoDB && arg.defaultValue && isNaN(Number(arg.defaultValue))) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: t('forms.number', {
							label: capitalize(t('general.default_value').toLowerCase()),
						}).toString(),
						path: ['defaultValue'],
					});
				}

				if (
					database?.type === DATABASE.PostgreSQL &&
					POSTGRES_RESERVED_WORDS.includes(arg.name.toLowerCase())
				) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: t('forms.reservedWord', {
							label: arg.name,
						}).toString(),
						path: ['name'],
					});
				}

				if (
					database?.type === DATABASE.MySQL &&
					MYSQL_RESERVED_WORDS.includes(arg.name.toLowerCase())
				) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: t('forms.reservedWord', {
							label: arg.name,
						}).toString(),
						path: ['name'],
					});
				}

				if (
					database?.type === DATABASE.SQLServer &&
					SQL_SERVER_RESERVED_WORDS.includes(arg.name.toLowerCase())
				) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: t('forms.reservedWord', {
							label: arg.name,
						}).toString(),
						path: ['name'],
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
				defaultValue:
					!editMode && (isBoolean || isDatetime || isDate) ? defaults[0].value : undefined,
				referenceModelIid: fieldToEdit?.reference?.iid,
			},
		},
	});

	const indexWatch = form.watch('general.indexed');
	const requiredWatch = form.watch('general.required');

	useEffect(() => {
		if (database?.type !== DATABASE.MySQL || !isGeoPoint) return;

		if (form.getValues('general.indexed')) {
			form.setValue('general.required', true);
		}
	}, [indexWatch, database, isGeoPoint]);

	useEffect(() => {
		if (database?.type !== DATABASE.MySQL || !isGeoPoint) return;

		if (!form.getValues('general.required')) {
			form.setValue('general.indexed', false);
		}
	}, [requiredWatch, database, isGeoPoint]);

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
			orgId: orgId,
			appId: appId,
			versionId: versionId,
			dbId: dbId,
		});

		setModels(models);
	}

	async function onSubmit(data: z.infer<typeof Schema>) {
		if (loading) return;
		const parseForBoolean = (value?: string) => {
			if (value === 'true') return true;
			if (value === 'false') return false;
			return undefined;
		};
		const getDefaultValue = () => {
			if (editMode && hasDefaultValue && !data.general.defaultValue) return '$$unset';

			if (isReference && database.type !== DATABASE.MongoDB || (isDecimal || isInteger)) {
				return Number(data.general.defaultValue)
			}
			if (isBoolean) return parseForBoolean(data.general.defaultValue);
			return data.general.defaultValue;
		};
		const getIndexed = () => {
			if (
				editMode &&
				isGeoPoint &&
				database.type === DATABASE.MySQL &&
				!fieldToEdit.indexed &&
				!fieldToEdit.required
			) {
				return false;
			}

			return data.general.indexed;
		};
		const getRequired = () => {
			if (editMode && !fieldToEdit.required) return false;
			return data.general.required;
		};

		const dataForAPI = {
			fieldId: editMode ? fieldToEdit._id : '',
			type: editMode ? fieldToEdit.type : type?.name ?? '',
			orgId: orgId,
			appId: appId,
			versionId: versionId,
			dbId: dbId,
			modelId,
			name: data.general.name,
			required: getRequired(),
			unique: data.general.unique,
			immutable: data.general.immutable,
			indexed: getIndexed(),
			defaultValue: getDefaultValue(),
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
		};
		try {
			setLoading(true);
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
		} finally {
			setLoading(false);
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
												{database.type !== DATABASE.MongoDB && (
													<FormDescription>
														{t('forms.maxLength.description', {
															length:
																typeof MAX_LENGTH === 'number'
																	? MAX_LENGTH
																	: MAX_LENGTH[database.type],
														})}
													</FormDescription>
												)}
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
							{isReference && (
								<>
									<div
										className={cn(
											'grid grid-cols-2 gap-4',
											database.type === DATABASE.MongoDB && 'grid-cols-1',
										)}
									>
										{database.type !== DATABASE.MongoDB && (
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
																			placeholder={t(
																				'database.fields.reference_action_placeholder',
																			)}
																		/>
																	</SelectTrigger>
																</FormControl>
																<SelectContent align='center'>
																	{REFERENCE_FIELD_ACTION.map((action, index) => {
																		return (
																			<SelectItem
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
										)}
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
								{views.map((key, index) => {
									const isDisabled =
										editMode &&
										((key === 'unique' && !fieldToEdit.unique) ||
											(isGeoPoint &&
												key === 'indexed' &&
												!fieldToEdit.indexed &&
												!fieldToEdit.required &&
												database.type === DATABASE.MySQL));
									return (
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
															disabled={isDisabled}
															checked={field.value}
															onCheckedChange={field.onChange}
														/>
													</SettingsFormItem>
													<FormMessage />
												</FormItem>
											)}
										/>
									);
								})}
								{!['object', 'object-list'].includes(TYPE) && (
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
															disabled={
																database.type !== DATABASE.MongoDB &&
																editMode &&
																!fieldToEdit.required
															}
															checked={field.value}
															onCheckedChange={field.onChange}
														/>
													</SettingsFormItem>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}
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
													{isBoolean || isDatetime || isDate ? (
														<FormControl>
															<Select
																defaultValue={field.value}
																value={field.value}
																name={field.name}
																onValueChange={field.onChange}
															>
																<FormControl>
																	<SelectTrigger className={cn('w-full input')}>
																		<SelectValue
																			className={cn('text-subtle')}
																			placeholder={t('database.fields.select_default_value')}
																		/>
																	</SelectTrigger>
																</FormControl>
																<SelectContent align='center'>
																	{defaults.map((item) => {
																		return (
																			<SelectItem
																				className='px-3 py-[6px] w-full max-w-full cursor-pointer'
																				key={item.label}
																				value={item.value}
																			>
																				<div className='flex items-center gap-2 [&>svg]:text-lg'>
																					{item.label}
																				</div>
																			</SelectItem>
																		);
																	})}
																</SelectContent>
															</Select>
														</FormControl>
													) : (
														<FormControl className='flex-1'>
															<Input
																error={Boolean(form.formState.errors.general?.defaultValue)}
																placeholder={
																	t('forms.placeholder', {
																		label: t('database.fields.form.default_value').toLowerCase(),
																	}) as string
																}
																{...field}
																onInput={field.onChange}
															/>
														</FormControl>
													)}
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</>
							)}
							<div className='flex justify-end'>
								<Button disabled={!canCreate} size='lg'>
									{editMode ? t('general.save') : t('general.add')}
								</Button>
							</div>
						</form>
					</Form>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
