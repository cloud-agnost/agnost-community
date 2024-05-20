import { Button } from '@/components/Button';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from '@/components/Drawer';
import { Form } from '@/components/Form';
import useContainerStore from '@/store/container/containerStore';
import { ContainerSchema, ContainerType, CreateContainerParams } from '@/types/container';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { startCase } from 'lodash';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import DeploymentForm from './CreateForms/DeploymentForm';
import StatefulForm from './CreateForms/StatefulForm';
import KnativeForm from './CreateForms/KnativeForm';
import CronJobFrom from './CreateForms/CronJobFrom';

const defaultValues: Partial<CreateContainerParams> = {
	repoOrRegistry: 'repo',
	//@ts-ignore
	repo: {
		type: 'github',
		dockerfile: 'Dockerfile',
		path: '/',
	},
	podConfig: {
		cpuLimit: 1,
		cpuLimitType: 'cores',
		cpuRequest: 100,
		cpuRequestType: 'millicores',
		memoryLimit: 1,
		memoryLimitType: 'gibibyte',
		memoryRequest: 128,
		memoryRequestType: 'mebibyte',
		restartPolicy: 'Always',
	},
	probes: {
		startup: {
			enabled: false,
			checkMechanism: 'httpGet',
			httpPath: '/health',
			httpPort: 80,
			initialDelaySeconds: 1,
			periodSeconds: 1,
			timeoutSeconds: 1,
			failureThreshold: 1,
		},
		readiness: {
			enabled: false,
			httpPath: '/health',
			httpPort: 80,
			checkMechanism: 'httpGet',
			initialDelaySeconds: 1,
			periodSeconds: 1,
			timeoutSeconds: 1,
			failureThreshold: 1,
		},
		liveness: {
			enabled: false,
			httpPath: '/health',
			httpPort: 80,
			checkMechanism: 'httpGet',
			initialDelaySeconds: 1,
			periodSeconds: 1,
			timeoutSeconds: 1,
			failureThreshold: 1,
		},
	},
	storageConfig: {
		enabled: false,
		sizeType: 'mebibyte',
		accessModes: ['ReadWriteOnce'],
	},
	orgId: '',
	projectId: '',
	envId: '',
	type: 'deployment',
	variables: [],
};

export default function CreateContainerDrawer() {
	const { t } = useTranslation();
	const {
		closeCreateContainerDialog,
		createContainer,
		isCreateContainerDialogOpen,
		createdContainerType,
	} = useContainerStore();
	const { orgId, projectId, envId } = useParams() as Record<string, string>;
	const [searchParams, setSearchParams] = useSearchParams();
	const form = useForm<CreateContainerParams>({
		resolver: zodResolver(ContainerSchema),
		defaultValues,
	});
	const { mutateAsync: createContainerHandler, isPending } = useMutation({
		mutationFn: createContainer,
		onSuccess: () => {
			onClose();
		},
		onError: (error) => {
			console.error(error);
		},
	});
	const onSubmit = (data: CreateContainerParams) => {
		localStorage.removeItem('createDeployment');
		createContainerHandler(data);
	};

	function onClose() {
		form.reset({
			...defaultValues,
			type: createdContainerType!,
		});
		searchParams.delete('access_token');
		searchParams.delete('action');
		searchParams.delete('status');
		localStorage.removeItem('createDeployment');
		setSearchParams(searchParams);
		closeCreateContainerDialog();
	}

	useEffect(() => {
		if (isCreateContainerDialogOpen) {
			form.setValue('type', createdContainerType!);
			form.setValue('orgId', orgId);
			form.setValue('projectId', projectId);
			form.setValue('envId', envId);
		}
	}, [createdContainerType, isCreateContainerDialogOpen]);

	useEffect(() => {
		const storedData = localStorage.getItem('createDeployment');
		if (isCreateContainerDialogOpen && storedData) {
			form.reset({
				...JSON.parse(storedData),
				type: createdContainerType!,
				orgId,
				projectId,
				envId,
			});
		}
	}, [isCreateContainerDialogOpen]);

	return (
		<Drawer open={isCreateContainerDialogOpen} onOpenChange={onClose}>
			<DrawerContent position='right' size='lg' className='h-full'>
				<DrawerHeader>
					<DrawerTitle>
						{t('container.create', {
							type: startCase(createdContainerType!),
						})}
					</DrawerTitle>
				</DrawerHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='p-6 scroll space-y-12'>
						{ContainerType.Deployment === createdContainerType && <DeploymentForm />}
						{ContainerType.StatefulSet === createdContainerType && <StatefulForm />}
						{ContainerType.KNativeService === createdContainerType && <KnativeForm />}
						{ContainerType.CronJob === createdContainerType && <CronJobFrom />}

						<DrawerFooter className='mt-8'>
							<div className='flex justify-end'>
								<DrawerClose asChild>
									<Button variant='secondary' size='lg'>
										{t('general.cancel')}
									</Button>
								</DrawerClose>
								<Button className='ml-2' type='submit' size='lg' loading={isPending}>
									{t('general.save')}
								</Button>
							</div>
						</DrawerFooter>
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
