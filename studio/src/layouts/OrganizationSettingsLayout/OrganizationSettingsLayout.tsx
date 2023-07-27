import { Description } from '@/components/Description';
import { Navbar } from '@/components/Navbar';
import { ORGANIZATION_SETTINGS } from '@/constants';
import React from 'react';
import './organizationSettingsLayout.scss';
import useOrganizationStore from '@/store/organization/organizationStore';

interface Props {
	children: React.ReactNode;
	title?: string | null;
	description?: string | null;
}
export default function OrganizationSettingsLayout({ title, description, children }: Props) {
	const { organization } = useOrganizationStore();
	const settings = ORGANIZATION_SETTINGS.map((setting) => ({
		...setting,
		href: setting.href.replace(':id', organization?._id as string),
	}));
	return (
		<div className='organization-settings-layout'>
			<div className='organization-settings-layout-left'>
				<Navbar items={settings} />
			</div>
			<div className='organization-settings-layout-scrollable' id='settings-scroll'>
				<div className='organization-settings-layout-right'>
					<div className='organization-settings-layout-right-divider'>
						<Description title={title}>{description}</Description>
					</div>
					{children}
				</div>
			</div>
		</div>
	);
}
