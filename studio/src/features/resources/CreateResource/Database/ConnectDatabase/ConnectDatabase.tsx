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
import MongoConnectionFormat from './MongoConnectionFormat';
import ReadReplicas from './ReadReplicas';

export default function ConnectDatabase() {
	const [loading, setLoading] = useState(false);
	const [testLoading, setTestLoading] = useState(false);
	const { t } = useTranslation();
	const { notify } = useToast();
	const {
		testExistingResourceConnection,

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
		setTestLoading(true);
		testExistingResourceConnection({
			...form.getValues(),
			access: {
				...form.getValues().access,
				options: form.getValues().access.options?.filter((option) => option.key && option.value),
			},
			type: 'database',
			onSuccess: () => {
				setTestLoading(false);
				notify({
					title: t('general.success'),
					description: t('resources.database.test_success'),
					type: 'success',
				});
			},
			onError: ({ error, details }) => {
				setTestLoading(false);
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
			<form onSubmit={form.handleSubmit(onSubmit)} className='scroll'>
				<CreateResourceLayout
					title={t('resources.connect_existing')}
					control={form.control}
					actions={
						<Button
							variant='outline'
							loading={testLoading}
							onClick={testResourceConnection}
							type='button'
							size='lg'
							className='self-start'
						>
							{!testLoading && <TestConnection className='w-4 h-4 text-icon-default mr-2' />}
							{t('resources.database.test')}
						</Button>
					}
					instances={DATABASE_TYPES}
					loading={loading}
				>
					{form.watch('instance') === 'MongoDB' && <MongoConnectionFormat />}
					<DatabaseInfo modal={false} />
					<ConnectOptions />
					<ReadReplicas />

					{form.watch('instance') === 'SQL Server' && (
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
					)}
				</CreateResourceLayout>
			</form>
		</Form>
	);
}
