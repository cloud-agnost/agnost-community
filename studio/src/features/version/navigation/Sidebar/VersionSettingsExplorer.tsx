import { VERSION_SETTINGS_MENU_ITEMS } from '@/constants';
import useTabStore from '@/store/version/tabStore';
import useUtilsStore from '@/store/version/utilsStore';
import { TabTypes } from '@/types';
import { cn, generateId } from '@/utils';
import { useParams } from 'react-router-dom';
import { ExplorerCollapsible, ExplorerCollapsibleTrigger } from './ExplorerCollapsible';
import SideBarButton from './SideBarButton';
import { useTabIcon } from '@/hooks';
import useVersionStore from '@/store/version/versionStore';
export default function VersionSettingsExplorer() {
	const { sidebar, toggleWorkspaceTab } = useUtilsStore();
	const { addTab, getCurrentTab } = useTabStore();
	const { getVersionDashboardPath } = useVersionStore();
	const { versionId } = useParams() as Record<string, string>;
	const tab = getCurrentTab(versionId);
	function handleAddTab(item: (typeof VERSION_SETTINGS_MENU_ITEMS)[number]) {
		addTab(versionId, {
			title: item.title,
			path: getVersionDashboardPath(`settings/${item.href}`),
			id: generateId(),
			isActive: false,
			isDashboard: false,
			type: item.type,
		});
	}
	const getIcon = useTabIcon('w-3.5 h-3.5');
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
					<div
						className={cn(
							'flex-1/2',
							tab.title === item.title
								? 'text-icon-secondary'
								: 'text-subtle group-hover:text-default',
						)}
					>
						{getIcon(item.type)}
					</div>
					<p
						className={cn(
							'truncate',
							tab.title === item.title ? 'text-default' : 'text-subtle group-hover:text-default',
						)}
					>
						{item.title}
					</p>
				</SideBarButton>
			))}
		</ExplorerCollapsible>
	);
}
