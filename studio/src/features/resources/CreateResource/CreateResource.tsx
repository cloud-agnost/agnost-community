import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import useCreateResource from '@/hooks/useCreateResource';
import useResourceStore from '@/store/resources/resourceStore';
import { useTranslation } from 'react-i18next';

export default function CreateResource() {
	const { t } = useTranslation();

	const { isCreateResourceModalOpen, toggleCreateResourceModal } = useResourceStore();
	const { CurrentResourceElement } = useCreateResource();
	return (
		<Drawer open={isCreateResourceModalOpen} onOpenChange={toggleCreateResourceModal}>
			<DrawerContent position='right' size='lg'>
				<DrawerHeader>
					<DrawerTitle>{t('resources.add')}</DrawerTitle>
				</DrawerHeader>
				<CurrentResourceElement />
			</DrawerContent>
		</Drawer>
	);
}
