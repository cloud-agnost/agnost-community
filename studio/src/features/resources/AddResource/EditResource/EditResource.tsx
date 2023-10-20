import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { Form } from '@/components/Form';
import { Input } from '@/components/Input';
import { useToast } from '@/hooks';
import useResourceStore from '@/store/resources/resourceStore';
import { CreateResourceSchema, ResourceInstances } from '@/types';
import { isEmpty } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from 'components/Form';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';

type UpdateType = 'size' | 'others';

export default function EditResource() {
	const form = useForm<z.infer<typeof CreateResourceSchema>>({
		resolver: zodResolver(CreateResourceSchema),
	});
	const replicationType =
		form.watch('instance') === ResourceInstances.MongoDB ||
		form.watch('instance') === ResourceInstances.RabbitMQ
			? 'replicas'
			: 'instances';
	const {
		toggleCreateResourceModal,
		updateManagedResourceConfiguration,
		closeEditResourceModal,
		resourceToEdit,
	} = useResourceStore();

	const [loading, setLoading] = useState(false);
	const { notify } = useToast();
	const { t } = useTranslation();

	useEffect(() => {
		if (!isEmpty(resourceToEdit)) {
			form.reset({
				name: resourceToEdit.name,
				allowedRoles: resourceToEdit.allowedRoles,
				instance: resourceToEdit.instance,
				type: resourceToEdit.type,
				config: resourceToEdit.config,
			});
		}
	}, [resourceToEdit]);

	function handleUpdate(updateType: UpdateType) {
		form.trigger();
		if (!form.formState.isValid) return;
		setLoading(true);
		updateManagedResourceConfiguration({
			updateType,
			resourceId: resourceToEdit?._id,
			...form.getValues(),
			onSuccess: () => {
				form.reset();
				if (isEmpty(resourceToEdit)) toggleCreateResourceModal();
				else closeEditResourceModal();
				setLoading(false);
			},
			onError: (error) => {
				setLoading(false);
				notify({
					title: error?.error,
					description: error?.details,
					type: 'error',
				});
			},
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={(e) => e.preventDefault()} className='space-y-6'>
				<FormField
					control={form.control}
					name='config.size'
					render={({ field }) => (
						<FormItem className='flex-1'>
							<FormLabel>{t('resources.database.storage_size')}</FormLabel>
							<FormControl>
								<div className='flex items-center'>
									<Input
										placeholder={t('resources.database.storage_size_placeholder') ?? ''}
										error={!!form.formState.errors.config?.size}
										{...field}
									/>
									<Button
										className='ml-2'
										type='button'
										onClick={() => handleUpdate('size')}
										size='lg'
										loading={loading && field.value !== resourceToEdit?.config.size}
									>
										{t('general.save')}
									</Button>
								</div>
							</FormControl>
							<FormDescription>{t('resources.database.storage_size_description')}</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				{form.watch('type') !== 'cache' ? (
					<FormField
						control={form.control}
						name={`config.${replicationType}`}
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t(`resources.database.${replicationType}`)}</FormLabel>
								<FormControl className='flex'>
									<div className='flex items-center'>
										<Input
											type='number'
											placeholder={t('resources.database.instance_placeholder') ?? ''}
											error={!!form.formState.errors.config?.instances}
											{...field}
										/>
										<Button
											className='ml-2'
											type='button'
											onClick={() => handleUpdate('others')}
											size='lg'
											loading={loading && field.value !== resourceToEdit?.config[replicationType]}
										>
											{t('general.save')}
										</Button>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				) : (
					<FormField
						control={form.control}
						name='config.readReplica'
						render={({ field }) => (
							<FormItem className='flex space-y-0 space-x-4'>
								<FormControl>
									<Checkbox checked={field.value} onCheckedChange={field.onChange} />
								</FormControl>
								<div className='space-y-1 leading-none'>
									<FormLabel>{t('resources.cache.createdReadReplica')}</FormLabel>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}
			</form>
		</Form>
	);
}
