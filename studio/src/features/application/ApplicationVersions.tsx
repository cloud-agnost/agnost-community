import { Button } from '@/components/Button';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from '@/components/Drawer';
import { SearchInput } from '@/components/SearchInput';
import useOrganizationStore from '@/store/organization/organizationStore';
import { useTranslation } from 'react-i18next';
export default function ApplicationVersions() {
	const { t } = useTranslation();
	const { isVersionOpen } = useOrganizationStore();
	return (
		<Drawer
			open={isVersionOpen}
			onOpenChange={() => {
				useOrganizationStore.setState({ isVersionOpen: false });
			}}
		>
			<DrawerContent position='right' size='md'>
				<DrawerHeader>
					<DrawerTitle>{t('application.version.title')}</DrawerTitle>
				</DrawerHeader>
				<div className='p-6'>
					<SearchInput placeholder={t('application.version.search')} />
				</div>
				<DrawerFooter>
					<DrawerClose asChild>
						<div className='flex  items-center justify-center gap-4'>
							<Button variant='text' size='lg'>
								{t('general.cancel')}
							</Button>
							<Button size='lg' variant='primary'>
								{t('general.open')}
							</Button>
						</div>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
