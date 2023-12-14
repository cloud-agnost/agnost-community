import { Button } from '@/components/Button';
import { Description } from '@/components/Description';
import { Navbar } from '@/components/Navbar';
import { MENU_ITEMS_FOR_PROFILE_SETTINGS } from '@/constants';
import useOrganizationStore from '@/store/organization/organizationStore.ts';
import { ArrowLeft } from '@phosphor-icons/react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import './UserSettingsLayout.scss';

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
	const settings = MENU_ITEMS_FOR_PROFILE_SETTINGS.map((setting) => ({
		...setting,
		href: setting.href.replace(':id', currentOrgId as string),
	}));
	return (
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
				</div>
				<Navbar items={settings} />
			</div>
			<div className='scroll'>
				<div className='user-settings-layout-right'>
					<div className='user-settings-layout-right-divider'>
						<Description title={title}>{description}</Description>
					</div>

					{children}
				</div>
			</div>
		</div>
	);
}
