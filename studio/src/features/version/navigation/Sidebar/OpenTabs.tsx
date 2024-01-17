import { Button } from '@/components/Button';
import { CollapsibleContent } from '@/components/Collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/Tooltip';
import { useTabIcon } from '@/hooks';
import useTabStore from '@/store/version/tabStore';
import useUtilsStore from '@/store/version/utilsStore';
import { Tab } from '@/types';
import { cn } from '@/utils';
import { X, XSquare } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ExplorerCollapsible, ExplorerCollapsibleTrigger } from './ExplorerCollapsible';
import SideBarButton from './SideBarButton';
export default function OpenTabs() {
	const { versionId } = useParams() as { versionId: string };
	const { getTabsByVersionId, setCurrentTab, openDeleteTabModal, removeTab } = useTabStore();
	const tabs = getTabsByVersionId(versionId);
	const { toggleOpenEditorTab, sidebar } = useUtilsStore();
	const getTabIcon = useTabIcon('w-4 h-4');
	const navigate = useNavigate();

	function tabRemoveHandler(tab: Tab) {
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
		>
			<div className='max-h-[200px] overflow-auto'>
				{tabs.map((tab) => (
					<div id={tab.id} key={tab.id} className='relative group h-7'>
						<SideBarButton
							active={tab.isActive}
							onClick={() => handleClickTabLink(tab)}
							title={tab.title}
							type={tab.type}
							className='h-full'
						/>

						<div className='bg-transparent h-full flex items-center justify-center pr-0.5 absolute top-0 right-0'>
							{tab.isDirty && (
								<span className='text-default rounded-full bg-base-reverse w-2 h-2 absolute group-hover:invisible' />
							)}
							{!tab.isDashboard && (
								<Button
									iconOnly
									variant='blank'
									onClick={() => tabRemoveHandler(tab)}
									className={cn(
										'!h-[unset] rounded-full invisible group-hover:visible hover:text-white !p-1',
										tab.isActive ? 'hover:bg-button-primary' : ' hover:bg-wrapper-background-hover',
									)}
								>
									<X />
								</Button>
							)}
						</div>
					</div>
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
				Open Tabs
			</Button>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant='blank'
							rounded
							className='hover:bg-button-border-hover aspect-square text-icon-base hover:text-default !p-0 !h-6 mr-2 invisible group-hover:visible'
							iconOnly
							size='sm'
							onClick={() => removeAllTabs(versionId)}
						>
							<XSquare size={16} />
						</Button>
					</TooltipTrigger>
					<TooltipContent>{t('version.close_all_tabs')}</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</ExplorerCollapsibleTrigger>
	);
}
