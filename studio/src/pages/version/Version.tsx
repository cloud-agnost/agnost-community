import { CreateCache, EditCache } from '@/features/cache';
import { CreateDatabase } from '@/features/database';
import { CreateEndpoint } from '@/features/endpoints';
import { CreateFunction } from '@/features/function';
import { CreateMessageQueue } from '@/features/queue';
import { CreateStorage } from '@/features/storage';
import { CreateTask } from '@/features/task';
import { CreateMiddleware } from '@/features/version/Middlewares';
import CommandMenu from '@/features/version/navigation/CommandMenu';
import { VersionLayout } from '@/layouts/VersionLayout';
import useApplicationStore from '@/store/app/applicationStore';
import useCacheStore from '@/store/cache/cacheStore';
import useDatabaseStore from '@/store/database/databaseStore';
import useEndpointStore from '@/store/endpoint/endpointStore';
import useFunctionStore from '@/store/function/functionStore';
import useMiddlewareStore from '@/store/middleware/middlewareStore';
import useMessageQueueStore from '@/store/queue/messageQueueStore';
import useStorageStore from '@/store/storage/storageStore';
import useTaskStore from '@/store/task/taskStore';
import useUtilsStore from '@/store/version/utilsStore';
import useVersionStore from '@/store/version/versionStore.ts';
import { cn, joinChannel } from '@/utils';
import _ from 'lodash';
import { Fragment, useEffect, useState } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';

export default function Version() {
	const { pathname } = useLocation();
	const { getVersionById } = useVersionStore();
	const { toggleSidebar } = useUtilsStore();
	const { getAppById, application } = useApplicationStore();
	const [open, setOpen] = useState(false);
	const paths = pathname.split('/').filter((item) => /^[a-zA-Z-_]+$/.test(item));
	const {
		toggleCreateCacheModal,
		isCreateCacheModalOpen,
		isEditCacheModalOpen,
		closeEditCacheModal,
	} = useCacheStore();
	const { toggleCreateTaskModal, isCreateTaskModalOpen } = useTaskStore();
	const { toggleCreateEndpointDialog, isCreateEndpointDialogOpen } = useEndpointStore();
	const { toggleCreateQueueModal, isCreateQueueModalOpen } = useMessageQueueStore();
	const { toggleCreateStorageDialog, isCreateStorageDialogOpen } = useStorageStore();
	const { toggleCreateFunctionDrawer, isCreateFunctionDrawerOpen } = useFunctionStore();
	const { toggleCreateMiddlewareDrawer, isCreateMiddlewareDrawerOpen } = useMiddlewareStore();
	const { toggleCreateDatabaseDialog, isCreateDatabaseDialogOpen } = useDatabaseStore();
	const { appId, orgId, versionId } = useParams() as Record<string, string>;

	useEffect(() => {
		if (_.isEmpty(application)) {
			getAppById(orgId as string, appId as string);
		} else {
			joinChannel(appId as string);
		}
	}, [appId]);

	useEffect(() => {
		getVersionById({
			appId: appId as string,
			orgId: orgId as string,
			versionId: versionId as string,
		});
	}, [versionId]);

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}

			if (e.key === 'b' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				toggleSidebar();
			}
		};

		document.addEventListener('keydown', down);
		return () => document.removeEventListener('keydown', down);
	}, []);
	return (
		<Fragment>
			<VersionLayout
				className={cn(
					paths.slice(-1).pop(),
					paths.some((p) => p === 'settings') && '!overflow-hidden',
				)}
			>
				<Outlet />
				<CommandMenu open={open} setOpen={setOpen} />
			</VersionLayout>
			<CreateCache open={isCreateCacheModalOpen} onClose={toggleCreateCacheModal} />
			<CreateTask open={isCreateTaskModalOpen} onClose={toggleCreateTaskModal} />
			<CreateEndpoint open={isCreateEndpointDialogOpen} onClose={toggleCreateEndpointDialog} />
			<CreateDatabase open={isCreateDatabaseDialogOpen} onOpenChange={toggleCreateDatabaseDialog} />
			<CreateFunction open={isCreateFunctionDrawerOpen} onClose={toggleCreateFunctionDrawer} />
			<CreateMessageQueue open={isCreateQueueModalOpen} onClose={toggleCreateQueueModal} />
			<CreateStorage open={isCreateStorageDialogOpen} onClose={toggleCreateStorageDialog} />
			<CreateMiddleware
				open={isCreateMiddlewareDrawerOpen}
				onOpenChange={toggleCreateMiddlewareDrawer}
			/>
			<EditCache open={isEditCacheModalOpen} onClose={closeEditCacheModal} />
		</Fragment>
	);
}
