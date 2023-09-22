import { useToast } from '@/hooks';
import useResourceStore from '@/store/resources/resourceStore';
import { ConnectDatabaseSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'components/Form';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import CreateResourceLayout from '../CreateResourceLayout';
import ConnectOptions from '../Database/ConnectDatabase/ConnectOptions';
import DatabaseInfo from '../Database/ConnectDatabase/DatabaseInfo';
import ReadReplicas from '../Database/ConnectDatabase/ReadReplicas';

export default function ConnectCache() {
	const form = useForm<z.infer<typeof ConnectDatabaseSchema>>({
		resolver: zodResolver(ConnectDatabaseSchema),
	});

	const [loading, setLoading] = useState(false);
	const { t } = useTranslation();
	const { notify } = useToast();
	const { addExistingResource, toggleCreateResourceModal } = useResourceStore();

	useEffect(() => {
		form.setValue('instance', 'Redis');
		form.setValue('access.username', 'root');
	}, [form]);

	function onSubmit(data: z.infer<typeof ConnectDatabaseSchema>) {
		addExistingResource({
			...data,
			access: {
				...data.access,
				options: data.access.options?.filter((option) => option.key && option.value),
			},
			type: 'cache',
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
			<form onSubmit={form.handleSubmit(onSubmit)} className='scroll'>
				<CreateResourceLayout
					title={t('resources.connect_existing')}
					control={form.control}
					loading={loading}
				>
					<DatabaseInfo modal={false} />
					<ConnectOptions />
					<ReadReplicas />
				</CreateResourceLayout>
			</form>
		</Form>
	);
}
