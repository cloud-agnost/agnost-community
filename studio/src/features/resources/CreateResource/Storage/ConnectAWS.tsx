import { Input } from '@/components/Input';
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
const ConnectAWSSchema = z.object({
	...ConnectResourceSchema.shape,
	access: z.object({
		accessKeyId: z.string().nonempty(),
		secretAccessKey: z.string().nonempty(),
		region: z.string().nonempty(),
	}),
});
export default function ConnectAWS() {
	const { notify } = useToast();
	const [loading, setLoading] = useState(false);
	const form = useForm<z.infer<typeof ConnectAWSSchema>>({
		resolver: zodResolver(ConnectAWSSchema),
	});

	const { t } = useTranslation();
	const { addExistingResource, toggleCreateResourceModal } = useResourceStore();

	useEffect(() => {
		form.setValue('instance', 'AWS S3');
	}, [form]);
	console.log(form.formState.errors);
	function onSubmit(data: z.infer<typeof ConnectAWSSchema>) {
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
				<CreateResourceLayout title={t('resources.storage.aws.title')} loading={loading}>
					<div className='grid grid-cols-2 grid-rows-2 gap-6'>
						<FormField
							control={form.control}
							name='access.accessKeyId'
							render={({ field }) => (
								<FormItem className='flex-1'>
									<FormLabel>{t('resources.storage.aws.accessKeyId')}</FormLabel>
									<FormControl>
										<Input
											error={Boolean(form.formState.errors.access?.accessKeyId)}
											placeholder={
												t('forms.placeholder', {
													label: t('resources.storage.aws.accessKeyId'),
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
							name='access.secretAccessKey'
							render={({ field }) => (
								<FormItem className='flex-1'>
									<FormLabel>{t('resources.storage.aws.secret')}</FormLabel>
									<FormControl>
										<Input
											error={Boolean(form.formState.errors.access?.secretAccessKey)}
											placeholder={
												t('forms.placeholder', {
													label: t('resources.storage.aws.secret'),
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
							name='access.region'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('resources.storage.aws.region')}</FormLabel>
									<FormControl>
										<Input
											error={Boolean(form.formState.errors.access?.region)}
											placeholder={
												t('forms.placeholder', {
													label: t('resources.storage.aws.region'),
												}) ?? ''
											}
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
					</div>
				</CreateResourceLayout>
			</form>
		</Form>
	);
}
