import { Button } from '@/components/Button';
import { useTabIcon } from '@/hooks';
import useTabStore from '@/store/version/tabStore';
import useUtilsStore from '@/store/version/utilsStore';
import { Tab } from '@/types';
import { cn } from '@/utils';
import { X } from '@phosphor-icons/react';
import { DraggableProvided } from 'react-beautiful-dnd';
import { Link, useParams } from 'react-router-dom';
interface TabItemProps {
	provided: DraggableProvided;
	tab: Tab;
}

export default function TabItem({ provided, tab, ...props }: TabItemProps) {
	const { versionId } = useParams() as { versionId: string };
	const { removeTab, setCurrentTab, openDeleteTabModal } = useTabStore();
	function close() {
		if (tab.isDirty) {
			openDeleteTabModal(tab);
		} else {
			removeTab(versionId, tab.id);
		}
	}

	function onClick() {
		setCurrentTab(versionId, tab.id);
		history.pushState(
			{
				tabId: tab.id,
				type: 'tabChanged',
			},
			'',
			tab.path,
		);
	}
	const getTabIcon = useTabIcon('w-3.5 h-3.5');
	const { isSidebarOpen } = useUtilsStore();
	return (
		<div
			className={cn(
				'tab-item icon border-x border-border',
				isSidebarOpen && 'border-l-0',
				tab.isDashboard && 'closeable',
				tab.isActive && 'active',
			)}
			{...props}
			{...provided.draggableProps}
			{...provided.dragHandleProps}
			ref={provided.innerRef}
			title={tab.title}
			{...(tab.isActive && { 'data-active': true })}
		>
			<Link title={tab.title} className={cn('tab-item-link')} onClick={onClick} to={tab.path}>
				<div className='flex items-center gap-2'>
					{getTabIcon(tab.type)}
					{!tab.isDashboard && <p className='tab-item-link-text'>{tab.title} </p>}
				</div>
			</Link>
			<div className='tab-item-close group relative'>
				{tab.isDirty && (
					<span className='text-default rounded-full bg-base-reverse w-2 h-2 absolute group-hover:invisible' />
				)}
				{!tab.isDashboard && (
					<Button rounded variant='icon' size='sm' onClick={close} className='!h-[unset] !p-1'>
						<X size={12} />
					</Button>
				)}
			</div>
		</div>
	);
}
