import { Button } from '@/components/Button';
import { InfoModal } from '@/components/InfoModal';
import { Pencil } from '@/components/icons';
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
import { Plus, Trash } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { ExplorerCollapsible, ExplorerCollapsibleTrigger } from './ExplorerCollapsible';
import SideBarButton from './SideBarButton';
import { useToast } from '@/hooks';
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
	const { sidebar, toggleWorkspaceTab } = useUtilsStore();
	const { getVersionDashboardPath } = useVersionStore();
	const { addTab } = useTabStore();
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
		if (type === TabTypes.MessageQueue) path = `queue/${data._id}`;
		if (type === TabTypes.Database) path = `${path}/models`;
		const tab = {
			id: generateId(),
			title: data.name,
			path: getVersionDashboardPath(path),
			isActive: true,
			isDashboard: false,
			type,
		};
		addTab(versionId, tab);
	}

	function handleDeleteMutation() {
		if (!toDeleteData) return;
		return STORES[toDeleteData?.type][
			toDeleteData?.type === TabTypes.Queue ? 'deleteQueue' : `delete${toDeleteData?.type}`
		]({
			[toDeleteData?.type === TabTypes.Queue ? 'queueId' : `${toDeleteData?.type.toLowerCase()}Id`]:
				toDeleteData?.data._id,
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
		const mt = type === TabTypes.MessageQueue ? 'Queue' : type;
		STORES[type][`openEdit${mt}Modal`](data);
	}

	return (
		<>
			{NEW_TAB_ITEMS.sort((a, b) => a.title.localeCompare(b.title)).map((item) => (
				<ExplorerCollapsible
					open={sidebar[versionId]?.openedTabs?.includes(item.type) as boolean}
					onOpenChange={() => toggleWorkspaceTab(item.type)}
					key={item.type}
					trigger={<WorkspaceTrigger item={item} />}
				>
					{data[item.type as TabTypes]?.map((data) => (
						<div
							id={data._id}
							key={data._id}
							className={cn(
								'flex items-center justify-between group w-full',
								window.location.pathname.includes(data._id)
									? 'bg-button-primary/50'
									: 'hover:bg-wrapper-background-hover',
							)}
						>
							<SideBarButton
								active={window.location.pathname.includes(data._id)}
								onClick={() => handleDataClick(data, item.type)}
								title={data.name}
								type={item.type}
								className='!bg-transparent'
							/>
							<div className='flex items-center justify-end'>
								<Button
									iconOnly
									variant='blank'
									rounded
									className={cn(
										window.location.pathname.includes(data._id)
											? 'hover:bg-button-primary'
											: 'hover:bg-subtle',
										'aspect-square text-icon-base hover:text-default !p-0 !h-6 mr-2 invisible group-hover:visible rounded-full',
									)}
									onClick={() => openEditDialog(data, item.type)}
								>
									<Pencil className='w-4 h-4 text-default' />
								</Button>

								<Button
									variant='blank'
									rounded
									className={cn(
										window.location.pathname.includes(data._id)
											? 'hover:bg-button-primary'
											: 'hover:bg-subtle',
										'aspect-square text-icon-base hover:text-default !p-0 !h-6 mr-2 invisible group-hover:visible rounded-full',
									)}
									iconOnly
									onClick={() => deleteHandler(data, item.type)}
								>
									<Trash size={16} className='text-default' />
								</Button>
							</div>
						</div>
					))}
				</ExplorerCollapsible>
			))}
			<InfoModal
				isOpen={openInfoModal}
				closeModal={() => setOpenInfoModal(false)}
				title={t('general.multiDelete')}
				description={t('general.deleteDescription')}
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

	async function getData(type: TabTypes) {
		const mt = type === TabTypes.MessageQueue ? 'getQueues' : `get${type}s`;
		await STORES[type][mt]({
			orgId,
			appId,
			versionId,
			page: 0,
			size: 100,
		});
	}

	useEffect(() => {
		//TODO? check
		NEW_TAB_ITEMS.forEach(async (item) => {
			await getData(item.type);
		});
	}, []);
	return (
		<ExplorerCollapsibleTrigger
			active={sidebar[versionId]?.openedTabs?.includes(item.type) as boolean}
		>
			<Button
				onClick={() => handleAddTab(item)}
				key={item.path}
				className='justify-start w-full text-left font-normal gap-2'
				variant='blank'
			>
				<h1
					title={item.title}
					className='truncate max-w-[15ch] text-sm text-default font-sfCompact'
				>
					{item.title}
				</h1>
			</Button>

			<Button
				variant='blank'
				size='sm'
				iconOnly
				className='hover:bg-button-border-hover aspect-square text-icon-base hover:text-default !p-0 !h-6 mr-2 invisible group-hover:visible rounded-full'
				onClick={STORES[item.type].toggleCreateModal}
			>
				<Plus size={16} />
			</Button>
		</ExplorerCollapsibleTrigger>
	);
}
