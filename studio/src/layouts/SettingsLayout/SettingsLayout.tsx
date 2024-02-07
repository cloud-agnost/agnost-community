import { ReactNode } from 'react';
import { cn } from '@/utils';
interface VersionLayoutProps {
	children: ReactNode;
	navbar: ReactNode;
	className?: string;
}
export default function SettingsLayout({ children, navbar, className }: VersionLayoutProps) {
	return (
		<div className={cn('flex gap-6 h-full', className)}>
			<div className='h-full '>{navbar}</div>
			<div className='flex-1'>{children}</div>
		</div>
	);
}
