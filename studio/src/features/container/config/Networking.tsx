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
import { ShareNetwork } from '@phosphor-icons/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ContainerFormTitle from './ContainerFormTitle';

export default function Networking() {
	const { t } = useTranslation();
	const form = useFormContext<CreateContainerParams>();

	return (
		<div className='space-y-6'>
			<ContainerFormTitle title={t('container.networking.title')}>
				<ShareNetwork size={20} />
			</ContainerFormTitle>
			<div className='space-y-6 pl-12'>
				<FormField
					control={form.control}
					name='networking.containerPort'
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('container.networking.container_port')}</FormLabel>
							<FormDescription>{t('container.networking.container_port_help')}</FormDescription>
							<FormControl>
								<Input
									className='w-1/3'
									error={Boolean(form.formState.errors.source?.repo)}
									placeholder={
										t('forms.placeholder', {
											label: t('container.networking.container_port'),
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
