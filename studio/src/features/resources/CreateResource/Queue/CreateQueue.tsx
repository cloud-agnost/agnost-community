import { Input } from '@/components/Input';
import { Slider } from '@/components/Slider';
import { MAX_DB_SIZE, MIN_DB_SIZE, QUEUE_TYPES } from '@/constants';
import { ConnectResourceSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/Form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import CreateResourceItem from '../../CreateResourceItem';
import CreateResourceLayout from '../CreateResourceLayout';

const CreateQueueSchema = z.object({
	...ConnectResourceSchema.shape,
	readReplica: z.string().optional(),
	storageSize: z.number().optional(),
});

export default function CreateQueue() {
	const { t } = useTranslation();

	const form = useForm<z.infer<typeof CreateQueueSchema>>({
		resolver: zodResolver(CreateQueueSchema),
	});

	function onSubmit(data: z.infer<typeof CreateQueueSchema>) {
		console.log(data);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='scroll'>
				<CreateResourceLayout
					title={t('resources.connect_existing')}
					control={form.control}
					instances={QUEUE_TYPES}
				>
					<FormField
						control={form.control}
						name='storageSize'
						render={({ field }) => (
							<CreateResourceItem
								title={
									t('resources.database.storage_size', {
										size: field.value,
									}) as string
								}
							>
								<FormItem className='flex-1'>
									<FormLabel>
										<div className='flex items-center justify-between'>
											<p className=' font-sfCompact text-sm text-default'>
												{t('general.gb', {
													size: MIN_DB_SIZE,
												})}
											</p>
											<p className=' font-sfCompact text-sm text-default'>
												{t('general.gb', {
													size: MAX_DB_SIZE,
												})}
											</p>
										</div>
									</FormLabel>
									<FormControl>
										<Slider
											step={1}
											min={MIN_DB_SIZE}
											max={MAX_DB_SIZE}
											defaultValue={[30]}
											onValueChange={(val) => field.onChange(val[0])}
										/>
									</FormControl>

									<FormMessage />
								</FormItem>
							</CreateResourceItem>
						)}
					/>
					<FormField
						control={form.control}
						name='readReplica'
						render={() => (
							<FormItem>
								<FormControl>
									<CreateResourceItem
										title={t('resources.database.read_replicas') as string}
										lastItem
									>
										<Input className='w-1/2 bg-transparent' />
									</CreateResourceItem>
								</FormControl>
							</FormItem>
						)}
					/>
				</CreateResourceLayout>
			</form>
		</Form>
	);
}
