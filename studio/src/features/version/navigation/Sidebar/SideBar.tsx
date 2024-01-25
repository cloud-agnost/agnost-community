import { Button } from '@/components/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/Tooltip';
import useTabStore from '@/store/version/tabStore';
import useUtilsStore from '@/store/version/utilsStore';
import useVersionStore from '@/store/version/versionStore';
import { TabTypes } from '@/types';
import { cn, isElementInViewport } from '@/utils';
import { MagnifyingGlass, MinusSquare } from '@phosphor-icons/react';
import { useEffect, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import CodeSearch from './CodeSearch/CodeSearch';
import OpenTabs from './OpenTabs';
import VersionSettingsExplorer from './VersionSettingsExplorer';
import Workspace from './Workspace';
export default function SideBar() {
	const { t } = useTranslation();

	const { toggleSidebar, isSidebarOpen, collapseAll, sidebar } = useUtilsStore();
	const { toggleSearchView, isSearchViewOpen } = useVersionStore();
	const { versionId } = useParams() as Record<string, string>;
	const { getCurrentTab, tabs } = useTabStore();
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
		<div
			className='h-full w-full bg-base shadow-xl flex flex-col border-r border'
			id='side-navigation'
		>
			<div className='pl-2 py-[0.22rem] border-b border-border group flex items-center justify-between bg-[#f5f6f6] dark:bg-[#171d2d]'>
				<h1 className='text-xs text-white'>{t('version.explorer')}</h1>
				<div className='flex items-center'>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant='icon'
									size='sm'
									rounded
									className='!p-0 !h-6 invisible group-hover:visible'
									onClick={collapseAll}
								>
									<MinusSquare size={16} />
								</Button>
							</TooltipTrigger>
							<TooltipContent>{t('version.collapse_all')}</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant='icon'
									rounded
									size='sm'
									onClick={toggleSearchView}
									className={cn(
										'!p-0 !h-6',
										isSearchViewOpen
											? 'bg-wrapper-background-hover text-default visible'
											: 'invisible group-hover:visible',
									)}
								>
									<MagnifyingGlass size={16} />
								</Button>
							</TooltipTrigger>
							<TooltipContent>{t('version.search_files')}</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>
			{isSearchViewOpen ? (
				<CodeSearch />
			) : (
				<>
					<OpenTabs />
					<div
						className={cn(
							'overflow-y-auto overflow-x-hidden pb-2',
							sidebar[versionId].openEditor ? 'h-[calc(100%-13rem)]' : 'h-[calc(100%-4rem)]',
						)}
					>
						<Workspace />
						<VersionSettingsExplorer />
					</div>
				</>
			)}
		</div>
	);
}
