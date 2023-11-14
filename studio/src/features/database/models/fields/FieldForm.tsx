import { Button } from '@/components/Button';
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/Form';
import { Input, Textarea } from '@/components/Input';
import { SettingsFormItem } from '@/components/SettingsFormItem';
import { DATABASE_TEXT_CAPACITIES, REFERENCE_FIELD_ACTION } from '@/constants';
import { useAuthorizeVersion, useFieldSchema } from '@/hooks';
import useDatabaseStore from '@/store/database/databaseStore';
import useModelStore from '@/store/database/modelStore';
import useTypeStore from '@/store/types/typeStore';
import { DatabaseTypes, FieldType } from '@/types';
import { capitalize, cn } from '@/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import { Switch } from '@/components/Switch';
import { useTranslation } from 'react-i18next';
import { Fragment, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import * as z from 'zod';

type View = keyof FieldType['view'];

export default function FieldForm({ editMode }: { editMode?: boolean }) {
	const canCreate = useAuthorizeVersion('model.create');
	const { referenceModels, field: toEditField, getReferenceModels } = useModelStore();
	const { fieldTypes } = useTypeStore();
	const { t } = useTranslation();

	const { Schema, typeCheck, languageOptions, maxLength, defaults } = useFieldSchema();
	const form = useFormContext<z.infer<typeof Schema>>();
	const type = fieldTypes.find((t) => t.name === form.watch('type')) as FieldType;
	const database = useDatabaseStore((state) => state.database);

	const {
		isDecimal,
		isEnum,
		isReference,
		isObject,
		isObjectList,
		isDatetime,
		isBoolean,
		isDate,
		hasDefaultValue,
		isGeoPoint,
		isRichText,
	} = typeCheck;
	const searchableWatch = form.watch('searchable');

	const view = {
		...type?.view,
		indexed: !(database?.type === DatabaseTypes.SQLServer && isRichText && type.view?.indexed),
	};
	const { dbId, appId, versionId, orgId } = useParams() as {
		orgId: string;
		appId: string;
		versionId: string;
		dbId: string;
	};

	const views = Object.entries(view ?? {})
		.filter(([, value]) => !!value)
		.map(([key]) => key) as View[];

	useEffect(() => {
		if (database?.type !== DatabaseTypes.MySQL || !isGeoPoint) return;

		if (!form.getValues('required')) {
			form.setValue('indexed', false);
		}
	}, [form.watch('required'), database, isGeoPoint]);

	useEffect(() => {
		if (database?.type !== DatabaseTypes.MySQL || !isGeoPoint) return;

		if (form.getValues('indexed')) {
			form.setValue('required', true);
		}
	}, [form.watch('indexed'), database, isGeoPoint]);

	useEffect(() => {
		if (!isReference) form.reset();
		else
			getReferenceModels({
				orgId,
				appId,
				versionId,
				dbId,
			});
	}, [isReference]);
	console.log(form.formState.errors);
	return (
		<>
			<FormField
				control={form.control}
				name='name'
				render={({ field, formState: { errors } }) => (
					<FormItem className='space-y-1'>
						<FormLabel>{t('database.fields.form.name')}</FormLabel>
						<FormControl>
							<Input
								error={Boolean(errors?.name)}
								type='text'
								placeholder={t('forms.placeholder', {
									label: t('database.fields.form.name').toLowerCase(),
								}).toString()}
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
				name='description'
				render={({ field }) => (
					<FormItem className='space-y-1'>
						<FormLabel>{t('database.fields.field_desc')}</FormLabel>
						<FormControl>
							<Textarea
								error={Boolean(form.formState.errors?.description)}
								placeholder={t('database.fields.field_desc_placeholder').toString()}
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			{typeCheck.hasMaxLength && (
				<FormField
					control={form.control}
					name='maxLength'
					render={({ field, formState: { errors } }) => (
						<FormItem className='space-y-1'>
							<FormLabel>{t('general.max_length')}</FormLabel>
							<FormControl>
								<Input
									error={Boolean(errors?.maxLength)}
									type='number'
									placeholder={t('forms.placeholder', {
										label: t('general.max_length').toLowerCase(),
									}).toString()}
									{...field}
								/>
							</FormControl>
							<FormMessage />
							{database.type !== DatabaseTypes.MongoDB && (
								<FormDescription>
									{t('forms.maxLength.description', {
										length: !typeCheck.isText ? maxLength : DATABASE_TEXT_CAPACITIES[database.type],
									})}
								</FormDescription>
							)}
						</FormItem>
					)}
				/>
			)}
			{isDecimal && (
				<FormField
					control={form.control}
					name='decimalDigits'
					render={({ field, formState: { errors } }) => (
						<FormItem className='space-y-1'>
							<FormLabel>{t('general.decimal_digits')}</FormLabel>
							<FormControl>
								<Input
									error={Boolean(errors?.decimalDigits)}
									type='number'
									placeholder={t('forms.placeholder', {
										label: t('general.decimal_digits').toLowerCase(),
									}).toString()}
									{...field}
									onChange={undefined}
									onInput={(e) => field.onChange(e.currentTarget.valueAsNumber)}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			)}
			{isEnum && (
				<FormField
					control={form.control}
					name='enumSelectList'
					render={({ field }) => (
						<FormItem className='space-y-1'>
							<FormLabel>{t('database.fields.enum_values')}</FormLabel>
							<FormControl>
								<Textarea
									error={Boolean(form.formState.errors?.enumSelectList)}
									rows={4}
									placeholder={t('database.fields.enum_placeholder').toString()}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			)}
			{isReference && (
				<div
					className={cn(
						'grid grid-cols-2 gap-4',
						database.type === DatabaseTypes.MongoDB && 'grid-cols-1',
					)}
				>
					{database.type !== DatabaseTypes.MongoDB && (
						<FormField
							control={form.control}
							name='referenceAction'
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
													className={cn('w-full input', errors?.referenceAction && 'input-error')}
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
						name='referenceModelIid'
						render={({ field, formState: { errors } }) => {
							return (
								<FormItem className='space-y-1'>
									<FormLabel>{t('database.fields.reference_model')}</FormLabel>
									<FormControl>
										<Select value={field.value} name={field.name} onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger
													className={cn('w-full input', errors?.referenceModelIid && 'input-error')}
												>
													<SelectValue
														className='text-subtle'
														placeholder={t('database.fields.reference_model_placeholder')}
													/>
												</SelectTrigger>
											</FormControl>
											<SelectContent align='center'>
												{referenceModels.map((model) => {
													return (
														<SelectItem
															className='px-3 py-[6px] w-full max-w-full cursor-pointer'
															key={model.iid}
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
			)}
			<div className='space-y-4'>
				{views.map((key) => {
					const isDisabled =
						editMode &&
						((key === 'unique' && !toEditField.unique) ||
							(isGeoPoint &&
								key === 'indexed' &&
								!toEditField.indexed &&
								!toEditField.required &&
								database.type === DatabaseTypes.MySQL));
					return (
						<Fragment key={key}>
							<FormField
								control={form.control}
								name={key}
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
							{key === 'searchable' && languageOptions && searchableWatch && (
								<FormField
									control={form.control}
									name='language'
									render={({ field }) => (
										<FormItem className={cn('flex-1 flex flex-col')}>
											<FormLabel>
												{database.type === DatabaseTypes.MySQL
													? t('database.fields.searchable.collation.title')
													: t('database.fields.searchable.lang.title')}
											</FormLabel>
											<FormControl>
												<Select
													defaultValue={field.value}
													value={field.value}
													name={field.name}
													disabled={
														!!toEditField?.text?.language || !!toEditField?.richText?.language
													}
													onValueChange={field.onChange}
												>
													<FormControl>
														<SelectTrigger className={cn('w-full input')}>
															<SelectValue
																className={cn('text-subtle')}
																placeholder={
																	database.type === DatabaseTypes.MySQL
																		? t('database.fields.searchable.collation.placeholder')
																		: t('database.fields.searchable.lang.placeholder')
																}
															/>
														</SelectTrigger>
													</FormControl>
													<SelectContent className='max-h-[400px]'>
														{languageOptions.map((item) => {
															return (
																<SelectItem
																	className='px-3 py-[6px] w-full max-w-full cursor-pointer'
																	key={item.name}
																	value={item.value}
																>
																	<div className='flex items-center gap-2 [&>svg]:text-lg'>
																		{database.type === DatabaseTypes.MySQL
																			? item.name
																			: capitalize(item.name)}
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
							)}
						</Fragment>
					);
				})}
				{(isObject || isObjectList) && (
					<FormField
						control={form.control}
						name='required'
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
												database.type !== DatabaseTypes.MongoDB && editMode && !toEditField.required
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
				<div className='space-y-6'>
					<FormField
						control={form.control}
						name='defaultValue'
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
											error={Boolean(form.formState.errors?.defaultValue)}
											placeholder={t('forms.placeholder', {
												label: t('database.fields.form.default_value').toLowerCase(),
											}).toString()}
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
			)}
			<div className='flex justify-end'>
				<Button disabled={!canCreate} size='lg'>
					{editMode ? t('general.save') : t('general.add')}
				</Button>
			</div>
		</>
	);
}
