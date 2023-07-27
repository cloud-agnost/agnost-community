import { Button } from '@/components/Button';
import { Switch } from '@/components/Switch';
import { TestConnection } from '@/components/icons';
import { DATABASE_TYPES } from '@/constants';
import { useToast } from '@/hooks';
import useResourceStore from '@/store/resources/resourceStore';
import { ConnectDatabaseSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from 'components/Form';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import CreateResourceLayout from '../../CreateResourceLayout';
import ConnectOptions from './ConnectOptions';
import DatabaseInfo from './DatabaseInfo';
import ReadReplicas from './ReadReplicas';

export default function ConnectDatabase() {
	const [loading, setLoading] = useState(false);
	const { t } = useTranslation();
	const { notify } = useToast();
	const {
		testExistingResourceConnection,
		returnToPreviousStep,
		addExistingResource,
		toggleCreateResourceModal,
	} = useResourceStore();
	const form = useForm<z.infer<typeof ConnectDatabaseSchema>>({
		resolver: zodResolver(ConnectDatabaseSchema),
	});
	function onSubmit(data: z.infer<typeof ConnectDatabaseSchema>) {
		addExistingResource({
			...data,
			access: {
				...data.access,
				options: data.access.options?.filter((option) => option.key && option.value),
			},
			type: 'database',
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

	function testResourceConnection() {
		setLoading(true);
		testExistingResourceConnection({
			...form.getValues(),
			access: {
				...form.getValues().access,
				options: form.getValues().access.options?.filter((option) => option.key && option.value),
			},
			type: 'database',
			onSuccess: () => {
				setLoading(false);
				notify({
					title: t('general.success'),
					description: t('resources.database.test_success'),
					type: 'success',
				});
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
			<form onSubmit={form.handleSubmit(onSubmit)} className='max-h-[90%] overflow-auto'>
				<CreateResourceLayout
					title={t('resources.connect_existing')}
					control={form.control}
					actions={
						<div className='flex gap-4'>
							<Button
								variant='outline'
								loading={loading}
								onClick={testResourceConnection}
								type='button'
								size='lg'
							>
								<TestConnection className='w-4 h-4 text-icon-default mr-2' />
								{t('resources.database.test')}
							</Button>
							<Button variant='secondary' onClick={returnToPreviousStep} type='button' size='lg'>
								{t('general.previous')}
							</Button>
							<Button variant='primary' loading={loading} type='submit' size='lg'>
								{t('resources.database.connect')}
							</Button>
						</div>
					}
					instances={DATABASE_TYPES}
				>
					<DatabaseInfo modal={false} control={form.control} errors={form.formState.errors} />
					<ConnectOptions />
					<ReadReplicas />

					<FormField
						control={form.control}
						name='secureConnection'
						render={({ field }) => (
							<FormItem className='flex justify-start gap-4 items-center space-y-0'>
								<FormLabel>{t('resources.database.secure_connection')}</FormLabel>
								<FormControl>
									<Switch checked={field.value} onCheckedChange={field.onChange} />
								</FormControl>
							</FormItem>
						)}
					/>
				</CreateResourceLayout>
			</form>
		</Form>
	);
}
