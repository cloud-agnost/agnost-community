import { Button } from '@/components/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/Tooltip';
import useTabStore from '@/store/version/tabStore';
import useUtilsStore from '@/store/version/utilsStore';
import { TabTypes } from '@/types';
import { isElementInViewport } from '@/utils';
import { MinusSquare } from '@phosphor-icons/react';
import { useEffect, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import OpenTabs from './OpenTabs';
import VersionSettingsExplorer from './VersionSettingsExplorer';
import Workspace from './Workspace';
export default function SideBar() {
	const { t } = useTranslation();
	const { toggleSidebar, isSidebarOpen, collapseAll } = useUtilsStore();
	const { getCurrentTab, tabs } = useTabStore();
	const { versionId } = useParams() as Record<string, string>;

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

			if (targetElement && !isElementInViewport(targetElement)) {
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
		<div className='h-full w-full bg-base shadow-xl' id='side-navigation'>
			<div className='pl-6 py-2 border-b border-border group flex items-center justify-between'>
				<h1 className='text-sm font-bold text-white'>{t('version.explorer')}</h1>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant='icon'
								rounded
								className='!p-0 !h-6 mr-2 invisible group-hover:visible'
								size='sm'
								onClick={collapseAll}
							>
								<MinusSquare size={16} />
							</Button>
						</TooltipTrigger>
						<TooltipContent>{t('version.collapse_all')}</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
			<OpenTabs />
			<div className='overflow-y-auto overflow-x-hidden h-[calc(100%-13rem)]'>
				<Workspace />
				<VersionSettingsExplorer />
			</div>
		</div>
	);
}
