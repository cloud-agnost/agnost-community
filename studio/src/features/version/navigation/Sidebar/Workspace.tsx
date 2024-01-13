import { Button } from '@/components/Button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/Collapsible';
import { NEW_TAB_ITEMS } from '@/constants';
import { useTabIcon } from '@/hooks';
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
	BaseGetRequest,
	BaseParams,
	Database,
	Endpoint,
	MessageQueue,
	Middleware,
	TabTypes,
	Task,
	Cache,
	HelperFunction,
	Storage,
} from '@/types';
import { cn, generateId } from '@/utils';
import { CaretRight, Plus } from '@phosphor-icons/react';
import { useParams } from 'react-router-dom';
import SideBarButton from './SideBarButton';
import { useEffect } from 'react';

type WorkspaceDataType =
	| Endpoint
	| HelperFunction
	| Middleware
	| Storage
	| Database
	| MessageQueue
	| Task
	| Cache;

export default function Workspace() {
	const { sidebar, toggleWorkspaceTab } = useUtilsStore();
	const { getVersionDashboardPath } = useVersionStore();
	const { addTab } = useTabStore();
	const { orgId, appId, versionId } = useParams() as Record<string, string>;
	const getIcon = useTabIcon('w-5 h-5');
	const { caches, getCaches, toggleCreateCacheModal, openEditCacheModal } = useCacheStore();
	const { tasks, getTasks, toggleCreateTaskModal } = useTaskStore();
	const { databases, getDatabasesOfApp, toggleCreateDatabaseDialog } = useDatabaseStore();
	const { endpoints, getEndpoints, toggleCreateEndpointDialog } = useEndpointStore();
	const { functions, getFunctionsOfAppVersion, toggleCreateFunctionDrawer } = useFunctionStore();
	const { queues, getQueues, toggleCreateQueueModal } = useMessageQueueStore();
	const { middlewares, getMiddlewaresOfAppVersion, toggleCreateMiddlewareDrawer } =
		useMiddlewareStore();
	const { storages, getStorages, toggleCreateStorageDialog } = useStorageStore();

	const getMethods: Record<string, (params: BaseParams & BaseGetRequest) => unknown> = {
		[TabTypes.Cache]: getCaches,
		[TabTypes.Task]: getTasks,
		[TabTypes.Database]: getDatabasesOfApp,
		[TabTypes.Endpoint]: getEndpoints,
		[TabTypes.Function]: getFunctionsOfAppVersion,
		[TabTypes.MessageQueue]: getQueues,
		[TabTypes.Middleware]: getMiddlewaresOfAppVersion,
		[TabTypes.Storage]: getStorages,
	};

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

	const openCreateModal: Record<string, () => void> = {
		[TabTypes.Cache]: toggleCreateCacheModal,
		[TabTypes.Task]: toggleCreateTaskModal,
		[TabTypes.Database]: toggleCreateDatabaseDialog,
		[TabTypes.Endpoint]: toggleCreateEndpointDialog,
		[TabTypes.Function]: toggleCreateFunctionDrawer,
		[TabTypes.MessageQueue]: toggleCreateQueueModal,
		[TabTypes.Middleware]: toggleCreateMiddlewareDrawer,
		[TabTypes.Storage]: toggleCreateStorageDialog,
	};

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
		await getMethods[type]({
			orgId,
			appId,
			versionId,
			page: 0,
			size: 100,
		});
	}

	function handleDataClick(data: WorkspaceDataType, type: TabTypes) {
		if (type === TabTypes.Cache) {
			openEditCacheModal(data as Cache);
			return;
		}
		let path = `${type.toLowerCase()}/${data._id}`;
		if (type === TabTypes.MessageQueue) path = `queue/${data._id}`;
		if (type === TabTypes.Database) path = `${path}/models`;
		console.log(path);
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

	useEffect(() => {
		NEW_TAB_ITEMS.forEach(async (item) => {
			await getData(item.type);
		});
	}, []);
	return NEW_TAB_ITEMS.sort((a, b) => a.title.localeCompare(b.title)).map((item) => (
		<Collapsible
			open={sidebar[versionId]?.openedTabs?.includes(item.type)}
			onOpenChange={() => toggleWorkspaceTab(item.type)}
			className='w-full'
			key={item.type}
		>
			<div className='flex items-center justify-between hover:bg-wrapper-background-hover group'>
				<div className='flex items-center flex-1'>
					<CollapsibleTrigger asChild>
						<Button variant='blank' size='sm' iconOnly onClick={() => getData(item.type)}>
							<CaretRight
								size={16}
								className={cn(
									'transition-transform duration-200',
									sidebar[versionId]?.openedTabs?.includes(item.type) && 'rotate-90',
								)}
							/>
						</Button>
					</CollapsibleTrigger>
					<Button
						onClick={() => handleAddTab(item)}
						key={item.path}
						className='justify-start w-full text-left font-normal gap-2'
						variant='blank'
					>
						{getIcon(item.type)}
						<h1
							title={item.title}
							className='truncate max-w-[15ch] text-sm text-default font-sfCompact'
						>
							{item.title}
						</h1>
					</Button>
				</div>
				<Button
					variant='blank'
					size='sm'
					iconOnly
					className='hover:bg-button-border-hover aspect-square text-icon-base hover:text-default !p-0 !h-6 mr-2 invisible group-hover:visible rounded-full'
					onClick={openCreateModal[item.type]}
				>
					<Plus size={16} />
				</Button>
			</div>
			<CollapsibleContent className='pl-6 pr-4'>
				{data[item.type as TabTypes]?.map((data) => (
					<SideBarButton
						id={data._id}
						key={data._id}
						className={cn(!window.location.pathname.includes(data._id) && '[&>svg]:!text-subtle')}
						active={window.location.pathname.includes(data._id)}
						onClick={() => handleDataClick(data, item.type)}
					>
						{getIcon(item.type)}
						<h1 title={data.name} className='flex-1 truncate'>
							{data.name}
						</h1>
					</SideBarButton>
				))}
			</CollapsibleContent>
		</Collapsible>
	));
}
