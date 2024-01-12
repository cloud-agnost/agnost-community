import { ReactNode } from 'react';
import { cn } from '@/utils';
interface VersionLayoutProps {
	children: ReactNode;
	navbar: ReactNode;
	className?: string;
}
export default function SettingsLayout({ children, navbar, className }: VersionLayoutProps) {
	return (
		<div className={cn('grid grid-cols-1 md:grid-cols-[310px_1fr] gap-6 h-full', className)}>
			{navbar}
			{children}
		</div>
	);
}
