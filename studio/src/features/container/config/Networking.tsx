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
import ContainerFormTitle from './ContainerFormLayout';

export default function Networking() {
	const { t } = useTranslation();
	const form = useFormContext<CreateContainerParams>();

	return (
		<ContainerFormTitle title={t('container.networking.title')} icon={<ShareNetwork size={20} />}>
			<FormField
				control={form.control}
				name='networking.containerPort'
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t('container.networking.container_port')}</FormLabel>

						<FormControl>
							<Input
								className='w-1/3'
								type='number'
								error={Boolean(form.formState.errors.networking?.containerPort)}
								placeholder={
									t('forms.placeholder', {
										label: t('container.networking.container_port'),
									}) ?? ''
								}
								{...field}
							/>
						</FormControl>
						<FormDescription>{t('container.networking.container_port_help')}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</ContainerFormTitle>
	);
}
