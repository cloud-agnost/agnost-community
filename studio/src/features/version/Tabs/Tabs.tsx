import { Button } from '@/components/Button';
import { InfoModal } from '@/components/InfoModal';
import { TabItem } from '@/features/version/Tabs/index.ts';
import { useStores, useUpdateEffect } from '@/hooks';
import useTabStore from '@/store/version/tabStore.ts';
import useVersionStore from '@/store/version/versionStore';
import { Tab, TabTypes } from '@/types';
import { formatCode, generateId, isElementInViewport, reorder } from '@/utils';
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
import TabControls from './TabControls';
import './tabs.scss';

export default function Tabs() {
	const scrollContainer = useRef<HTMLDivElement>(null);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const {
		getTabsByVersionId,
		addTab,
		setTabs,
		closeMultipleDeleteTabModal,
		removeMultipleTabs,
		closeDeleteTabModal,
		removeTab,
		toDeleteTab,
		toDeleteTabs,
		isMultipleDeleteTabModalOpen,
		isDeleteTabModalOpen,
	} = useTabStore();
	const { getVersionDashboardPath } = useVersionStore();
	const { t } = useTranslation();
	const matches = useMatches();
	const { pathname } = useLocation();
	const { getFunction, STORES } = useStores();
	const { versionId, orgId, appId } = useParams() as {
		versionId: string;
		orgId: string;
		appId: string;
	};

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

	function onDragEnd(result: DropResult) {
		if (!result.destination) return;
		const tabs = getTabsByVersionId(versionId);
		const newTabs = reorder(tabs, result.source.index, result.destination.index);
		setTabs(versionId, newTabs);
	}

	async function handleSaveLogic(tab: Tab) {
		setLoading(true);
		const deleteLogic = getFunction(tab.type, 'deleteLogic');
		const editor = monaco.editor.getEditors()[0];
		const formattedLogic = await formatCode(editor.getValue());
		const setLogic = getFunction(tab.type, 'setLogics');
		const data = STORES[tab.type][tab.type.toLowerCase()];
		setLogic(formattedLogic);
		const saveLogic = getFunction(tab.type, `save${tab.type}Logic`);
		await saveLogic({
			orgId: orgId,
			appId: appId,
			versionId: versionId,
			[`${tab.type.toLowerCase()}Id`]: data._id,
			logic: formattedLogic,
		});
		deleteLogic?.(data._id);
	}

	function handleResetEditorState(tab: Tab) {
		const deleteLogic = getFunction(tab.type, 'deleteLogic');
		const id = tab.path.split('/').slice(-1)[0].split('?')[0];
		const data = STORES[tab.type][`${tab.type.toLowerCase()}s`].find(
			(item: any) => item._id === id,
		);
		deleteLogic(id);
		const uri = window.monaco.Uri.parse(`file:///src/${id}.js`);
		window.monaco.editor.getModel(uri)?.setValue(data.logic);
	}

	function closeMultipleTab() {
		const dirtyTabs = toDeleteTabs.filter((tab) => tab.isDirty);
		dirtyTabs.forEach((tab) => {
			handleResetEditorState(tab);
		});
		removeMultipleTabs(versionId as string, toDeleteTabs);
		closeMultipleDeleteTabModal();
	}

	async function closeAndSaveMultipleTab() {
		const dirtyTabs = toDeleteTabs.filter((tab) => tab.isDirty);
		await Promise.all(dirtyTabs.map(async (tab) => handleSaveLogic(tab)));
		removeMultipleTabs(versionId as string, toDeleteTabs);
		closeMultipleDeleteTabModal();
	}

	function closeTab() {
		handleResetEditorState(toDeleteTab);
		closeDeleteTabModal();
	}

	async function closeAndSaveTab() {
		await handleSaveLogic(toDeleteTab);
		removeTab(versionId as string, toDeleteTab.id);
		closeDeleteTabModal();
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
												<TabItem tab={tab} provided={dragProvided} key={tab.id} />
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
			<TabControls scrollContainer={scrollContainer} />
			<InfoModal
				isOpen={isMultipleDeleteTabModalOpen}
				closeModal={closeMultipleDeleteTabModal}
				onConfirm={closeMultipleTab}
				action={
					<Button variant='secondary' size='lg' onClick={closeAndSaveMultipleTab} loading={loading}>
						{t('general.save_and_close')}
					</Button>
				}
				title={t('general.tab_close_title')}
				description={t('general.tab_close_description_count', {
					count: toDeleteTabs.filter((tab) => tab.isDirty).length,
				})}
			/>
			<InfoModal
				isOpen={isDeleteTabModalOpen}
				closeModal={closeDeleteTabModal}
				onConfirm={closeTab}
				action={
					<Button variant='secondary' size='lg' onClick={closeAndSaveTab} loading={loading}>
						{t('general.save_and_close')}
					</Button>
				}
				title={t('general.tab_close_title')}
				description={t('general.tab_close_description')}
			/>
		</div>
	);
}
