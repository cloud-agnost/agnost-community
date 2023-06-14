import { Button } from '@/components/Button';
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
import { Modal, ModalProps } from '@/components/Modal';
import useOrganizationStore from '@/store/organization/organizationStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { translate } from '@/utils';
const CreateOrganizationSchema = z.object({
	name: z
		.string({
			required_error: translate('forms.required', { label: translate('organization.name') }),
		})
		.min(2, {
			message: translate('forms.min2.error', { label: translate('organization.name') }),
		})
		.max(64, {
			message: translate('forms.max64.error', { label: translate('organization.name') }),
		})
		.regex(/^[a-zA-Z0-9 ]*$/, {
			message: translate('forms.alphanumeric', { label: translate('organization.name') }),
		}),
});

export default function OrganizationCreateModal({ closeModal, ...props }: ModalProps) {
	const form = useForm<z.infer<typeof CreateOrganizationSchema>>({
		resolver: zodResolver(CreateOrganizationSchema),
	});
	const { t } = useTranslation();
	const { createOrganization } = useOrganizationStore();
	const { loading } = useOrganizationStore();
	async function onSubmit(data: z.infer<typeof CreateOrganizationSchema>) {
		await createOrganization({
			name: data.name,
			onSuccess: () => {
				closeModal();
				form.reset();
			},
			onError: () => {
				form.reset();
			},
		});
	}

	function onModalClose() {
		closeModal();
		form.reset();
	}

	return (
		<Modal {...props} title={t('organization.create-new')} closeModal={onModalClose}>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='organization-form'>
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
					<div className='flex justify-end gap-4 mt-2'>
						<Button variant='text' type='button' size='lg' onClick={onModalClose}>
							{t('general.cancel')}
						</Button>
						<Button variant='primary' size='lg' loading={loading}>
							{t('general.ok')}
						</Button>
					</div>
				</form>
			</Form>
		</Modal>
	);
}
