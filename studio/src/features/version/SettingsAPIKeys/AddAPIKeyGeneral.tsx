import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from 'components/Form';
import { Input } from 'components/Input';
import { Switch } from 'components/Switch';
import { ENDPOINT_ACCESS_PROPERTIES } from '@/constants';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useFormContext } from 'react-hook-form';
import * as z from 'zod';
import { Schema } from '@/features/version/SettingsAPIKeys/index.ts';
import { Fragment, useEffect } from 'react';
import { RadioGroup, RadioGroupItem } from 'components/RadioGroup';
import { Button } from 'components/Button';
import Select from 'react-select';
import { cn } from '@/utils';
import { DatePicker } from 'components/DatePicker';

export default function AddAPIKeyGeneral() {
	const { t } = useTranslation();
	const form = useFormContext<z.infer<typeof Schema>>();

	useEffect(() => {
		// TODO check later
		form.setValue('endpoint.allowedEndpoints', []);
		form.setValue('endpoint.excludedEndpoints', []);
	}, [form.getValues('endpoint.type')]);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className='p-6 flex flex-col divide-y [&>:first-child]:pt-0 [&>*]:py-6'
		>
			<FormField
				control={form.control}
				name='name'
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t('version.api_key.name')}</FormLabel>
						<FormControl>
							<Input
								error={Boolean(form.formState.errors.name)}
								placeholder={
									t('forms.placeholder', {
										label: t('version.api_key.name'),
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
			<FormField
				control={form.control}
				name='realtime'
				render={({ field }) => {
					return (
						<FormItem className='grid grid-cols-[2fr_1fr] items-center space-y-0 gap-2'>
							<div>
								<FormLabel>{t('version.api_key.allow_realtime')}</FormLabel>
								<FormDescription>{t('version.api_key.allow_realtime_desc')}</FormDescription>
							</div>
							<FormControl className='justify-self-end'>
								<Switch
									onBlur={field.onBlur}
									ref={field.ref}
									name={field.name}
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					);
				}}
			/>
			<FormField
				control={form.control}
				name='endpoint.type'
				render={({ field }) => (
					<FormItem className='space-y-6 selamm'>
						<FormLabel>{t('version.api_key.endpoint_access')}</FormLabel>
						<FormControl>
							<div className='flex gap-6 flex-col'>
								<RadioGroup
									onValueChange={field.onChange}
									defaultValue={field.value}
									className='flex flex-col gap-y-6'
								>
									{ENDPOINT_ACCESS_PROPERTIES.map((item, index) => (
										<Fragment key={index}>
											<FormItem className='flex space-x-3 space-y-0' key={index}>
												<FormControl className='mt-1'>
													<RadioGroupItem value={item} />
												</FormControl>
												<FormLabel className='select-none cursor-pointer'>
													<p className='text-default'>
														{t(`version.api_key.endpoint_access_${item.replace('-', '_')}`)}
													</p>
													<p className='text-subtle'>
														{t(`version.api_key.endpoint_access_${item.replace('-', '_')}_desc`)}
													</p>
												</FormLabel>
											</FormItem>
											{item === 'custom-allowed' &&
												form.getValues('endpoint.type') === 'custom-allowed' && (
													<FormField
														control={form.control}
														name='endpoint.allowedEndpoints'
														render={({ field }) => (
															<FormItem className='space-y-2'>
																<FormLabel>{t('version.api_key.allowed_endpoints')}</FormLabel>
																<FormControl>
																	<Select
																		className={cn(
																			'select-box',
																			form.formState.errors.endpoint?.message && 'error',
																		)}
																		classNamePrefix='select'
																		isClearable={true}
																		isMulti={true}
																		placeholder={t('forms.search_to_add', {
																			label: t('general.endpoint').toLowerCase(),
																		})}
																		options={field.value}
																		isSearchable={true}
																		{...field}
																	/>
																</FormControl>
																<FormMessage>{form.formState.errors.endpoint?.message}</FormMessage>
															</FormItem>
														)}
													/>
												)}
											{item === 'custom-excluded' &&
												form.getValues('endpoint.type') === 'custom-excluded' && (
													<FormField
														control={form.control}
														name='endpoint.excludedEndpoints'
														render={({ field }) => (
															<FormItem className='space-y-2'>
																<FormLabel>{t('version.api_key.exclude_endpoints')}</FormLabel>
																<FormControl>
																	<Select
																		classNamePrefix='select'
																		className={cn(
																			'select-box',
																			form.formState.errors.endpoint?.message && 'error',
																		)}
																		isClearable={true}
																		isMulti={true}
																		placeholder={t('forms.search_to_add', {
																			label: t('general.endpoint').toLowerCase(),
																		})}
																		options={field.value}
																		isSearchable={true}
																		{...field}
																	/>
																</FormControl>
																<FormMessage>{form.formState.errors.endpoint?.message}</FormMessage>
															</FormItem>
														)}
													/>
												)}
										</Fragment>
									))}
								</RadioGroup>
							</div>
						</FormControl>
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name='expiryDate'
				render={({ field }) => (
					<FormItem className='flex flex-col'>
						<FormLabel>{t('version.api_key.expire_date')}</FormLabel>
						<DatePicker
							mode='single'
							selected={field.value}
							onSelect={field.onChange}
							initialFocus
						/>
						<FormDescription>{t('version.api_key.expire_date_desc')}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
			<div className='flex justify-end border-none !pt-0'>
				<Button size='lg'>{t('general.save')}</Button>
			</div>
		</motion.div>
	);
}
