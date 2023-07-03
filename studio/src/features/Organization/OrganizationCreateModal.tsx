import { Button } from '@/components/Button';
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
import useOrganizationStore from '@/store/organization/organizationStore';
import {} from '@/types';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CreateOrganizationSchema } from '@/types';

export default function OrganizationCreateModal({ closeModal, ...props }: ModalProps) {
	const form = useForm<z.infer<typeof CreateOrganizationSchema>>({
		resolver: zodResolver(CreateOrganizationSchema),
	});
	const { t } = useTranslation();
	const { createOrganization } = useOrganizationStore();
	const { loading } = useOrganizationStore();

	function handleCloseModal() {
		closeModal();
		form.reset();
	}
	async function onSubmit(data: z.infer<typeof CreateOrganizationSchema>) {
		await createOrganization({
			name: data.name,
			onSuccess: () => {
				handleCloseModal();
			},
			onError: () => {
				handleCloseModal();
			},
		});
	}

	return (
		<CreateModal
			title={t('organization.create-new')}
			form={form}
			onSubmitAction={(data) => onSubmit(data)}
			loading={loading}
			schema={CreateOrganizationSchema}
			closeModal={handleCloseModal}
			{...props}
		>
			<FormField
				control={form.control}
				name='name'
				render={({ field }) => (
					<FormItem className='organization-form-item'>
						<FormLabel>{t('organization.name')}</FormLabel>
						<FormControl>
							<Input
								error={Boolean(form.formState.errors.name)}
								placeholder={t('forms.placeholder', {
									label: t('organization.name'),
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
