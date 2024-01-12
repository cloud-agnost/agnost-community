import { Separator } from '@/components/Separator';
import useTabStore from '@/store/version/tabStore';
import useUtilsStore from '@/store/version/utilsStore';
import { TabTypes } from '@/types';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useParams } from 'react-router-dom';
import OpenTabs from './OpenTabs';
import VersionSettingsExplorer from './VersionSettingsExplorer';
import Workspace from './Workspace';
export default function SideBar() {
	const { sidebar, toggleSidebar, isSidebarOpen } = useUtilsStore();
	const { getCurrentTab, tabs } = useTabStore();
	const { versionId } = useParams() as Record<string, string>;
	const scrollRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const toggleSidebarShortcut = (e: KeyboardEvent) => {
			if (e.key === 'b' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				toggleSidebar();
			}
		};

		document.addEventListener('keypress', toggleSidebarShortcut);
		return () => document.removeEventListener('keydown', toggleSidebarShortcut);
	}, []);

	useLayoutEffect(() => {
		let timeout: number;
		const scrollToElement = async () => {
			const currentTab = getCurrentTab(versionId);
			const dataId =
				currentTab.type === TabTypes.Settings
					? currentTab.title
					: window.location.pathname.split('/').slice(-1).pop();
			const targetElement = document.getElementById(dataId as string);
			if (targetElement) {
				targetElement.scrollIntoView({ behavior: 'smooth' });
			}
		};

		if (isSidebarOpen) {
			timeout = setInterval(scrollToElement, 250);
		}
		setTimeout(() => {
			clearInterval(timeout);
		}, 750);
		return () => {
			clearInterval(timeout);
		};
	}, [isSidebarOpen, tabs]);
	return (
		<div className='h-full w-80 bg-wrapper-background-base shadow-xl'>
			<h1 className='text-sm font-bold text-white px-8 py-2'>Explorer</h1>
			<PanelGroup
				direction='vertical'
				key={String(sidebar[versionId].openEditor)}
				className='!h-[90%]'
			>
				<Panel
					defaultSize={sidebar[versionId].openEditor ? 30 : 6}
					minSize={6}
					className='max-h-full !overflow-y-auto'
				>
					<OpenTabs />
				</Panel>
				<PanelResizeHandle className='p-1'>
					<Separator className='cursor-row-resize h-1 flex items-center justify-center' />
				</PanelResizeHandle>
				<Panel defaultSize={sidebar[versionId].openEditor ? 70 : 94}>
					<div className='h-full !overflow-auto' ref={scrollRef}>
						<Workspace />
						<VersionSettingsExplorer />
					</div>
				</Panel>
			</PanelGroup>
		</div>
	);
}
