import { Button } from '@/components/Button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/Collapsible';
import { VERSION_SETTINGS_MENU_ITEMS } from '@/constants';
import useTabStore from '@/store/version/tabStore';
import useUtilsStore from '@/store/version/utilsStore';
import { TabTypes } from '@/types';
import { cn } from '@/utils';
import { CaretRight, GearSix } from '@phosphor-icons/react';
import { useParams } from 'react-router-dom';
import SideBarButton from './SideBarButton';
export default function VersionSettingsExplorer() {
	const { sidebar, toggleWorkspaceTab } = useUtilsStore();
	const { addSettingsTab, updateCurrentTab, getCurrentTab } = useTabStore();
	const { versionId } = useParams() as Record<string, string>;
	const tab = getCurrentTab(versionId);
	function handleAddTab(item: (typeof VERSION_SETTINGS_MENU_ITEMS)[number]) {
		addSettingsTab(versionId, item.href);
		updateCurrentTab(versionId, {
			title: item.title,
		});
	}
	return (
		<Collapsible
			open={sidebar[versionId]?.openedTabs?.includes(TabTypes.Settings)}
			onOpenChange={() => toggleWorkspaceTab(TabTypes.Settings)}
			className='w-full'
			key={TabTypes.Settings}
		>
			<div className='flex items-center justify-between hover:bg-wrapper-background-hover group'>
				<div className='flex items-center'>
					<CollapsibleTrigger asChild>
						<Button variant='blank' size='sm' iconOnly className='font-normal gap-2'>
							<CaretRight
								size={16}
								className={cn(
									'transition-transform duration-200',
									sidebar[versionId]?.openedTabs?.includes(TabTypes.Settings) && 'rotate-90',
								)}
							/>
							<div className='flex items-center justify-center gap-2'>
								<GearSix size={20} className='text-default' />
								Settings
							</div>
						</Button>
					</CollapsibleTrigger>
				</div>
			</div>
			<CollapsibleContent className='pl-6 pr-4'>
				{VERSION_SETTINGS_MENU_ITEMS.map((item) => (
					<SideBarButton
						id={item.title}
						key={item.id}
						active={tab.title === item.title}
						onClick={() => handleAddTab(item)}
					>
						<span className='flex items-center justify-center text-xl w-6 h-6'>
							<item.icon
								className={cn(tab.title === item.title ? 'text-icon-secondary' : 'text-icon-base')}
							/>
						</span>
						{item.title}
					</SideBarButton>
				))}
			</CollapsibleContent>
		</Collapsible>
	);
}
