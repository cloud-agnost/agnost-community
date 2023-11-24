import { APIError } from '@/types';
import { translate } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, AlertDescription, AlertTitle } from 'components/Alert';
import { Button } from '@/components/Button';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormMessage,
	FormLabel,
} from 'components/Form';
import { Input } from 'components/Input';
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

interface ChangeNameFormProps {
	onFormSubmit: (data: any) => void;
	error: APIError | null;
	loading: boolean;
	defaultValue: string;
	label?: string;
	disabled?: boolean;
}

export default function ChangeNameForm({
	onFormSubmit,
	error,
	loading,
	defaultValue,
	label,
	disabled,
}: ChangeNameFormProps) {
	const { t } = useTranslation();

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			name: defaultValue,
		},
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		onFormSubmit(data);
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
								{label && <FormLabel>{label}</FormLabel>}
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
						<Button loading={loading} size='lg' disabled={disabled}>
							{t('general.save')}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
