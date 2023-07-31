import { Button } from '@/components/Button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/Form';
import { useToast } from '@/hooks';
import useResourceStore from '@/store/resources/resourceStore';
import { ConnectResourceSchema } from '@/types';
import { cn } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import CreateResourceItem from '../../CreateResourceItem';

import CreateResourceLayout from '../CreateResourceLayout';
import { Checkbox } from '@/components/Checkbox';
const CreateCacheSchema = z.object({
	...ConnectResourceSchema.shape,
	size: z.number().nonnegative().min(1).max(4),
	createReplica: z.boolean(),
});
export default function CreateCache() {
	const { t } = useTranslation();
	const { notify } = useToast();
	const { addResource, toggleCreateResourceModal } = useResourceStore();
	const [loading, setLoading] = useState(false);
	const form = useForm<z.infer<typeof CreateCacheSchema>>({
		resolver: zodResolver(CreateCacheSchema),
	});
	useEffect(() => {
		form.setValue('instance', 'AWS S3');
	}, [form]);

	function onSubmit(data: z.infer<typeof CreateCacheSchema>) {
		console.log(data);
		setLoading(true);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<CreateResourceLayout title={t('resources.cache.title')}>
					<CreateResourceItem title={t('resources.cache.cacheSize') as string} lastItem>
						<FormItem className='space-y-0 grid grid-cols-4 gap-4'>
							{[1, 2, 3, 4].map((size) => (
								<FormField
									key={size}
									control={form.control}
									name='size'
									render={({ field }) => {
										return (
											<FormItem key={size} className=''>
												<FormControl>
													<Button
														type='button'
														variant='blank'
														key={size}
														className={cn(
															'h-[104px] p-4 gap-2 border border-border w-full',
															field.value === size && 'border-button-primary',
														)}
														onClick={() => {
															console.log({ size });
															field.onChange(size);
															console.log(field.value);
														}}
													>
														<div
															className={cn(
																'w-12 h-12 p-3 rounded-full',
																field.value === size ? 'bg-brand-primary-darker' : 'bg-black',
															)}
														>
															<span className='text-default font-sfCompact text-sm whi'>
																{size}GB
															</span>
														</div>
													</Button>
												</FormControl>
											</FormItem>
										);
									}}
								/>
							))}
							<p className='text-error-default text-sm font-sfCompact'>
								{form.formState.errors.size?.message}
							</p>
						</FormItem>
					</CreateResourceItem>
					<FormField
						control={form.control}
						name='createReplica'
						render={({ field }) => (
							<FormItem className='flex  space-y-0 '>
								<FormControl>
									<Checkbox checked={field.value} onCheckedChange={field.onChange} />
								</FormControl>
								<div className='space-y-1 leading-none'>
									<FormLabel>{t('resources.cache.createdReadReplica')}</FormLabel>
								</div>
							</FormItem>
						)}
					/>
				</CreateResourceLayout>
			</form>
		</Form>
	);
}
