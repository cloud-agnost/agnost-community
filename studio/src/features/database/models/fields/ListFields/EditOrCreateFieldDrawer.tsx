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
	ADD_MODEL_FIELDS_TAB_ITEMS,
	DECIMAL_DIGITS,
	ENCRYPTED_TEXT_MAX_LENGTH,
	MODEL_FIELD_DEFAULT_VALUE_TYPES,
	NAME_SCHEMA,
	RICH_TEXT_MAX_LENGTH,
	TEXT_MAX_LENGTH,
	TIMESTAMPS_SCHEMA,
} from '@/constants';
import { useEffect, useState } from 'react';
import { APIError, FieldType, ReferenceAction } from '@/types';
import { cn, toDisplayName } from '@/utils';
import { useParams, useSearchParams } from 'react-router-dom';
import { Switch } from 'components/Switch';
import { SettingsFormItem } from 'components/SettingsFormItem';
import { OrganizationMenuItem } from '@/features/organization';
import { CodeEditor } from 'components/CodeEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/Select';
import { Separator } from 'components/Separator';
import useModelStore from '@/store/database/modelStore.ts';

type View = keyof FieldType['view'];

const Schema = z.object({
	general: z.object({
		name: NAME_SCHEMA,
		required: z.boolean(),
		unique: z.boolean(),
		indexed: z.boolean(),
		searchable: z.boolean(),
		immutable: z.boolean(),
		defaultValue: z.string().optional(),
		description: z.string().optional(),
		textMaxLength: z.number(),
		richTextMaxLength: z.number(),
		encryptedTextMaxLength: z.number(),
		decimalDigits: z.number(),
		referenceModelIid: z.string(),
		referenceAction: z.string(),
		enumSelectList: z.array(z.string()),
		timeStamps: TIMESTAMPS_SCHEMA,
	}),
});

interface EditOrCreateModelDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editMode?: boolean;
	type?: FieldType;
}

export default function EditOrCreateFieldDrawer({
	open,
	onOpenChange,
	editMode,
	type,
}: EditOrCreateModelDrawerProps) {
	const { t } = useTranslation();
	const addNewField = useModelStore((state) => state.addNewField);
	const [searchParams, setSearchParams] = useSearchParams();

	const [defaultValueType, setDefaultValueType] = useState<
		(typeof MODEL_FIELD_DEFAULT_VALUE_TYPES)[0] | undefined
	>(MODEL_FIELD_DEFAULT_VALUE_TYPES[0]);

	const params = useParams() as {
		orgId: string;
		appId: string;
		versionId: string;
		dbId: string;
		modelId: string;
	};

	const form = useForm<z.infer<typeof Schema>>({
		resolver: zodResolver(Schema),
		defaultValues: {
			general: {
				immutable: false,
				indexed: false,
				name: '',
				required: false,
				searchable: false,
				unique: false,
				defaultValue: '',
				description: '',
				textMaxLength: TEXT_MAX_LENGTH,
				richTextMaxLength: RICH_TEXT_MAX_LENGTH,
				encryptedTextMaxLength: ENCRYPTED_TEXT_MAX_LENGTH,
				decimalDigits: DECIMAL_DIGITS,
				timeStamps: {
					enabled: true,
					createdAt: 'createdAt',
					updatedAt: 'updatedAt',
				},
				referenceAction: 'CASCADE',
				enumSelectList: [],
				referenceModelIid: '',
			},
		},
	});

	useEffect(() => {
		if (!defaultValueType) return;
		form.setValue('general.defaultValue', '');
	}, [defaultValueType]);

	useEffect(() => {
		if (!open) {
			searchParams.delete('t');
			setSearchParams(searchParams);
			form.reset();
		} else if (!searchParams.has('t')) {
			searchParams.set('t', 'general');
			setSearchParams(searchParams);
		}
	}, [open]);

	useEffect(() => {
		setDefaultsForEdit();
	}, [open]);

	function setDefaultsForEdit() {
		if (!open) return;
	}

	async function onSubmit(data: z.infer<typeof Schema>) {
		const action = editMode ? update : create;
		try {
			await action(data);
			//onOpenChange(false);
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
		if (!params || !type) return;

		console.log(
			await addNewField({
				type: type.name,
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
					maxLength: data.general.textMaxLength,
				},
				richText: {
					searchable: data.general.searchable,
					maxLength: data.general.richTextMaxLength,
				},
				encryptedText: {
					maxLength: data.general.encryptedTextMaxLength,
				},
				decimal: {
					decimalDigits: data.general.decimalDigits,
				},
				reference: {
					iid: data.general.referenceModelIid,
					action: data.general.referenceAction as ReferenceAction,
				},
				enum: {
					selectList: data.general.enumSelectList,
				},
				object: {
					timestamps: data.general.timeStamps,
				},
				objectList: {
					timestamps: data.general.timeStamps,
				},
			}),
		);
	}

	async function update(data: z.infer<typeof Schema>) {
		console.log(data);
	}

	const views = Object.entries(type?.view ?? {})
		.filter(([, value]) => !!value)
		.map(([key]) => key) as View[];

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className='overflow-x-hidden'>
				<DrawerHeader className='border-none'>
					<DrawerTitle>
						{editMode
							? t('database.fields.edit')
							: t('database.fields.add_field', {
									field: toDisplayName(type ? type?.name : ''),
							  })}
					</DrawerTitle>
				</DrawerHeader>
				<ul className='mx-auto flex border-b'>
					{ADD_MODEL_FIELDS_TAB_ITEMS.map((item) => {
						return (
							<OrganizationMenuItem
								key={item.name}
								item={item}
								active={window.location.search.includes(item.href)}
							/>
						);
					})}
				</ul>
				<div className='p-6 space-y-6'>
					<Form {...form}>
						<form className='space-y-6' onSubmit={form.handleSubmit(onSubmit)}>
							{searchParams.get('t') === 'general' && (
								<>
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
									<div className='space-y-4'>
										{views.map((key) => (
											<FormField
												key={key}
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
															<Switch checked={field.value} onCheckedChange={field.onChange} />
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
															<Switch checked={field.value} onCheckedChange={field.onChange} />
														</SettingsFormItem>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<Separator />
									<div className='space-y-6'>
										<SettingsFormItem
											className='w-full py-0 space-y-0 [&>*:first-child]:flex [&>*:first-child]:items-end'
											title={t('database.fields.form.default_value')}
											twoColumns
										>
											<Select
												onValueChange={(value) =>
													setDefaultValueType(
														MODEL_FIELD_DEFAULT_VALUE_TYPES.find((item) => item.name === value),
													)
												}
												value={defaultValueType?.name}
											>
												<FormControl>
													<SelectTrigger className={cn('!w-[155px] input')}>
														<SelectValue className={cn('text-subtle')} />
													</SelectTrigger>
												</FormControl>
												<SelectContent align='center'>
													{MODEL_FIELD_DEFAULT_VALUE_TYPES.map((item, index) => {
														return (
															<SelectItem
																checkClassName='right-2 left-auto top-1/2 -translate-y-1/2'
																className='px-3 py-[6px] w-full max-w-full cursor-pointer'
																key={index}
																value={item.name}
															>
																<div className='flex items-center gap-2'>{item.name}</div>
															</SelectItem>
														);
													})}
												</SelectContent>
											</Select>
										</SettingsFormItem>
										<FormField
											control={form.control}
											name='general.defaultValue'
											render={({ field }) => (
												<FormItem
													className={cn(
														'flex-1 flex flex-col ',
														defaultValueType?.name === 'JS Function' && 'h-[150px]',
													)}
												>
													<FormControl className='flex-1'>
														{defaultValueType?.name === 'Constant' ? (
															<Textarea
																placeholder={
																	t('forms.placeholder', {
																		label: t('database.fields.form.default_value').toLowerCase(),
																	}) as string
																}
																{...field}
															/>
														) : (
															<CodeEditor
																defaultValue={
																	MODEL_FIELD_DEFAULT_VALUE_TYPES.find(
																		(item) => item.name === defaultValueType?.name,
																	)?.value
																}
																containerClassName='flex-1'
																{...field}
															/>
														)}
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</>
							)}
							{searchParams.get('t') === 'specific' && <h1>hello</h1>}
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
