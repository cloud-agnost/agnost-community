import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import { EDIT_APPLICATION_MENU_ITEMS } from '@/constants';
import OrganizationMenuItem from '@/features/organization/navbar/OrganizationMenuItem';
import useApplicationStore from '@/store/app/applicationStore';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import AppGeneralSettings from './Settings/AppGeneralSettings';
import AppMembers from './Settings/Members/AppMembers';
import AppInvitations from '@/features/application/Settings/Invitations/AppInvitations';

export default function EditApplication() {
	const { t } = useTranslation();
	const [searchParams, setSearchParams] = useSearchParams();
	const { isEditAppOpen, closeEditAppDrawer, getAppTeamMembers } = useApplicationStore();

	useEffect(() => {
		if (!searchParams.get('t')) {
			searchParams.set('t', 'general');
			setSearchParams(searchParams);
		}
	}, [searchParams]);

	useEffect(() => {
		if (isEditAppOpen) {
			getAppTeamMembers();
		}
	}, [isEditAppOpen]);

	return (
		<Drawer open={isEditAppOpen} onOpenChange={closeEditAppDrawer}>
			<DrawerContent position='right' size='lg' className='h-full'>
				<DrawerHeader className='border-none'>
					<DrawerTitle>{t('application.settings.editApp')}</DrawerTitle>
				</DrawerHeader>
				<nav className='mx-auto flex border-b'>
					{EDIT_APPLICATION_MENU_ITEMS.map((item) => {
						return (
							<OrganizationMenuItem
								key={item.name}
								item={item}
								active={window.location.search.includes(item.href)}
							/>
						);
					})}
				</nav>
				<div className='flex flex-col h-full'>
					{searchParams.get('t') === 'general' && <AppGeneralSettings />}
					{searchParams.get('t') === 'members' && <AppMembers />}
					{searchParams.get('t') === 'invitations' && <AppInvitations />}
				</div>
			</DrawerContent>
		</Drawer>
	);
}
