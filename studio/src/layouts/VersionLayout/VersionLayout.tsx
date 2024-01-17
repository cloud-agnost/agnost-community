import { Tabs } from '@/features/version/Tabs';
import { SideNavigation } from '@/features/version/navigation';
import useUtilsStore from '@/store/version/utilsStore';
import { cn } from '@/utils';
import { ReactNode } from 'react';
import './versionLayout.scss';
import { Separator } from '@/components/Separator';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';

interface VersionLayoutProps {
	children: ReactNode;
	className?: string;
}
export default function VersionLayout({ children, className }: VersionLayoutProps) {
	const { isSidebarOpen } = useUtilsStore();
	return (
		<div className='flex h-full'>
			<PanelGroup direction='horizontal' autoSaveId='sidebar'>
				{isSidebarOpen && (
					<Panel defaultSize={15} minSize={12}>
						<SideNavigation />
					</Panel>
				)}
				<PanelResizeHandle className=''>
					<Separator className='cursor-col-resize w-1' orientation='vertical' />
				</PanelResizeHandle>
				<Panel defaultSize={85}>
					<div className='w-full'>
						<Tabs />
						<div className={cn('version-layout relative', className)} id='version-layout'>
							{children}
						</div>
					</div>
				</Panel>
			</PanelGroup>
		</div>
	);
}
