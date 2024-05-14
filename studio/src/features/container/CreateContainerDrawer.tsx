import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Form } from '@/components/Form';
import useContainerStore from '@/store/container/containerStore';
import { ContainerSchema, CreateContainerParams } from '@/types/container';
import { zodResolver } from '@hookform/resolvers/zod';
import { startCase } from 'lodash';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import AutoScaleConfig from './config/AutoScaleConfig';
import Networking from './config/Networking';
import PodConfiguration from './config/PodConfiguration';
import Probes from './config/Probes';
import SourceForm from './config/SourceForm';
import StorageConfig from './config/StorageConfig';
import General from './config/General';
export default function CreateContainerDrawer() {
	const { t } = useTranslation();
	const { closeCreateContainerDialog, isCreateContainerDialogOpen, createdContainerType } =
		useContainerStore();

	const form = useForm<CreateContainerParams>({
		resolver: zodResolver(ContainerSchema),
		defaultValues: {
			type: createdContainerType!,
			sourceOrRegistry: 'source',
			source: {
				repoType: 'github',
			},
			podConfig: {
				cpuLimit: 1,
				cpuLimitType: 'millicores',
				cpuRequest: 100,
				cpuRequestType: 'millicores',
				memoryLimit: 1,
				memoryLimitType: 'gibibyte',
				memoryRequest: 128,
				memoryRequestType: 'mebibyte',
				restartPolicy: 'Always',
			},
			deploymentConfig: {
				desiredReplicas: 1,
				cpuMetric: {
					enabled: true,
					metricValue: 80,
					metricType: 'AverageUtilization',
				},
				memoryMetric: {
					enabled: true,
					metricValue: 100,
					metricType: 'AverageValueMebibyte',
				},
			},
			probes: {
				startup: {
					enabled: true,
					checkMechanism: {
						type: 'httpGet',
					},
					initialDelaySeconds: 1,
					periodSeconds: 1,
					timeoutSeconds: 1,
					failureThreshold: 1,
				},
				readiness: {
					enabled: true,
					checkMechanism: {
						type: 'httpGet',
					},
					initialDelaySeconds: 1,
					periodSeconds: 1,
					timeoutSeconds: 1,
					failureThreshold: 1,
				},
				liveness: {
					enabled: true,
					checkMechanism: {
						type: 'httpGet',
					},
					initialDelaySeconds: 1,
					periodSeconds: 1,
					timeoutSeconds: 1,
					failureThreshold: 1,
				},
			},
			storageConfig: {
				enabled: true,
				size: 128,
				sizeType: 'mebibyte',
				reclaimPolicy: 'retain',
				accessModes: ['ReadWriteOnce', 'ReadOnlyMany'],
			},
		},
	});

	const onSubmit = (data: CreateContainerParams) => {
		console.log(data);
	};

	function onClose() {
		closeCreateContainerDialog();
		form.reset();
	}

	useEffect(() => {
		if (isCreateContainerDialogOpen) {
			form.setValue('type', createdContainerType!);
		}
	}, [createdContainerType, isCreateContainerDialogOpen]);
	console.log(form.watch());
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
						<General />
						<SourceForm />
						<Networking />
						<PodConfiguration />
						<AutoScaleConfig />
						<Probes />
						<StorageConfig />
					</form>
				</Form>
			</DrawerContent>
		</Drawer>
	);
}
