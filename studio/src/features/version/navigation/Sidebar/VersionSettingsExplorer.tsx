import { VERSION_SETTINGS_MENU_ITEMS } from '@/constants';
import useTabStore from '@/store/version/tabStore';
import useUtilsStore from '@/store/version/utilsStore';
import { TabTypes } from '@/types';
import { cn } from '@/utils';
import { useParams } from 'react-router-dom';
import { ExplorerCollapsible, ExplorerCollapsibleTrigger } from './ExplorerCollapsible';
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
		<ExplorerCollapsible
			open={sidebar[versionId]?.openedTabs?.includes(TabTypes.Settings) || false}
			onOpenChange={() => toggleWorkspaceTab(TabTypes.Settings)}
			key={TabTypes.Settings}
			trigger={
				<ExplorerCollapsibleTrigger
					active={sidebar[versionId]?.openedTabs?.includes(TabTypes.Settings) || false}
					title='Settings'
				/>
			}
		>
			{VERSION_SETTINGS_MENU_ITEMS.map((item) => (
				<SideBarButton
					id={item.title}
					key={item.id}
					active={tab.title === item.title}
					onClick={() => handleAddTab(item)}
					asChild
				>
					<span className='flex items-center justify-center text-xl w-6 h-6'>
						<item.icon
							className={cn(tab.title === item.title ? 'text-icon-secondary' : 'text-icon-base')}
						/>
					</span>
					{item.title}
				</SideBarButton>
			))}
		</ExplorerCollapsible>
	);
}
