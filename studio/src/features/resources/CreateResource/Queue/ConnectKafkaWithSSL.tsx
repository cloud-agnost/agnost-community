import { Textarea } from '@/components/Input/Textarea';
import { Switch } from '@/components/Switch';
import { ConnectQueueSchema } from '@/types';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/Form';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import CreateResourceItem from '../../CreateResourceItem';

export default function ConnectKafkaWithSSL() {
	const { t } = useTranslation();
	const form = useFormContext<z.infer<typeof ConnectQueueSchema>>();
	return (
		<CreateResourceItem title={t('resources.queue.ssl')}>
			<div className='space-y-8'>
				<FormField
					control={form.control}
					name='access.ssl.rejectUnauthorized'
					render={({ field }) => (
						<FormItem className='flex justify-start gap-4 items-center space-y-0'>
							<FormLabel>{t('resources.queue.rejectUnauthorized')}</FormLabel>
							<FormControl>
								<Switch checked={field.value} onCheckedChange={field.onChange} />
							</FormControl>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='access.ssl.ca'
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('resources.queue.ca')}</FormLabel>
							<FormControl>
								<Textarea
									rows={5}
									{...field}
									placeholder={
										t('forms.placeholder', {
											label: t('resources.queue.certificateAuthority'),
										}) ?? ''
									}
									className='input'
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='access.ssl.key'
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('resources.queue.publicKey')}</FormLabel>
							<FormControl>
								<Textarea
									rows={5}
									{...field}
									placeholder={
										t('forms.placeholder', {
											label: t('resources.queue.publicKey'),
										}) ?? ''
									}
									className='input'
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</CreateResourceItem>
	);
}
