import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { Form } from '@/components/Form';
import { Input } from '@/components/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import useResourceStore from '@/store/resources/resourceStore';
import { APIError, CreateResourceSchema, ResourceInstances, ResourceType } from '@/types';
import { isEmpty } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/Form';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks';
import useTypeStore from '@/store/types/typeStore';

export default function EditVersionAndReplica() {
	const {
		toggleCreateResourceModal,
		updateManagedResourceConfiguration,
		closeEditResourceModal,
		resourceToEdit,
	} = useResourceStore();
	const { notify } = useToast();
	const { t } = useTranslation();
	const { resourceVersions } = useTypeStore();

	const form = useForm<z.infer<typeof CreateResourceSchema>>({
		resolver: zodResolver(CreateResourceSchema),
		defaultValues: {
			name: resourceToEdit.name,
			allowedRoles: resourceToEdit.allowedRoles,
			instance: resourceToEdit.instance,
			type: resourceToEdit.type,
			config: resourceToEdit.config,
		},
	});

	const replicationType =
		form.watch('instance') === ResourceInstances.MongoDB ||
		form.watch('instance') === ResourceInstances.RabbitMQ
			? 'replicas'
			: 'instances';
	function onSuccess() {
		form.reset();
		if (isEmpty(resourceToEdit)) toggleCreateResourceModal();
		else closeEditResourceModal();
	}
	function onError(error: APIError) {
		notify({
			title: error?.error,
			description: error?.details,
			type: 'error',
		});
	}
	const { mutateAsync: updateResourceMutate, isPending } = useMutation({
		mutationFn: updateManagedResourceConfiguration,
		onSuccess,
		onError,
	});

	function onSubmit(data: z.infer<typeof CreateResourceSchema>) {
		updateResourceMutate({
			updateType: 'others',
			resourceId: resourceToEdit?._id,
			...data,
		});
	}

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
	}, [resourceToEdit, replicationType]);
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 '>
				<FormField
					control={form.control}
					name={`config.${replicationType}`}
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t(`resources.database.${replicationType}`)}</FormLabel>
							<FormControl className='flex'>
								<Input
									type='number'
									disabled={form.watch('instance') === ResourceInstances.RabbitMQ}
									placeholder={t('resources.database.instance_placeholder') ?? ''}
									error={!!form.formState.errors.config?.instances}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='config.version'
					render={({ field }) => (
						<FormItem className='flex-1'>
							<FormLabel>{t('resources.version')}</FormLabel>
							<FormControl>
								<FormControl>
									<Select
										defaultValue={field.value}
										value={field.value}
										name={field.name}
										onValueChange={field.onChange}
									>
										<FormControl>
											<SelectTrigger
												className='w-full'
												error={Boolean(form.formState.errors.config?.version)}
											>
												<SelectValue placeholder={t('resources.select_version')} />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{resourceVersions[form.watch('instance')]?.map((version) => (
												<SelectItem key={version} value={version} className='max-w-full'>
													{version}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</FormControl>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				{form.watch('type') === ResourceType.Cache && (
					<FormField
						control={form.control}
						name='config.readReplica'
						disabled
						render={({ field }) => (
							<FormItem className='flex space-y-0 space-x-4'>
								<FormControl>
									<Checkbox checked={field.value} onCheckedChange={field.onChange} disabled />
								</FormControl>
								<div className='space-y-1 leading-none'>
									<FormLabel>{t('resources.cache.createdReadReplica')}</FormLabel>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}
				<div className='flex justify-end'>
					<Button className='ml-2' size='lg' loading={isPending}>
						{t('general.save')}
					</Button>
				</div>
			</form>
		</Form>
	);
}
