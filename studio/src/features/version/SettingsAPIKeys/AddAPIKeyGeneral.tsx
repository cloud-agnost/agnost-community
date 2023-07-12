import {
	Form,
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
import { Button } from 'components/Button';
import * as z from 'zod';
import { translate } from '@/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Schema = z.object({
	name: z
		.string({
			required_error: translate('forms.required', {
				label: translate('general.name'),
			}),
		})
		.min(2, translate('forms.min2.error', { label: translate('general.name') }))
		.max(64, translate('forms.max64.error', { label: translate('general.name') }))
		.trim()
		.refine(
			(value) => value.trim().length > 0,
			translate('forms.required', {
				label: translate('general.name'),
			}),
		),
	realtime: z.boolean(),
	endpoint_access: z.enum(ENDPOINT_ACCESS_PROPERTIES),
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

export default function AddAPIKeyGeneral() {
	const { t } = useTranslation();
	const form = useForm<z.infer<typeof Schema>>({
		resolver: zodResolver(Schema),
	});
	async function onSubmit(data: z.infer<typeof Schema>) {
		console.log(data);
	}
	return (
		<Form {...form}>
			<motion.form
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className='p-6 flex flex-col divide-y [&>:first-child]:pt-0 [&>*]:py-6'
				onSubmit={form.handleSubmit(onSubmit)}
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
					name='name'
					render={() => (
						<FormItem className='space-y-6'>
							<FormLabel>{t('version.api_key.endpoint_access')}</FormLabel>
							<FormControl>
								<div className='flex gap-6 flex-col'>
									{ENDPOINT_ACCESS_PROPERTIES.map((item, index) => (
										<div className='flex gap-[10px] cursor-pointer' key={index}>
											<div className='w-[22px] h-[22px] rounded-full aspect-square bg-subtle border border-input-border'></div>
											<div className='text-sm font-sfCompact leading-6 font-normal'>
												<p className='text-default'>
													{t(`version.api_key.endpoint_access_${item.replace('-', '_')}`)}
												</p>
												<p className='text-subtle'>
													{t(`version.api_key.endpoint_access_${item.replace('-', '_')}_desc`)}
												</p>
											</div>
										</div>
									))}
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className='flex justify-end border-none !pt-0'>
					<Button size='lg'>{t('general.save')}</Button>
				</div>
			</motion.form>
		</Form>
	);
}
