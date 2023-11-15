import { Button } from '@/components/Button';
import { Dialog, DialogContent, DialogTitle } from '@/components/Dialog';
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
import useOrganizationStore from '@/store/organization/organizationStore';
import { CreateOrganizationSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
interface OrganizationCreateModalProps {
	closeModal: () => void;
	isOpen: boolean;
}
export default function OrganizationCreateModal({
	closeModal,
	isOpen,
	...props
}: OrganizationCreateModalProps) {
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
		<Dialog open={isOpen} {...props} onOpenChange={closeModal}>
			<DialogContent>
				<DialogTitle>{t('organization.create-new')}</DialogTitle>
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
							<Button variant='text' type='button' size='lg' onClick={closeModal}>
								{t('general.cancel')}
							</Button>
							<Button variant='primary' size='lg' loading={loading}>
								{t('general.ok')}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}