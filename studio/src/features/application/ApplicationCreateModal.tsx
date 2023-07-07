import CreateModal from '@/components/CreateModal/CreateModal';
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/Form';
import { Input } from '@/components/Input';
import { ModalProps } from '@/components/Modal';
import { useToast } from '@/hooks';
import useOrganizationStore from '@/store/organization/organizationStore';
import { CreateApplicationSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import useApplicationStore from '@/store/app/applicationStore.ts';

export default function ApplicationCreateModal({ closeModal, ...props }: ModalProps) {
	const { notify } = useToast();
	const form = useForm<z.infer<typeof CreateApplicationSchema>>({
		resolver: zodResolver(CreateApplicationSchema),
	});
	const { t } = useTranslation();
	const { organization } = useOrganizationStore();
	const { createApplication } = useApplicationStore();
	const { loading } = useOrganizationStore();

	function handleCloseModal() {
		closeModal();
		form.reset();
	}
	async function onSubmit(data: z.infer<typeof CreateApplicationSchema>) {
		await createApplication({
			name: data.name,
			orgId: organization?._id as string,
			onSuccess: () => {
				handleCloseModal();
			},
			onError: (error) => {
				notify({
					title: error.error,
					description: error.details,
					type: 'error',
				});
				handleCloseModal();
			},
		});
	}

	return (
		<CreateModal
			title={t('application.create-new')}
			form={form}
			onSubmitAction={(data) => onSubmit(data)}
			loading={loading}
			schema={CreateApplicationSchema}
			closeModal={handleCloseModal}
			{...props}
		>
			<FormField
				control={form.control}
				name='name'
				render={({ field }) => (
					<FormItem className='application-form-item'>
						<FormLabel>{t('application.name')}</FormLabel>
						<FormControl>
							<Input
								error={Boolean(form.formState.errors.name)}
								placeholder={t('forms.placeholder', {
									label: t('application.name'),
								}).toString()}
								{...field}
							/>
						</FormControl>
						<FormDescription>{t('forms.max64.description')}</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</CreateModal>
	);
}
