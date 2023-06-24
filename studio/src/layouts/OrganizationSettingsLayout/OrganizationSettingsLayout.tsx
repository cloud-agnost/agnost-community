import { Description } from '@/components/Description';
import { Navbar } from '@/components/Navbar';
import { ORGANIZATION_SETTINGS } from '@/constants';
import React from 'react';
import './organizationSettingsLayout.scss';
interface Props {
	children: React.ReactNode;
	title?: string | null;
	description?: React.ReactNode;
}
export default function OrganizationSettingsLayout({ title, description, children }: Props) {
	return (
		<div className='organization-settings-layout'>
			<div className='organization-settings-layout-left'>
				<Navbar items={ORGANIZATION_SETTINGS} />
			</div>
			<div className='organization-settings-layout-right'>
				<div className='organization-settings-layout-right-divider'>
					<Description title={title}>{description}</Description>
				</div>
				{children}
			</div>
		</div>
	);
}
