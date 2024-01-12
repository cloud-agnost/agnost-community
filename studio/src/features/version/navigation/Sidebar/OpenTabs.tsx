import { Button } from '@/components/Button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/Collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/Tooltip';
import { useTabIcon } from '@/hooks';
import useTabStore from '@/store/version/tabStore';
import useUtilsStore from '@/store/version/utilsStore';
import { Tab } from '@/types';
import { cn } from '@/utils';
import { CaretRight, X, XSquare } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import SideBarButton from './SideBarButton';
export default function OpenTabs() {
	const { t } = useTranslation();
	const { versionId } = useParams() as { versionId: string };
	const { getTabsByVersionId, setCurrentTab, openDeleteTabModal, removeTab, removeAllTabs } =
		useTabStore();
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
		<Collapsible
			open={sidebar[versionId]?.openEditor}
			onOpenChange={toggleOpenEditorTab}
			className='w-full'
		>
			<div className='flex items-center hover:bg-wrapper-background-hover group'>
				<CollapsibleTrigger asChild>
					<Button variant='blank' size='sm' iconOnly>
						<CaretRight
							size={16}
							className={cn(
								'transition-transform duration-200',
								sidebar[versionId]?.openEditor && 'rotate-90',
							)}
						/>
					</Button>
				</CollapsibleTrigger>
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
			</div>
			<CollapsibleContent className='pl-6 px-4 overflow-auto max-h-full'>
				{tabs.map((tab) => (
					<div id={tab.id} key={tab.id} className='relative group'>
						<SideBarButton active={tab.isActive} onClick={() => handleClickTabLink(tab)}>
							<div className='flex items-center gap-2'>
								{getTabIcon(tab.type)}
								<h1 title={tab.title} className='truncate'>
									{tab.title}
								</h1>
							</div>
						</SideBarButton>
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
										tab.isActive ? 'bg-button-primary' : ' hover:bg-wrapper-background-hover',
									)}
								>
									<X />
								</Button>
							)}
						</div>
					</div>
				))}
			</CollapsibleContent>
		</Collapsible>
	);
}
