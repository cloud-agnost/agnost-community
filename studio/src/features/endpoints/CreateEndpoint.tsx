import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form } from '@/components/Form';
import { useTabNavigate, useToast } from '@/hooks';
import useEndpointStore from '@/store/endpoint/endpointStore';
import { APIError, CreateEndpointSchema, TabTypes } from '@/types';
import { removeEmptyFields, translate as t } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useLocation, useParams } from 'react-router-dom';
import * as z from 'zod';
import EndpointForm from './EndpointForm';
import { useMutation } from '@tanstack/react-query';
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
			logExecution: true,
		},
	});

	const { mutateAsync: createEndpointMutation, isPending } = useMutation({
		mutationFn: createEndpoint,
		mutationKey: ['create-endpoint'],
		onSuccess: (endpoint) => {
			navigate({
				title: endpoint.name,
				path: `${pathname}/${endpoint._id}`,
				isActive: true,
				isDashboard: false,
				type: TabTypes.Endpoint,
			});
			closeDrawer();
		},
		onError: ({ error, details }: APIError) => {
			notify({
				title: error,
				description: details,
				type: 'error',
			});
		},
	});

	async function onSubmit(data: z.infer<typeof CreateEndpointSchema>) {
		const params = removeEmptyFields(data) as z.infer<typeof CreateEndpointSchema>;
		await createEndpointMutation({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			...params,
		});
	}

	function closeDrawer() {
		onClose();
		form.reset({
			method: 'GET',
			path: '',
			name: '',
			middlewares: [],
			apiKeyRequired: false,
			sessionRequired: false,
			timeout: null,
			logExecution: false,
			rateLimits: [],
		});
	}

	return (
		<Drawer open={open} onOpenChange={closeDrawer}>
			<DrawerContent position='right' size='lg' className='h-full'>
				<DrawerHeader>
					<DrawerTitle>{t('endpoint.create.title')}</DrawerTitle>
				</DrawerHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='p-6 scroll'>
						<EndpointForm loading={isPending} />
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
