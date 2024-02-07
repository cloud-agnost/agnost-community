import { ReactNode } from 'react';
import { cn } from '@/utils';
import useUtilsStore from '@/store/version/utilsStore';
interface VersionLayoutProps {
	children: ReactNode;
	navbar: ReactNode;
	className?: string;
}
export default function SettingsLayout({ children, navbar, className }: VersionLayoutProps) {
	const { isSidebarOpen } = useUtilsStore();
	return (
		<div className={cn('flex gap-6 h-full', className)}>
			<div className={cn(isSidebarOpen && 'hidden', 'h-full')}>{navbar}</div>
			<div className='flex-1'>{children}</div>
		</div>
	);
}
