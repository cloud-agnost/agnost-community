import { Button } from '@/components/Button';
import { NewTabDropdown, TabItem, TabOptionsDropdown } from '@/features/version/Tabs/index.ts';
import { useUpdateEffect } from '@/hooks';
import useTabStore from '@/store/version/tabStore.ts';
import useUtilsStore from '@/store/version/utilsStore';
import useVersionStore from '@/store/version/versionStore';
import { Tab, TabTypes } from '@/types';
import { cn, generateId, isElementInViewport, reorder } from '@/utils';
import { CaretLeft, CaretRight, Sidebar } from '@phosphor-icons/react';
import { NEW_TAB_ITEMS } from 'constants/constants.ts';
import { useEffect, useRef, useState } from 'react';
import {
	DragDropContext,
	Draggable,
	DraggableProvided,
	DropResult,
	Droppable,
	DroppableProvided,
} from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import { useLocation, useMatches, useNavigate, useParams } from 'react-router-dom';
import './tabs.scss';

const SCROLL_AMOUNT = 200;

export default function Tabs() {
	const scrollContainer = useRef<HTMLDivElement>(null);
	const [endOfScroll, setEndOfScroll] = useState(false);
	const [startOfScroll, setStartOfScroll] = useState(false);
	const [isScrollable, setIsScrollable] = useState(false);
	const navigate = useNavigate();
	const { openDeleteTabModal, getTabsByVersionId, removeTab, setCurrentTab, addTab, setTabs } =
		useTabStore();
	const { getVersionDashboardPath } = useVersionStore();
	const { toggleSidebar, isSidebarOpen } = useUtilsStore();
	const { t } = useTranslation();
	const matches = useMatches();
	const { pathname } = useLocation();

	const { versionId } = useParams() as { versionId: string };

	const tabs = getTabsByVersionId(versionId);

	useEffect(() => {
		if (!scrollContainer.current) return;
		setTimeout(() => {
			const selectedTab = scrollContainer?.current?.querySelector('[data-active=true]');
			const firstElement = scrollContainer?.current?.querySelector('.tab-item');
			const sidebar = document.getElementById('side-navigation');
			if (
				selectedTab &&
				!isElementInViewport(selectedTab) &&
				firstElement?.getBoundingClientRect()
			) {
				// if sidebar is open, scroll to the left of the selected tab
				scrollContainer?.current?.scrollBy({
					left:
						selectedTab?.getBoundingClientRect().left -
						firstElement?.getBoundingClientRect()?.width -
						(sidebar?.getBoundingClientRect()?.width ?? 0),
					behavior: 'smooth',
				});
			}
		}, 100);
	}, [tabs]);

	useEffect(() => {
		if (getTabsByVersionId(versionId).find((tab: Tab) => tab.isDashboard)) return;
		addTab(versionId, {
			id: generateId(),
			title: t('version.dashboard.title'),
			path: getDashboardPath(),
			isDashboard: true,
			isActive: false,
			type: TabTypes.Dashboard,
		});
	}, [versionId]);

	useEffect(() => {
		const reset = handleScrollEvent();
		return () => reset?.();
	}, [scrollContainer, tabs]);

	useEffect(() => {
		const path = pathname?.split('/')?.slice(-1)[0];
		const currentTab = tabs.find((tab) => tab.isActive);
		const item = NEW_TAB_ITEMS.find((item) => item.path === path);
		if (currentTab?.path.includes(pathname)) {
			navigate(currentTab?.path);
			return;
		}

		if (item) {
			addTab(versionId, {
				id: generateId(),
				...item,
				isActive: true,
				path: getVersionDashboardPath(item.path),
			});
		}
	}, []);

	useUpdateEffect(() => {
		const currentTab = tabs.find((tab) => tab.isActive);
		if (currentTab?.path !== pathname) {
			const targetPath = currentTab?.path ?? getDashboardPath();
			navigate(targetPath);
		}
	}, [versionId]);

	function getDashboardPath() {
		const matched = matches.slice(-1)[0];
		if (!matched) return '/organization';
		const { appId, orgId, versionId } = matched.params;
		return `/organization/${orgId}/apps/${appId}/version/${versionId}`;
	}

	function handleScrollEvent() {
		const container = scrollContainer.current;
		if (!container) return;

		const handleScroll = () => {
			setIsScrollable(container.scrollWidth > container.clientWidth);
			setEndOfScroll(container.scrollLeft + container.clientWidth >= container.scrollWidth);
			setStartOfScroll(container.scrollLeft === 0);
		};

		handleScroll();

		container.addEventListener('scroll', handleScroll);

		const resizeObserver = new ResizeObserver(() => {
			handleScroll();
		});

		resizeObserver.observe(container);

		return () => {
			container.removeEventListener('scroll', handleScroll);
			resizeObserver.disconnect();
		};
	}

	function tabRemoveHandler(tab: Tab) {
		if (tab.isDirty) {
			openDeleteTabModal(tab);
		} else {
			removeTab(versionId, tab.id);
		}
	}

	function move(type: 'next' | 'prev') {
		const container = scrollContainer.current;
		if (!container) return;

		const scrollAmount = SCROLL_AMOUNT;

		if (type === 'next') {
			container.scrollLeft += scrollAmount;
		} else {
			container.scrollLeft -= scrollAmount;
		}
	}

	function onDragEnd(result: DropResult) {
		if (!result.destination) return;
		const tabs = getTabsByVersionId(versionId);
		const newTabs = reorder(tabs, result.source.index, result.destination.index);
		setTabs(versionId, newTabs);
	}

	return (
		<div className='navigation-tab-container'>
			<div className='max-w-full overflow-auto'>
				<DragDropContext onDragEnd={onDragEnd}>
					<Droppable droppableId='TAB' direction='horizontal'>
						{(dropProvided: DroppableProvided) => (
							<div {...dropProvided.droppableProps} ref={dropProvided.innerRef} className='h-full'>
								<div ref={scrollContainer} className='tab'>
									{tabs.map((tab: Tab, index: number) => (
										<Draggable
											key={tab.id}
											draggableId={tab.id}
											index={index}
											isDragDisabled={tab.isDashboard}
										>
											{(dragProvided: DraggableProvided) => (
												<TabItem
													active={tab.isActive}
													onClose={() => tabRemoveHandler(tab)}
													onClick={() => {
														setCurrentTab(versionId, tab.id);
														history.pushState(
															{
																tabId: tab.id,
																type: 'tabChanged',
															},
															'',
															tab.path,
														);
													}}
													to={tab.path}
													closeable={!tab.isDashboard}
													isDirty={tab.isDirty}
													provided={dragProvided}
													title={tab.title}
													key={tab.id}
													type={tab.type}
												>
													{!tab.isDashboard && <p className='tab-item-link-text'>{tab.title} </p>}
												</TabItem>
											)}
										</Draggable>
									))}
									{dropProvided.placeholder}
								</div>
							</div>
						)}
					</Droppable>
				</DragDropContext>
			</div>
			<div className='tab-control'>
				{isScrollable && (
					<div className='tab-control-item navigation'>
						<Button
							rounded
							variant='blank'
							iconOnly
							onClick={() => move('prev')}
							disabled={startOfScroll}
						>
							<CaretLeft size={15} />
						</Button>
						<Button
							rounded
							variant='blank'
							iconOnly
							onClick={() => move('next')}
							disabled={endOfScroll}
						>
							<CaretRight size={15} />
						</Button>
					</div>
				)}
				<div className={'tab-control-item'}>
					<Button
						rounded
						variant='blank'
						iconOnly
						onClick={toggleSidebar}
						className={cn(isSidebarOpen && 'bg-button-primary/50 rounded-full')}
					>
						<Sidebar size={15} />
					</Button>
				</div>
				<div className='tab-control-item'>
					<NewTabDropdown />
				</div>
				<div className='tab-control-item'>
					<TabOptionsDropdown getDashboardPath={getDashboardPath} />
				</div>
			</div>
		</div>
	);
}
