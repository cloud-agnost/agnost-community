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
import { useToast } from '@/hooks';
import useApplicationStore from '@/store/app/applicationStore.ts';
import useOrganizationStore from '@/store/organization/organizationStore';
import { CreateApplicationSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import { Button } from '@/components/Button';

interface ApplicationCreateModalProps {
	closeModal: () => void;
	isOpen: boolean;
}

export default function ApplicationCreateModal({
	closeModal,
	isOpen,
	...props
}: ApplicationCreateModalProps) {
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
		<Dialog open={isOpen} {...props} onOpenChange={closeModal}>
			<DialogContent>
				<DialogTitle>{t('application.create')}</DialogTitle>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='organization-form'>
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
