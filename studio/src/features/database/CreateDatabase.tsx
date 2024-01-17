import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form } from '@/components/Form';
import { useToast } from '@/hooks';
import useDatabaseStore from '@/store/database/databaseStore';
import useResourceStore from '@/store/resources/resourceStore';
import { APIError, CreateDatabaseSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { t } from 'i18next';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import DatabaseForm from './DatabaseForm';
import useEnvironmentStore from '@/store/environment/environmentStore';
export default function CreateDatabase() {
	const form = useForm<z.infer<typeof CreateDatabaseSchema>>({
		resolver: zodResolver(CreateDatabaseSchema),
		defaultValues: {
			assignUniqueName: true,
		},
	});
	const { toast } = useToast();
	const { versionId, appId, orgId } = useParams() as {
		versionId: string;
		appId: string;
		orgId: string;
	};
	const { createDatabase, isCreateDatabaseDialogOpen, toggleCreateModal } = useDatabaseStore();
	const { getEnvironmentResources, environment } = useEnvironmentStore();
	const resources = useResourceStore((state) =>
		state.resources.filter((resource) => resource.type === 'database'),
	);
	const { mutateAsync: createDatabaseMutation, isPending } = useMutation({
		mutationFn: createDatabase,
		onSuccess: () => {
			toggleCreateModal();
			form.reset();
			getEnvironmentResources({
				orgId: environment?.orgId,
				appId: environment?.appId,
				envId: environment?._id,
				versionId: environment?.versionId,
			});
		},
		onError: (error: APIError) => {
			toast({
				title: error.details,
				action: 'error',
			});
		},
	});

	function onCloseHandler() {
		toggleCreateModal();
		form.reset();
	}

	async function onSubmit(data: z.infer<typeof CreateDatabaseSchema>) {
		const resource = resources.find((item) => item._id === data.resourceId);
		if (!versionId || !resource) return;
		createDatabaseMutation({
			orgId,
			versionId,
			appId,
			type: resource.instance,
			...data,
		});
	}
	return (
		<Drawer open={isCreateDatabaseDialogOpen} onOpenChange={onCloseHandler}>
			<DrawerContent className='overflow-x-hidden'>
				<DrawerHeader className='relative'>
					<DrawerTitle>{t('database.add.title')}</DrawerTitle>
				</DrawerHeader>
				<Form {...form}>
					<form className='p-6 space-y-6' onSubmit={form.handleSubmit(onSubmit)}>
						<DatabaseForm loading={isPending} />
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
