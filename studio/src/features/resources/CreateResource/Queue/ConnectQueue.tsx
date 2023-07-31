import { RadioGroup, RadioGroupItem } from '@/components/RadioGroup';
import { QUEUE_TYPES, RABBITMQ_CONNECTION_TYPES } from '@/constants';
import { useToast } from '@/hooks';
import useResourceStore from '@/store/resources/resourceStore';
import { ConnectQueueSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/Form';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import CreateResourceLayout from '../CreateResourceLayout';
import ConnectKafka from './ConnectKafka';
import ConnectRabbitMqWithObject from './ConnectRabbitMqWithObject';
import ConnectRabbitMqWithURI from './ConnectRabbitMqWithURI';
export default function ConnectQueue() {
	const [loading, setLoading] = useState(false);
	const { t } = useTranslation();
	const { notify } = useToast();
	const { addExistingResource, toggleCreateResourceModal } = useResourceStore();

	const form = useForm<z.infer<typeof ConnectQueueSchema>>({
		resolver: zodResolver(ConnectQueueSchema),
	});

	function onSubmit(data: z.infer<typeof ConnectQueueSchema>) {
		setLoading(true);
		addExistingResource({
			...data,
			type: 'queue',
			onSuccess: () => {
				setLoading(false);
				toggleCreateResourceModal();
			},
			onError: ({ error, details }) => {
				setLoading(false);
				notify({
					title: error,
					description: details,
					type: 'error',
				});
			},
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='scroll'>
				<CreateResourceLayout
					title={t('resources.connect_existing')}
					control={form.control}
					loading={loading}
					instances={QUEUE_TYPES}
				>
					<>
						{form.watch('instance') === 'RabbitMQ' && (
							<FormField
								control={form.control}
								name='access.format'
								render={({ field }) => (
									<FormItem className='space-y-3'>
										<FormControl>
											<RadioGroup
												onValueChange={field.onChange}
												defaultValue={field.value}
												className='flex items-center gap-6 mb-8'
											>
												{RABBITMQ_CONNECTION_TYPES.map((type) => (
													<FormItem key={type} className='flex items-center space-x-3 space-y-0'>
														<FormControl>
															<RadioGroupItem value={type} />
														</FormControl>
														<FormLabel className='font-normal'>
															{t(`resources.queue.${type}`)}
														</FormLabel>
													</FormItem>
												))}
											</RadioGroup>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						{form.watch('instance') === 'Kafka' && <ConnectKafka />}
					</>

					{form.watch('access.format') === 'url' && form.watch('instance') === 'RabbitMQ' && (
						<ConnectRabbitMqWithURI />
					)}
					{form.watch('access.format') === 'object' && form.watch('instance') === 'RabbitMQ' && (
						<ConnectRabbitMqWithObject />
					)}
				</CreateResourceLayout>
			</form>
		</Form>
	);
}
