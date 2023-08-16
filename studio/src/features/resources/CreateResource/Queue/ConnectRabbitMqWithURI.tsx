import { Input } from '@/components/Input';
import { FormField, FormItem, FormLabel, FormMessage } from 'components/Form';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ConnectQueueSchema } from '@/types';
import * as z from 'zod';

export default function ConnectRabbitMqWithURI() {
	const { t } = useTranslation();
	const form = useFormContext<z.infer<typeof ConnectQueueSchema>>();

	return (
		<div className='flex flex-col gap-2'>
			<FormField
				control={form.control}
				name='access.url'
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t('resources.queue.url')}</FormLabel>
						<Input
							placeholder={
								t('forms.placeholder', {
									label: t('resources.queue.url'),
								}) as string
							}
							{...field}
						/>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	);
}
