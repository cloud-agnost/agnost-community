import { ReactNode } from 'react';
import './settingsLayout.scss';
import { cn } from '@/utils';
interface VersionLayoutProps {
	children: ReactNode;
	navbar: ReactNode;
	className?: string;
}
export default function SettingsLayout({ children, navbar, className }: VersionLayoutProps) {
	return (
		<div className={cn('settings-layout', className)}>
			{navbar}
			{children}
		</div>
	);
}
