import { Button } from '@/components/Button';
import { Description } from '@/components/Description';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Input } from '@/components/Input';
import { Label } from '@/components/Label';
import { UpdateAllowedRoles, UpdateResourceAccessConf } from '@/features/resources';
import { useToast } from '@/hooks';
import useResourceStore from '@/store/resources/resourceStore';
import { ResourceCreateType, ResourceInstances } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import EditSize from './EditSize';
import EditVersionAndReplica from './EditVersionAndReplica';
import { OrganizationMenuItem } from '@/features/organization';
import { ADD_RESOURCE_TABS } from '@/constants';
import { cn } from '@/utils';
import { useEffect } from 'react';
import { CopyInput } from '@/components/CopyInput';
import _, { capitalize } from 'lodash';
import { ArrowRight } from '@phosphor-icons/react';
import { PasswordInput } from '@/components/PasswordInput';

export default function EditResourceDrawer() {
	const { t } = useTranslation();
	const [searchParams, setSearchParams] = useSearchParams();
	const { isEditResourceModalOpen, closeEditResourceModal } = useResourceStore();
	const {
		resourceToEdit,
		resourceConfig,
		restartManagedResource,
		enableTcpProxy,
		disableTcpProxy,
	} = useResourceStore();
	const { toast } = useToast();
	const { orgId } = useParams() as Record<string, string>;
	const { isPending, mutateAsync: restartResource } = useMutation({
		mutationFn: () => restartManagedResource({ resourceId: resourceToEdit._id, orgId }),
		mutationKey: ['restartManagedResource'],
		onSuccess: () => {
			toast({
				title: t('resources.restart_success') as string,
				action: 'success',
			});
		},
		onError: (err) => {
			toast({
				title: err.details,
				action: 'error',
			});
		},
	});

	const { isPending: enableLoading, mutate: enableTcpProxyMutate } = useMutation({
		mutationFn: () => enableTcpProxy({ resourceId: resourceToEdit._id, orgId }),
		mutationKey: ['enableTcpProxy'],
		onSuccess: () => {
			toast({
				title: t('resources.enable_networking_success') as string,
				action: 'success',
			});
		},
	});

	const { isPending: disableLoading, mutate: disableTcpProxyMutate } = useMutation({
		mutationFn: () => disableTcpProxy({ resourceId: resourceToEdit._id, orgId }),
		mutationKey: ['disableTcpProxy'],
		onSuccess: () => {
			toast({
				title: t('resources.disable_networking_success') as string,
				action: 'success',
			});
		},
	});

	function closeDrawer(open: boolean) {
		if (open) return;
		closeEditResourceModal();
		searchParams.delete('t');
		setSearchParams(searchParams);
	}

	useEffect(() => {
		if (isEditResourceModalOpen) {
			searchParams.set('t', ADD_RESOURCE_TABS[0].href);
			setSearchParams(searchParams);
		}
	}, [isEditResourceModalOpen]);

	return (
		<Drawer open={isEditResourceModalOpen} onOpenChange={closeDrawer}>
			<DrawerContent position='right' size='lg'>
				<DrawerHeader className={cn(resourceToEdit.managed && 'border-none')}>
					<DrawerTitle>{t('resources.edit')}</DrawerTitle>
				</DrawerHeader>
				{resourceToEdit.managed && (
					<ul className='flex border-b'>
						{ADD_RESOURCE_TABS.map((item) => {
							return (
								<OrganizationMenuItem
									key={item.name}
									item={item}
									active={window.location.search.includes(item.href)}
								/>
							);
						})}
					</ul>
				)}
				<div className='px-6 py-4 scroll space-y-8'>
					{searchParams.get('t') === ADD_RESOURCE_TABS[0].href ? (
						<>
							<div>
								<Label>{t('general.name')}</Label>
								<Input disabled value={resourceToEdit.name} />
							</div>
							<UpdateAllowedRoles />
							{resourceConfig.type === ResourceCreateType.Existing && <UpdateResourceAccessConf />}
							{resourceConfig.type === ResourceCreateType.New && (
								<>
									<EditSize />
									<EditVersionAndReplica />
								</>
							)}

							{resourceToEdit.managed && (
								<Description title={`Restart ${resourceToEdit.instance} server`}>
									<div className='flex items-center justify-between gap-6'>
										<p>
											Please be informed that if you restart your resource you might observe
											interruption in resource services until it completes its restart.
										</p>
										<Button loading={isPending} onClick={restartResource}>
											{t('general.restart')}
										</Button>
									</div>
								</Description>
							)}
						</>
					) : (
						<div className='space-y-4'>
							<Description title={t('resources.private_networking')}>
								{t('resources.private_networking_description')}
							</Description>
							<div className='space-y-4'>
								{!_.isEmpty(resourceToEdit?.accessReadOnly) && (
									<Label className='description-title'>{t('resources.primary')}</Label>
								)}
								<div className='space-y-4'>
									{resourceToEdit?.access && (
										<div className='space-y-4'>
											<div className='flex gap-6'>
												<div className='flex-1'>
													<Label>{t('resources.database.host')}</Label>
													<CopyInput readOnly value={resourceToEdit?.access.host} />
												</div>
												<div>
													<Label>{t('resources.database.port')}</Label>
													<CopyInput readOnly value={resourceToEdit?.access.port} />
												</div>
											</div>
											<div className='flex items-start gap-6'>
												{resourceToEdit?.access.username && (
													<div className='flex-1'>
														<Label>{t('resources.database.username')}</Label>
														<PasswordInput
															readOnly
															value={resourceToEdit?.access.username}
															copyable
														/>
													</div>
												)}
												<div className='flex-1'>
													<Label>{t('resources.database.password')}</Label>
													<PasswordInput
														readOnly
														value={resourceToEdit?.access.password}
														copyable
													/>
												</div>
											</div>
											{resourceToEdit.instance === ResourceInstances.RabbitMQ && (
												<div className='flex items-start gap-6'>
													<div className='flex-1'>
														<Label>{t('resources.queue.scheme')}</Label>
														<CopyInput readOnly value={resourceToEdit?.access.scheme} />
													</div>

													<div className='flex-1'>
														<Label>{t('resources.queue.vhost')}</Label>
														<CopyInput readOnly value={resourceToEdit?.access.vhost} />
													</div>
												</div>
											)}
										</div>
									)}
								</div>
							</div>
							{!_.isEmpty(resourceToEdit?.accessReadOnly) && (
								<div className='space-y-4'>
									<Label className='description-title'>{t('resources.replicas')}</Label>
									{resourceToEdit.accessReadOnly?.map((replica) => (
										<>
											<div className='flex gap-6'>
												<div className='flex-1'>
													<Label>{t('resources.database.host')}</Label>
													<CopyInput readOnly value={replica.host} />
												</div>
												<div>
													<Label>{t('resources.database.port')}</Label>
													<CopyInput readOnly value={replica.port} />
												</div>
											</div>
											<div className='flex items-start gap-6'>
												{replica.username && (
													<div className='flex-1'>
														<Label>{t('resources.database.username')}</Label>
														<PasswordInput readOnly value={replica.username} copyable />
													</div>
												)}
												<div className='flex-1'>
													<Label>{t('resources.database.password')}</Label>
													<PasswordInput readOnly value={replica.password} copyable />
												</div>
											</div>
										</>
									))}
								</div>
							)}
							<div className='space-y-4'>
								<Description title={t('resources.public_networking')}>
									{t('resources.public_networking_description')}
								</Description>
								<div className='flex items-center gap-4'>
									<CopyInput className='flex-1' readOnly value={window.location.origin} />
									<ArrowRight />
									<CopyInput className='flex-1' readOnly value={resourceToEdit?.access?.host} />
								</div>
							</div>
							<Button
								className='self-end'
								onClick={
									resourceToEdit.tcpProxyEnabled ? disableTcpProxyMutate : enableTcpProxyMutate
								}
								loading={enableLoading || disableLoading}
							>
								{t(`resources.${resourceToEdit.tcpProxyEnabled ? 'disable' : 'enable'}_networking`)}
							</Button>
						</div>
					)}
				</div>
			</DrawerContent>
		</Drawer>
	);
}
