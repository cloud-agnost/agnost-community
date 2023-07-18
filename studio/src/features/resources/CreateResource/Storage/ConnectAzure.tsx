import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/Form';
import { Input } from '@/components/Input';
import { useToast } from '@/hooks';
import useResourceStore from '@/store/resources/resourceStore';
import { ConnectResourceSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import CreateResourceLayout from '../CreateResourceLayout';
const ConnectAzureSchema = z.object({
	...ConnectResourceSchema.shape,
	access: z.object({
		connectionString: z.string().nonempty(),
	}),
});

export default function ConnectAzure() {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const { notify } = useToast();
	const form = useForm<z.infer<typeof ConnectAzureSchema>>({
		resolver: zodResolver(ConnectAzureSchema),
	});

	const { addExistingResource, toggleCreateResourceModal } = useResourceStore();

	useEffect(() => {
		form.setValue('instance', 'Azure Blob Storage');
	}, [form]);

	function onSubmit(data: z.infer<typeof ConnectAzureSchema>) {
		setLoading(true);
		addExistingResource({
			type: 'storage',
			...data,
			onSuccess: () => {
				setLoading(false);
				toggleCreateResourceModal();
			},
			onError: ({ error, details }) => {
				setLoading(false);
				notify({
					title: error,
					description: details,
					type: 'error',
				});
			},
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<CreateResourceLayout title={t('resources.storage.azure.title')} loading={loading}>
					<FormField
						control={form.control}
						name='access.connectionString'
						render={({ field }) => (
							<FormItem className='flex-1'>
								<FormLabel>{t('resources.storage.azure.connectionString')}</FormLabel>
								<FormControl>
									<Input
										error={Boolean(form.formState.errors.access?.connectionString)}
										placeholder={
											t('forms.placeholder', {
												label: t('resources.storage.azure.connectionString'),
											}) ?? ''
										}
										{...field}
									/>
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>
				</CreateResourceLayout>
			</form>
		</Form>
	);
}
