import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form } from '@/components/Form';
import { useTabNavigate, useToast } from '@/hooks';
import useEndpointStore from '@/store/endpoint/endpointStore';
import { CreateEndpointSchema } from '@/types';
import { translate as t } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useLocation, useParams } from 'react-router-dom';
import * as z from 'zod';
import EndpointForm from './EndpointForm';
interface CreateEndpointProps {
	open: boolean;
	onClose: () => void;
}

export default function CreateEndpoint({ open, onClose }: CreateEndpointProps) {
	const { createEndpoint } = useEndpointStore();

	const { pathname } = useLocation();
	const navigate = useTabNavigate();
	const { versionId, appId, orgId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();
	const { notify } = useToast();
	const form = useForm<z.infer<typeof CreateEndpointSchema>>({
		resolver: zodResolver(CreateEndpointSchema),
		defaultValues: {
			method: 'GET',
		},
	});

	async function onSubmit(data: z.infer<typeof CreateEndpointSchema>) {
		await createEndpoint({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			...data,
			onSuccess: (endpoint) => {
				navigate({
					title: endpoint.name,
					path: `${pathname}/${endpoint._id}`,
					isActive: true,
					isDashboard: false,
					type: 'Endpoint',
				});
				closeDrawer();
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

	function closeDrawer() {
		onClose();
		form.reset();
	}

	return (
		<Drawer open={open} onOpenChange={closeDrawer}>
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
