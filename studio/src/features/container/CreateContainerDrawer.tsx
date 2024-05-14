import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/Form';
import { Input } from '@/components/Input';
import useContainerStore from '@/store/container/containerStore';
import { ContainerSchema, CreateContainerParams } from '@/types/container';
import { zodResolver } from '@hookform/resolvers/zod';
import { IdentificationCard } from '@phosphor-icons/react';
import { startCase } from 'lodash';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ContainerFormTitle from './config/ContainerFormTitle';
import Networking from './config/Networking';
import SourceForm from './config/SourceForm';
import PodConfiguration from './config/PodConfiguration';
import AutoScaleConfig from './config/AutoScaleConfig';
export default function CreateContainerDrawer() {
	const { t } = useTranslation();
	const { closeCreateContainerDialog, isCreateContainerDialogOpen, createdContainerType } =
		useContainerStore();

	const form = useForm<CreateContainerParams>({
		resolver: zodResolver(ContainerSchema),
		defaultValues: {
			type: createdContainerType!,
			sourceOrRegistry: 'source',
			source: {
				repoType: 'github',
			},
			podConfig: {
				cpuLimit: 1,
				cpuLimitType: 'millicores',
				cpuRequest: 100,
				cpuRequestType: 'millicores',
				memoryLimit: 1,
				memoryLimitType: 'gibibyte',
				memoryRequest: 128,
				memoryRequestType: 'mebibyte',
				restartPolicy: 'Always',
			},
			deploymentConfig: {
				desiredReplicas: 1,
				cpuMetric: {
					enabled: true,
					metricValue: 80,
					metricType: 'AverageUtilization',
				},
				memoryMetric: {
					enabled: true,
					metricValue: 100,
					metricType: 'AverageValueMillicores',
				},
			},
		},
	});

	const onSubmit = (data: CreateContainerParams) => {
		console.log(data);
	};

	function onClose() {
		closeCreateContainerDialog();
		form.reset();
	}

	useEffect(() => {
		if (isCreateContainerDialogOpen) {
			form.setValue('type', createdContainerType!);
		}
	}, [createdContainerType, isCreateContainerDialogOpen]);
	console.log(form.watch());
	return (
		<Drawer open={isCreateContainerDialogOpen} onOpenChange={onClose}>
			<DrawerContent position='right' size='lg' className='h-full'>
				<DrawerHeader>
					<DrawerTitle>
						{t('container.create', {
							type: startCase(createdContainerType!),
						})}
					</DrawerTitle>
				</DrawerHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='p-6 scroll space-y-6'>
						<ContainerFormTitle
							title={t('container.general.title')}
							description={t('container.general.description') ?? ''}
						>
							<IdentificationCard size={20} />
						</ContainerFormTitle>
						<div className='flex  justify-center gap-4'>
							<FormField
								control={form.control}
								name='name'
								render={({ field }) => (
									<FormItem className='flex-1'>
										<FormLabel>{t('general.name')}</FormLabel>
										<FormControl>
											<Input
												error={Boolean(form.formState.errors.name)}
												placeholder={
													t('forms.placeholder', {
														label: t('general.name'),
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
								name='deploymentConfig.desiredReplicas'
								render={({ field }) => (
									<FormItem className='flex-1'>
										<FormLabel>{t('container.deployment.replicas')}</FormLabel>
										<FormControl>
											<Input
												error={Boolean(form.formState.errors.name)}
												type='number'
												placeholder={
													t('forms.placeholder', {
														label: t('container.deployment.replicas'),
													}) ?? ''
												}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{form.watch('sourceOrRegistry') === 'source' && <SourceForm />}
						<Networking />
						<PodConfiguration />
						<AutoScaleConfig />
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
