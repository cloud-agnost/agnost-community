import { Input } from '@/components/Input';
import { Textarea } from '@/components/Input/Textarea';
import { useToast } from '@/hooks';
import useResourceStore from '@/store/resources/resourceStore';
import { ConnectResourceSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from 'components/Form';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import CreateResourceLayout from '../CreateResourceLayout';

const ConnectGCPSchema = z.object({
	...ConnectResourceSchema.shape,
	access: z.object({
		projectId: z.string().nonempty(),
		keyFileContents: z.string().nonempty(),
	}),
});

export default function ConnectGCP() {
	const { notify } = useToast();
	const [loading, setLoading] = useState(false);
	const form = useForm<z.infer<typeof ConnectGCPSchema>>({
		resolver: zodResolver(ConnectGCPSchema),
	});
	const { t } = useTranslation();
	const { addExistingResource, toggleCreateResourceModal } = useResourceStore();

	function onSubmit(data: z.infer<typeof ConnectGCPSchema>) {
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

	useEffect(() => {
		form.setValue('instance', 'GCP Cloud Storage');
	}, [form]);
	console.log(form.formState.errors);
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<CreateResourceLayout title={t('resources.storage.gcp.title')} loading={loading}>
					<div className='space-y-6'>
						<FormField
							control={form.control}
							name='access.projectId'
							render={({ field }) => (
								<FormItem className='flex-1'>
									<FormLabel>{t('resources.storage.gcp.projectId')}</FormLabel>
									<FormControl>
										<Input
											error={Boolean(form.formState.errors.access?.projectId)}
											placeholder={
												t('forms.placeholder', {
													label: t('resources.storage.gcp.projectId'),
												}) ?? ''
											}
											{...field}
										/>
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='access.keyFileContents'
							render={({ field }) => (
								<FormItem className='flex-1'>
									<FormLabel>{t('resources.storage.gcp.keyFileContents')}</FormLabel>
									<FormControl>
										<Textarea
											showCount
											rows={5}
											maxLength={50}
											error={Boolean(form.formState.errors.access?.keyFileContents)}
											placeholder={
												t('forms.placeholder', {
													label: t('resources.storage.gcp.keyFileContents'),
												}) ?? ''
											}
											{...field}
										/>
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</CreateResourceLayout>
			</form>
		</Form>
	);
}
