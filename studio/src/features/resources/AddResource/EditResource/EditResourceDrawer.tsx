import { Button } from '@/components/Button';
import { Description } from '@/components/Description';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Input } from '@/components/Input';
import { Label } from '@/components/Label';
import { UpdateAllowedRoles, UpdateResourceAccessConf } from '@/features/resources';
import { useToast } from '@/hooks';
import useResourceStore from '@/store/resources/resourceStore';
import { ResourceCreateType } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import EditSize from './EditSize';
import EditVersionAndReplica from './EditVersionAndReplica';

export default function EditResourceDrawer() {
	const { t } = useTranslation();
	const { isEditResourceModalOpen, closeEditResourceModal } = useResourceStore();
	const { resourceToEdit, resourceConfig, restartManagedResource } = useResourceStore();
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

	return (
		<Drawer open={isEditResourceModalOpen} onOpenChange={closeEditResourceModal}>
			<DrawerContent position='right' size='lg'>
				<DrawerHeader>
					<DrawerTitle>{t('resources.edit')}</DrawerTitle>
				</DrawerHeader>
				<div className='px-6 py-4 scroll space-y-8'>
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
							<div className='flex items-center justify-between'>
								<p className='text-balance'>
									Please be informed that if you restart your resource you might observe
									interruption in resource services until it completes its restart.
								</p>
								<Button loading={isPending} onClick={restartResource}>
									{t('general.restart')}
								</Button>
							</div>
						</Description>
					)}
				</div>
			</DrawerContent>
		</Drawer>
	);
}
