import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import useClusterStore from '@/store/cluster/clusterStore';
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Form,
} from '@/components/Form';
import { Input } from '@/components/Input';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks';
import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';

const Schema = z.object({
	hpaName: z.string({ required_error: 'Name is required' }),
	replicas: z.coerce.number().int().positive(),
	minReplicas: z.coerce.number().int().positive(),
	maxReplicas: z.coerce.number().int().positive(),
});

export default function EditClusterComponent() {
	const { t } = useTranslation();
	const { notify } = useToast();
	const [loading, setLoading] = useState(false);

	const {
		isEditClusterComponentOpen,
		clusterComponent,
		closeEditClusterComponent,
		updateClusterComponent,
	} = useClusterStore();

	const form = useForm<z.infer<typeof Schema>>({
		resolver: zodResolver(Schema),
		defaultValues: {
			hpaName: clusterComponent?.hpaName,
			replicas: clusterComponent?.info?.configuredReplicas,
			minReplicas: clusterComponent?.info?.minReplicas,
			maxReplicas: clusterComponent?.info?.maxReplicas,
		},
	});

	function onSubmit(data: z.infer<typeof Schema>) {
		setLoading(true);
		updateClusterComponent({
			deploymentName: clusterComponent?.deploymentName,
			...data,
			onSuccess: () => {
				setLoading(false);
				closeDrawer();
			},
			onError: (error) => notify({ title: error.error, type: 'error', description: error.details }),
		});
	}

	function closeDrawer() {
		form.reset();
		closeEditClusterComponent();
	}

	useEffect(() => {
		if (isEditClusterComponentOpen && clusterComponent) {
			form.reset({
				hpaName: clusterComponent?.hpaName,
				replicas: clusterComponent?.info?.configuredReplicas,
				minReplicas: clusterComponent?.info?.minReplicas,
				maxReplicas: clusterComponent?.info?.maxReplicas,
			});
		}
	}, [isEditClusterComponentOpen]);

	return (
		<Drawer open={isEditClusterComponentOpen} onOpenChange={closeDrawer}>
			<DrawerContent position='right' size='lg' className='h-full'>
				<DrawerHeader>
					<DrawerTitle>{t('cluster.editClusterComponent')}</DrawerTitle>
				</DrawerHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='p-6  space-y-8 flex flex-col'>
						<FormField
							control={form.control}
							name='hpaName'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('cluster.hpaName')}</FormLabel>
									<FormControl>
										<Input
											error={!!form.formState.errors.hpaName}
											placeholder={t('forms.placeholder', {
												label: t('cluster.hpaName'),
											}).toString()}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='replicas'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('cluster.replicas')}</FormLabel>

									<FormControl>
										<Input
											error={!!form.formState.errors.replicas}
											placeholder={t('forms.placeholder', {
												label: t('cluster.replicas'),
											}).toString()}
											{...field}
										/>
									</FormControl>
									<FormDescription>{t('cluster.replicasDescription')}</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className='flex space-x-4'>
							<FormField
								control={form.control}
								name='minReplicas'
								render={({ field }) => (
									<FormItem className='flex-1'>
										<FormLabel>{t('cluster.minReplicas')}</FormLabel>
										<FormControl>
											<Input
												error={!!form.formState.errors.hpaName}
												placeholder={t('forms.placeholder', {
													label: t('cluster.minReplicas'),
												}).toString()}
												{...field}
											/>
										</FormControl>
										<FormDescription>{t('cluster.minReplicasDescription')}</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='maxReplicas'
								render={({ field }) => (
									<FormItem className='flex-1'>
										<FormLabel>{t('cluster.maxReplicas')}</FormLabel>
										<FormControl>
											<Input
												error={!!form.formState.errors.hpaName}
												placeholder={t('forms.placeholder', {
													label: t('cluster.maxReplicas'),
												}).toString()}
												{...field}
											/>
										</FormControl>
										<FormDescription>{t('cluster.maxReplicasDescription')}</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<Button type='submit' loading={loading} size='lg' className='self-end'>
							{t('general.save')}
						</Button>
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
