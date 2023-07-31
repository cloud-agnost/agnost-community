import { Tabs } from '@/features/version/Tabs';
import { cn } from '@/utils';
import { ReactNode } from 'react';
import './versionLayout.scss';

interface VersionLayoutProps {
	children: ReactNode;
	className?: string;
}
export default function VersionLayout({ children, className }: VersionLayoutProps) {
	return (
		<>
			<Tabs />
			<div className={cn('version-layout', className)}>{children}</div>
		</>
	);
}
