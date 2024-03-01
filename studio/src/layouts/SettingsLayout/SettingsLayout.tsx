import { cn } from '@/utils';
import { ReactNode } from 'react';
interface VersionLayoutProps {
	children: ReactNode;
	navbar: ReactNode;
	className?: string;
}
export default function SettingsLayout({ children, navbar, className }: VersionLayoutProps) {
	return (
		<div className={cn('flex gap-6', className)}>
			{navbar && <div className='h-full min-w-[250px] p-4'>{navbar}</div>}
			<div className='flex-1 overflow-auto'>{children}</div>
		</div>
	);
}
