import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import useEndpointStore from '@/store/endpoint/endpointStore';
import { APIError, CreateEndpointSchema } from '@/types';
import { translate as t, removeEmptyFields } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import EndpointForm from './EndpointForm';
import { Form } from '@/components/Form';
import { useToast } from '@/hooks';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';

export default function EditEndpointDrawer() {
	const { endpoint, updateEndpoint, isEditEndpointModalOpen, closeEditEndpointModal } =
		useEndpointStore();
	const { toast } = useToast();
	const { versionId, appId, orgId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();
	const form = useForm<z.infer<typeof CreateEndpointSchema>>({
		resolver: zodResolver(CreateEndpointSchema),
	});
	const { mutateAsync: updateEndpointMutation, isPending } = useMutation({
		mutationFn: updateEndpoint,
		onSuccess: () => {
			closeEditEndpointModal();
			form.reset();
			toast({
				title: t('endpoint.editSuccess'),
				action: 'success',
			});
		},
		onError: ({ details }: APIError) => {
			toast({
				title: details,
				action: 'error',
			});
		},
	});
	function onSubmit(data: z.infer<typeof CreateEndpointSchema>) {
		const params = removeEmptyFields(data) as z.infer<typeof CreateEndpointSchema>;
		updateEndpointMutation({
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			epId: endpoint?._id as string,
			...params,
		});
	}

	useEffect(() => {
		if (endpoint && isEditEndpointModalOpen) {
			form.reset({
				name: endpoint.name,
				method: endpoint.method,
				path: endpoint.path,
				sessionRequired: endpoint.sessionRequired,
				apiKeyRequired: endpoint.apiKeyRequired,
				timeout: endpoint.timeout,
				logExecution: endpoint.logExecution,
				rateLimits: endpoint.rateLimits,
				middlewares: endpoint?.middlewares,
			});
		}
	}, [endpoint, open]);

	return (
		<Drawer open={isEditEndpointModalOpen} onOpenChange={closeEditEndpointModal}>
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
						<EndpointForm loading={isPending} />
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
