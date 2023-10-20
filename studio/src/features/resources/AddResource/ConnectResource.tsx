import { Form } from '@/components/Form';
import { CreateResourceLayout } from '@/features/resources';
import { useToast } from '@/hooks';
import useCreateResource from '@/hooks/useCreateResource';
import useResourceStore from '@/store/resources/resourceStore';
import { ConnectResourceSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
export default function ConnectResource() {
	const { toggleCreateResourceModal, addExistingResource } = useResourceStore();
	const { CurrentResourceElement } = useCreateResource();
	const { notify } = useToast();
	const form = useForm<z.infer<typeof ConnectResourceSchema>>({
		resolver: zodResolver(ConnectResourceSchema),
	});
	const [loading, setLoading] = useState(false);

	function onSubmit(data: z.infer<typeof ConnectResourceSchema>) {
		setLoading(true);
		addExistingResource({
			...data,
			access: {
				...data.access,
				options: data.access?.options?.filter((option) => option.key && option.value),
				brokers: data.access?.brokers?.map((broker) => broker.key) as string[],
			},
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
				<CreateResourceLayout loading={loading}>
					<CurrentResourceElement />
				</CreateResourceLayout>
			</form>
		</Form>
	);
}
