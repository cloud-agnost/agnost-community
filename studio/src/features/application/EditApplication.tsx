import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/Drawer';
import OrganizationMenuItem from '@/features/organization/navbar/OrganizationMenuItem';
import useApplicationStore from '@/store/app/applicationStore';
import { translate } from '@/utils';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import AppGeneralSettings from './Settings/AppGeneralSettings';
const EDIT_APPLICATION_MENU_ITEMS = [
	{
		name: translate('application.edit.general'),
		href: '?t=general',
	},
	{
		name: translate('application.edit.members'),
		href: '?t=members',
	},
	{
		name: translate('application.edit.invitations'),
		href: '?t=invitations',
	},
];
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
			<DrawerContent position='right' size='lg'>
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
				<div className='p-6'>{searchParams.get('t') === 'general' && <AppGeneralSettings />}</div>
			</DrawerContent>
		</Drawer>
	);
}
