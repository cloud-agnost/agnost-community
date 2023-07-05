import useOrganizationStore from '@/store/organization/organizationStore';
import { APIError } from '@/types';
import { translate } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, AlertDescription, AlertTitle } from 'components/Alert';
import { Button } from 'components/Button';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormMessage,
} from 'components/Form';
import { Input } from 'components/Input';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';

const FormSchema = z.object({
	name: z
		.string({
			required_error: translate('forms.required', {
				label: translate('general.name'),
			}),
		})
		.min(2, translate('forms.min2.error', { label: translate('general.name') }))
		.max(64, translate('forms.max64.error', { label: translate('general.name') }))
		.trim()
		.refine(
			(value) => value.trim().length > 0,
			translate('forms.required', {
				label: translate('general.name'),
			}),
		),
});

export default function ChangeOrganizationName() {
	const [error, setError] = useState<APIError | null>(null);
	const [loading, setLoading] = useState(false);
	const { organization, changeOrganizationName } = useOrganizationStore();
	const { t } = useTranslation();

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			name: organization?.name,
		},
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		if (organization?.name === data.name) return;
		else {
			setLoading(true);
			changeOrganizationName({
				name: data.name,
				organizationId: organization?._id as string,
				onSuccess: () => {
					setLoading(false);
				},
				onError: (error) => {
					setError(error);
					setLoading(false);
				},
			});
		}
	}

	return (
		<div className='space-y-4'>
			{error && (
				<Alert variant='error'>
					<AlertTitle>{error.error}</AlertTitle>
					<AlertDescription>{error.details}</AlertDescription>
				</Alert>
			)}

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<FormField
						control={form.control}
						name='name'
						render={({ field }) => (
							<FormItem>
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
					<div className='mt-4'>
						<Button loading={loading} size='lg'>
							{t('general.save')}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
