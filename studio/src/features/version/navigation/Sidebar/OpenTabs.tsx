import { Button } from '@/components/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/Tooltip';
import useTabStore from '@/store/version/tabStore';
import useUtilsStore from '@/store/version/utilsStore';
import { Tab } from '@/types';
import { cn } from '@/utils';
import { X, XSquare } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ExplorerCollapsible, ExplorerCollapsibleTrigger } from './ExplorerCollapsible';
import SideBarButton from './SideBarButton';
import { MouseEvent } from 'react';
export default function OpenTabs() {
	const { versionId } = useParams() as { versionId: string };
	const { getTabsByVersionId, setCurrentTab, openDeleteTabModal, removeTab } = useTabStore();
	const tabs = getTabsByVersionId(versionId);
	const { toggleOpenEditorTab, sidebar } = useUtilsStore();
	const navigate = useNavigate();

	function tabRemoveHandler(e: MouseEvent<HTMLButtonElement>, tab: Tab) {
		e.stopPropagation();
		if (tab.isDirty) {
			openDeleteTabModal(tab);
		} else {
			removeTab(versionId, tab.id);
		}
	}

	function handleClickTabLink(tab: Tab) {
		setCurrentTab(versionId, tab.id);
		navigate(tab.path);
	}

	return (
		<ExplorerCollapsible
			open={sidebar[versionId]?.openEditor || false}
			onOpenChange={toggleOpenEditorTab}
			trigger={<OpenTabsTrigger />}
			className='border-b border-border max-h-[205px]'
		>
			<div className='max-h-[144px] overflow-auto py-0.5'>
				{tabs.map((tab) => (
					<SideBarButton
						key={tab.id}
						id={tab.id}
						active={tab.isActive}
						onClick={() => handleClickTabLink(tab)}
						title={tab.title}
						type={tab.type}
						actions={
							<div className='flex items-center'>
								{tab.isDirty && (
									<span className='text-default rounded-full bg-base-reverse w-2 h-2 absolute group-hover:invisible' />
								)}
								{!tab.isDashboard && (
									<Button
										variant='icon'
										size='sm'
										rounded
										className={cn(
											tab.isActive && 'hover:bg-button-primary',
											'!p-0 !h-5  hidden group-hover:inline-flex',
										)}
										onClick={(e) => tabRemoveHandler(e, tab)}
									>
										<X size={14} className='text-subtle group-hover:text-default' />
									</Button>
								)}
							</div>
						}
					/>
				))}
			</div>
		</ExplorerCollapsible>
	);
}

function OpenTabsTrigger() {
	const { t } = useTranslation();
	const { toggleOpenEditorTab, sidebar } = useUtilsStore();
	const { removeAllTabs } = useTabStore();
	const { versionId } = useParams() as { versionId: string };

	return (
		<ExplorerCollapsibleTrigger active={sidebar[versionId]?.openEditor || false}>
			<Button
				variant='blank'
				size='full'
				className='justify-start pl-0 w-full text-left font-normal text-sm'
				onClick={toggleOpenEditorTab}
			>
				<h1
					title='Open Tabs'
					className={cn(
						'truncate max-w-[15ch] text-xs text-default font-sfCompact',
						sidebar[versionId]?.openEditor
							? 'text-default'
							: 'text-subtle group-hover:text-default',
					)}
				>
					Open Tabs
				</h1>
			</Button>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							rounded
							className='h-full !w-6 p-0.5 mr-2 invisible group-hover:visible'
							variant='icon'
							size='sm'
							onClick={() => removeAllTabs(versionId)}
						>
							<XSquare size={14} />
						</Button>
					</TooltipTrigger>
					<TooltipContent>{t('version.close_all_tabs')}</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</ExplorerCollapsibleTrigger>
	);
}
