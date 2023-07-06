import { ReactNode } from 'react';
import './versionSettingsLayout.scss';
import { SettingsNavbar } from '@/features/version/SettingsNavbar';

interface VersionLayoutProps {
	children: ReactNode;
}
export default function VersionSettingsLayout({ children }: VersionLayoutProps) {
	return (
		<div className='version-settings-layout full-max-height-without-header'>
			<SettingsNavbar />
			{children}
		</div>
	);
}
