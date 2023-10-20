import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { Input } from '@/components/Input';
import { Label } from '@/components/Label';
import useResourceStore from '@/store/resources/resourceStore';
import { ResourceCreateType } from '@/types';
import { useTranslation } from 'react-i18next';
import { EditResource, UpdateAllowedRoles, UpdateResourceAccessConf } from '@/features/resources';

export default function EditResourceDrawer() {
	const { t } = useTranslation();
	const { isEditResourceModalOpen, closeEditResourceModal } = useResourceStore();
	const { resourceToEdit, resourceConfig } = useResourceStore();

	return (
		<Drawer open={isEditResourceModalOpen} onOpenChange={closeEditResourceModal}>
			<DrawerContent position='right' size='lg'>
				<DrawerHeader>
					<DrawerTitle>{t('resources.add')}</DrawerTitle>
				</DrawerHeader>
				<div className='px-6 py-4 scroll space-y-8'>
					<div>
						<Label>{t('general.name')}</Label>
						<Input disabled value={resourceToEdit.name} />
					</div>
					<UpdateAllowedRoles />
					{resourceConfig.type === ResourceCreateType.Existing && <UpdateResourceAccessConf />}
					{resourceConfig.type === ResourceCreateType.New && <EditResource />}
				</div>
			</DrawerContent>
		</Drawer>
	);
}
