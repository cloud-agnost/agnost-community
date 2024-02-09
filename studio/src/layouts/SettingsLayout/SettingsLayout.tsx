import { cn } from '@/utils';
import { ReactNode } from 'react';
interface VersionLayoutProps {
	children: ReactNode;
	navbar: ReactNode;
	className?: string;
}
export default function SettingsLayout({ children, navbar, className }: VersionLayoutProps) {
	return (
		<div className={cn('flex gap-6 h-full', className)}>
			{navbar && <div className='h-full min-w-[250px]'>{navbar}</div>}
			<div className='flex-1 h-full'>{children}</div>
		</div>
	);
}
