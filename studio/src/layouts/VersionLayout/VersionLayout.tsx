import { Tabs } from '@/features/version/Tabs';
import { SideNavigation } from '@/features/version/navigation';
import useUtilsStore from '@/store/version/utilsStore';
import { cn } from '@/utils';
import { ReactNode } from 'react';
import './versionLayout.scss';

interface VersionLayoutProps {
	children: ReactNode;
	className?: string;
}
export default function VersionLayout({ children, className }: VersionLayoutProps) {
	const { isSidebarOpen } = useUtilsStore();
	return (
		<div className='flex h-full'>
			{isSidebarOpen && <SideNavigation />}
			<div className={cn(isSidebarOpen ? 'w-5/6' : 'flex-1')}>
				<Tabs />
				<div className={cn('version-layout ', className)} id='version-layout'>
					{children}
				</div>
			</div>
		</div>
	);
}
