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
import { useEffect } from 'react';

export default function AddAPIKeyGeneral() {
	const { t } = useTranslation();
	const form = useFormContext<z.infer<typeof Schema>>();

	useEffect(() => {
		console.log(form.formState.errors);
		console.log(form.getValues());
	}, [form.formState.errors]);

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
					<FormItem className='space-y-6'>
						<FormLabel>{t('version.api_key.endpoint_access')}</FormLabel>
						<FormControl>
							<div className='flex gap-6 flex-col'>
								{ENDPOINT_ACCESS_PROPERTIES.map((item, index) => (
									<label htmlFor={item} className='flex gap-[10px] cursor-pointer' key={index}>
										<input
											type='radio'
											className='hidden [&:checked+*]:bg-white'
											id={item}
											onChange={field.onChange}
											name={field.name}
											value={item}
										/>
										<div className='w-[22px] h-[22px] rounded-full aspect-square border border-input-border' />
										<div className='text-sm font-sfCompact leading-6 font-normal'>
											<p className='text-default'>
												{t(`version.api_key.endpoint_access_${item.replace('-', '_')}`)}
											</p>
											<p className='text-subtle'>
												{t(`version.api_key.endpoint_access_${item.replace('-', '_')}_desc`)}
											</p>
										</div>
									</label>
								))}
							</div>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</motion.div>
	);
}
