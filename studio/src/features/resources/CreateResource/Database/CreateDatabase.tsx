import { Form } from '@/components/Form';
import { Input } from '@/components/Input';
import { Slider } from '@/components/Slider';
import { DATABASE_TYPES, MAX_DB_SIZE, MIN_DB_SIZE } from '@/constants';
import { AccessDbSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/Form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import CreateResourceItem from '../../CreateResourceItem';
import CreateResourceLayout from '../CreateResourceLayout';

const CreateDatabaseSchema = z.object({
	access: AccessDbSchema,
	storageSize: z.number().min(1).max(10),
	readReplica: z.number().min(0).max(10),
});
export default function CreateDatabase() {
	const form = useForm<z.infer<typeof CreateDatabaseSchema>>({
		resolver: zodResolver(CreateDatabaseSchema),
	});

	const { t } = useTranslation();

	const onSubmit = (data: z.infer<typeof CreateDatabaseSchema>) => {
		console.log(data);
	};
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='scroll'>
				<CreateResourceLayout
					control={form.control}
					title={t('resources.database.create')}
					instances={DATABASE_TYPES}
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
