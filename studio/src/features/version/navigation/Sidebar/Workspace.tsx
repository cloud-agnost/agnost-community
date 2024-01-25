import { Button } from '@/components/Button';
import { InfoModal } from '@/components/InfoModal';
import { NEW_TAB_ITEMS } from '@/constants';
import useCacheStore from '@/store/cache/cacheStore';
import useDatabaseStore from '@/store/database/databaseStore';
import useEndpointStore from '@/store/endpoint/endpointStore';
import useFunctionStore from '@/store/function/functionStore';
import useMiddlewareStore from '@/store/middleware/middlewareStore';
import useMessageQueueStore from '@/store/queue/messageQueueStore';
import useStorageStore from '@/store/storage/storageStore';
import useTaskStore from '@/store/task/taskStore';
import useTabStore from '@/store/version/tabStore';
import useUtilsStore from '@/store/version/utilsStore';
import useVersionStore from '@/store/version/versionStore';
import {
	Cache,
	Database,
	Endpoint,
	HelperFunction,
	MessageQueue,
	Middleware,
	Storage,
	Tab,
	TabTypes,
	Task,
} from '@/types';
import { cn, generateId } from '@/utils';
import { Pencil, Plus, Trash } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { ExplorerCollapsible, ExplorerCollapsibleTrigger } from './ExplorerCollapsible';
import SideBarButton from './SideBarButton';
import { useToast } from '@/hooks';
import { useTabNavigate } from '@/hooks';

type WorkspaceDataType =
	| Endpoint
	| HelperFunction
	| Middleware
	| Storage
	| Database
	| MessageQueue
	| Task
	| Cache;

const STORES: Record<string, any> = {
	[TabTypes.Cache]: useCacheStore.getState(),
	[TabTypes.Task]: useTaskStore.getState(),
	[TabTypes.Database]: useDatabaseStore.getState(),
	[TabTypes.Endpoint]: useEndpointStore.getState(),
	[TabTypes.Function]: useFunctionStore.getState(),
	[TabTypes.MessageQueue]: useMessageQueueStore.getState(),
	[TabTypes.Middleware]: useMiddlewareStore.getState(),
	[TabTypes.Storage]: useStorageStore.getState(),
};

export default function Workspace() {
	const navigate = useTabNavigate();
	const { sidebar, toggleWorkspaceTab } = useUtilsStore();
	const { getVersionDashboardPath } = useVersionStore();
	const { toast } = useToast();
	const { orgId, appId, versionId } = useParams() as Record<string, string>;
	const [toDeleteData, setToDeleteData] = useState<{
		type: TabTypes;
		data: WorkspaceDataType;
	} | null>(null);
	const [openInfoModal, setOpenInfoModal] = useState(false);
	const { t } = useTranslation();
	const { caches, openEditCacheModal } = useCacheStore();
	const { tasks } = useTaskStore();
	const { databases } = useDatabaseStore();
	const { endpoints } = useEndpointStore();
	const { functions } = useFunctionStore();
	const { queues } = useMessageQueueStore();
	const { middlewares } = useMiddlewareStore();
	const { storages } = useStorageStore();

	const data: Record<string, WorkspaceDataType[]> = {
		[TabTypes.Cache]: caches,
		[TabTypes.Task]: tasks,
		[TabTypes.Database]: databases,
		[TabTypes.Endpoint]: endpoints,
		[TabTypes.Function]: functions,
		[TabTypes.MessageQueue]: queues,
		[TabTypes.Middleware]: middlewares,
		[TabTypes.Storage]: storages,
	};

	const { mutateAsync: deleteMutation, isPending } = useMutation({
		mutationFn: handleDeleteMutation,
		onSuccess: () => {
			setOpenInfoModal(false);
			setToDeleteData(null);
		},
		onError: ({ details }) => {
			toast({ action: 'error', title: details });
		},
	});

	function handleDataClick(data: WorkspaceDataType, type: TabTypes) {
		if (type === TabTypes.Cache) {
			openEditCacheModal(data as Cache);
			return;
		}
		let path = `${type.toLowerCase()}/${data._id}`;
		if (type === TabTypes.Database) {
			path = `${path}/models`;
		}

		navigate({
			title: data.name,
			path: getVersionDashboardPath(path),
			isActive: true,
			isDashboard: false,
			type,
		});
	}

	function handleDeleteMutation() {
		if (!toDeleteData) return;
		return STORES[toDeleteData?.type][
			toDeleteData?.type === TabTypes.MessageQueue ? 'deleteQueue' : `delete${toDeleteData?.type}`
		]({
			[toDeleteData?.type === TabTypes.MessageQueue
				? 'queueId'
				: `${toDeleteData?.type.toLowerCase()}Id`]: toDeleteData?.data._id,
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
		});
	}

	function deleteHandler(data: WorkspaceDataType, type: TabTypes) {
		setToDeleteData({
			type,
			data,
		});
		if ([TabTypes.Cache, TabTypes.Database, TabTypes.Storage].includes(type)) {
			STORES[type][`openDelete${type}Modal`](data);
		} else setOpenInfoModal(true);
	}

	function openEditDialog(data: WorkspaceDataType, type: TabTypes) {
		STORES[type][`openEdit${type}Modal`](data);
	}

	function getDeleteTitle(): string {
		if (!toDeleteData) return '';

		if (toDeleteData.type === TabTypes.Middleware)
			return t(`version.${toDeleteData.type.toLowerCase()}.delete.title`);
		return t(`${toDeleteData.type.toLowerCase()}.delete.title`);
	}
	function getDeleteMessage() {
		if (!toDeleteData) return '';
		if (toDeleteData.type === TabTypes.Middleware)
			return t(`version.${toDeleteData.type.toLowerCase()}.delete.message`);
		return t(`${toDeleteData.type.toLowerCase()}.delete.message`);
	}

	useEffect(() => {
		if (sidebar[versionId]?.openedTabs) {
			sidebar[versionId]?.openedTabs?.forEach(async (item) => {
				await STORES[item][`get${item}s`]({
					orgId,
					appId,
					versionId,
					page: 0,
					size: 250,
				});
			});
		}
	}, [appId, versionId]);

	return (
		<>
			{NEW_TAB_ITEMS.sort((a, b) => a.title.localeCompare(b.title)).map((item) => (
				<ExplorerCollapsible
					open={sidebar[versionId]?.openedTabs?.includes(item.type) as boolean}
					onOpenChange={() => toggleWorkspaceTab(item.type)}
					key={item.type}
					trigger={<WorkspaceTrigger item={item} />}
				>
					{data[item.type]?.map((data) => (
						<SideBarButton
							key={data._id}
							id={data._id}
							active={window.location.pathname.includes(data._id)}
							onClick={() => handleDataClick(data, item.type)}
							title={data.name}
							type={item.type}
							actions={
								<div className='flex items-center justify-end'>
									<Button
										variant='icon'
										size='sm'
										rounded
										className={cn(
											window.location.pathname.includes(data._id) &&
												'hover:bg-button-primary text-default',
											'!p-0 !h-5 hidden group-hover:inline-flex',
										)}
										onClick={(e) => {
											e.stopPropagation();
											openEditDialog(data, item.type);
										}}
									>
										<Pencil size={14} />
									</Button>

									<Button
										rounded
										className={cn(
											window.location.pathname.includes(data._id) &&
												'hover:bg-button-primary text-default',
											'p-0 !h-5 hidden group-hover:inline-flex',
										)}
										variant='icon'
										size='sm'
										onClick={() => deleteHandler(data, item.type)}
									>
										<Trash size={14} />
									</Button>
								</div>
							}
						/>
					))}
				</ExplorerCollapsible>
			))}
			<InfoModal
				isOpen={openInfoModal}
				closeModal={() => setOpenInfoModal(false)}
				title={getDeleteTitle()}
				description={getDeleteMessage()}
				onConfirm={deleteMutation}
				loading={isPending}
			/>
		</>
	);
}

function WorkspaceTrigger({ item }: { item: Omit<Tab, 'id'> }) {
	const { toggleWorkspaceTab, sidebar } = useUtilsStore();
	const { addTab } = useTabStore();
	const { getVersionDashboardPath } = useVersionStore();
	const { orgId, appId, versionId } = useParams() as Record<string, string>;

	function handleAddTab(item: (typeof NEW_TAB_ITEMS)[number]) {
		const tab = {
			id: generateId(),
			...item,
			path: getVersionDashboardPath(item.path),
		};
		addTab(versionId, tab);
		toggleWorkspaceTab(item.type);
	}

	return (
		<ExplorerCollapsibleTrigger
			active={sidebar[versionId]?.openedTabs?.includes(item.type) as boolean}
		>
			<Button
				onClick={() => handleAddTab(item)}
				key={item.path}
				className='justify-start w-full text-left font-normal gap-2'
				variant='blank'
				size='sm'
			>
				<h1
					title={item.title}
					className={cn(
						'truncate max-w-[15ch] text-xs text-default font-sfCompact',
						sidebar[versionId]?.openedTabs?.includes(item.type)
							? 'text-default'
							: 'text-subtle group-hover:text-default',
					)}
				>
					{item.title}
				</h1>
			</Button>

			<Button
				variant='icon'
				size='sm'
				rounded
				className='h-full !w-5 p-0.5 mr-2 invisible group-hover:visible'
				onClick={STORES[item.type].toggleCreateModal}
			>
				<Plus className='w-3.5 h-3.5' />
			</Button>
		</ExplorerCollapsibleTrigger>
	);
}
