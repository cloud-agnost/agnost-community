import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/Form';
import { Input } from '@/components/Input';
import { CreateContainerParams } from '@/types/container';
import { IdentificationCard } from '@phosphor-icons/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ContainerFormTitle from './ContainerFormTitle';

export default function General() {
	const { t } = useTranslation();
	const form = useFormContext<CreateContainerParams>();
	return (
		<div className='space-y-6'>
			<ContainerFormTitle
				title={t('container.general.title')}
				description={t('container.general.description') ?? ''}
			>
				<IdentificationCard size={20} />
			</ContainerFormTitle>
			<div className='flex justify-center gap-4 pl-12'>
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
		</div>
	);
}
