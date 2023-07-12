import { useTranslation } from 'react-i18next';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from 'components/Drawer';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ADD_API_KEYS_MENU_ITEMS } from '@/constants';
import { OrganizationMenuItem } from '@/features/organization';
import { AddAPIKeyGeneral } from '@/features/version/SettingsAPIKeys/';
import { AnimatePresence } from 'framer-motion';

interface AddAPIKeyDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function AddAPIKeyDrawer({ open, onOpenChange }: AddAPIKeyDrawerProps) {
	const { t } = useTranslation();
	const [searchParams, setSearchParams] = useSearchParams();

	useEffect(() => {
		if (!open) {
			searchParams.delete('t');
			setSearchParams(searchParams);
		} else if (!searchParams.has('t')) {
			searchParams.set('t', 'general');
			setSearchParams(searchParams);
		}
	}, [open]);

	const activeTab = searchParams.get('t') || 'general';

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent position='right'>
				<DrawerHeader className='border-none'>
					<DrawerTitle>{t('version.api_key.add')}</DrawerTitle>
				</DrawerHeader>
				<ul className='mx-auto flex border-b'>
					{ADD_API_KEYS_MENU_ITEMS.map((item) => {
						return (
							<OrganizationMenuItem
								key={item.name}
								item={item}
								active={window.location.search.includes(item.href)}
							/>
						);
					})}
				</ul>

				<AnimatePresence>{activeTab === 'general' && <AddAPIKeyGeneral />}</AnimatePresence>
			</DrawerContent>
		</Drawer>
	);
}
