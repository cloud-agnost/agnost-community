import { Button } from '@/components/Button';
import { Description } from '@/components/Description';
import { Navbar } from '@/components/Navbar';
import { ArrowLeft } from '@phosphor-icons/react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import './UserSettingsLayout.scss';
import useOrganizationStore from '@/store/organization/organizationStore.ts';
import { MENU_ITEMS_FOR_PROFILE_SETTINGS } from '@/constants';
import { Layout } from '@/layouts/Layout';
import { ScrollArea, ScrollBar } from 'components/ScrollArea';

type UserSettingsLayoutProps = {
	children: ReactNode;
	title?: string | null;
	description?: ReactNode;
};

export default function UserSettingsLayout({
	children,
	title,
	description,
}: UserSettingsLayoutProps) {
	const { t } = useTranslation();
	const currentOrgId = useOrganizationStore((state) => state.organization?._id);
	return (
		<Layout>
			<div className='user-settings-layout'>
				<div className='user-settings-layout-left'>
					<div className='self-start'>
						<Button
							to={currentOrgId ? `/organization/${currentOrgId}` : '/organization'}
							variant='text'
							className='px-2 gap-4'
						>
							<ArrowLeft className='text-xl' />
							<span>{t('profileSettings.back_to_app')}</span>
						</Button>
						<div className='font-semibold text-base leading-[26px] text-default'></div>
					</div>
					<Navbar items={MENU_ITEMS_FOR_PROFILE_SETTINGS} />
				</div>
				<ScrollArea
					style={{
						height: 'calc(100vh - 72px)',
					}}
				>
					<ScrollBar orientation='vertical' />
					<div className='user-settings-layout-right'>
						<div className='user-settings-layout-right-divider'>
							<Description title={title}>{description}</Description>
						</div>

						{children}
					</div>
				</ScrollArea>
			</div>
		</Layout>
	);
}
