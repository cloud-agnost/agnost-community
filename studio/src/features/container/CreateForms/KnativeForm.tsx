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
import {
	KNativeConfig,
	Networking,
	PodConfiguration,
	Probes,
	SourceConfig,
	StorageConfig,
} from '../config';
import ContainerFormTitle from '../config/ContainerFormLayout';

export default function KnativeForm() {
	const { t } = useTranslation();
	const form = useFormContext<CreateContainerParams>();
	return (
		<>
			<ContainerFormTitle
				title={t('container.general')}
				descriptionI18nKey='container.knative.description'
				icon={<IdentificationCard size={20} />}
			>
				<FormField
					control={form.control}
					name='name'
					render={({ field }) => (
						<FormItem className='flex-1'>
							<FormLabel>{t('container.knative.name')}</FormLabel>
							<FormControl>
								<Input
									error={Boolean(form.formState.errors.name)}
									placeholder={
										t('forms.placeholder', {
											label: t('container.knative.name'),
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
			</ContainerFormTitle>

			<SourceConfig />
			<Networking />
			<PodConfiguration />
			<KNativeConfig />
			<Probes />
			<StorageConfig />
		</>
	);
}
