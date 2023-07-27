import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form } from '@/components/Form';
import { CreateEndpointSchema } from '@/types';
import { translate as t } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import EndpointForm from './EndpointForm';
import useOrganizationStore from '@/store/organization/organizationStore';
import useEndpointStore from '@/store/endpoint/endpointStore';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks';
interface CreateEndpointProps {
	open: boolean;
	onClose: () => void;
}

export default function CreateEndpoint({ open, onClose }: CreateEndpointProps) {
	const { createEndpoint } = useEndpointStore();
	const { versionId, appId, orgId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();
	const { notify } = useToast();
	const form = useForm<z.infer<typeof CreateEndpointSchema>>({
		resolver: zodResolver(CreateEndpointSchema),
	});

	function onSubmit(data: z.infer<typeof CreateEndpointSchema>) {
		createEndpoint({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			...data,
			onSuccess: () => {
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
					<DrawerTitle>{t('endpoint.create.title')}</DrawerTitle>
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
