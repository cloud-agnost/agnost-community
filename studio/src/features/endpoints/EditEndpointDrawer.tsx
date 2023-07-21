import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import useEndpointStore from '@/store/endpoint/endpointStore';
import { CreateEndpointSchema } from '@/types';
import { translate as t } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import EndpointForm from './EndpointForm';
import { Form } from '@/components/Form';
import { useToast } from '@/hooks';
import { useParams } from 'react-router-dom';
interface CreateEndpointProps {
	open: boolean;
	onClose: () => void;
}
export default function EditEndpointDrawer({ open, onClose }: CreateEndpointProps) {
	const { endpoint, updateEndpoint } = useEndpointStore();
	const { notify } = useToast();
	const { versionId, appId, orgId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();
	const form = useForm<z.infer<typeof CreateEndpointSchema>>({
		resolver: zodResolver(CreateEndpointSchema),
		defaultValues: {
			name: endpoint?.name,
			timeout: endpoint?.timeout
			method: endpoint?.method,
			path: endpoint?.path,
			rateLimits: endpoint?.rateLimits,
			middlewares: endpoint?.middlewares,
		},
	});

	function onSubmit(data: z.infer<typeof CreateEndpointSchema>) {
		updateEndpoint({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			epId: endpoint?._id as string,
			...data,
			onSuccess: () => {
				notify({
					title: t('general.success'),
					description: t('endpoint.editSuccess'),
					type: 'success',
				});
				onClose();
				form.reset();
			},
			onError: ({ error, details }) => {
				notify({
					title: error,
					description: details,
					type: 'error',
				});
			},
		});
	}

	return (
		<Drawer open={open} onOpenChange={onClose}>
			<DrawerContent position='right' size='lg' className='h-full'>
				<DrawerHeader>
					<DrawerTitle>
						{t('endpoint.edit', {
							name: endpoint?.name,
						})}
					</DrawerTitle>
				</DrawerHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='p-6 scroll'>
						<EndpointForm />
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
