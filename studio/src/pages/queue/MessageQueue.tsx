import { Button } from '@/components/Button';
import { DataTable } from '@/components/DataTable';
import { TableLoading } from '@/components/Table/Table';
import { CreateMessageQueue, MessageQueueColumns } from '@/features/queue';
import { useInfiniteScroll, useTable, useToast } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useEnvironmentStore from '@/store/environment/environmentStore';
import useMessageQueueStore from '@/store/queue/messageQueueStore';
import useTabStore from '@/store/version/tabStore';
import useVersionStore from '@/store/version/versionStore';
import { APIError, MessageQueue, TabTypes } from '@/types';
import { generateId } from '@/utils';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams } from 'react-router-dom';

export default function MainMessageQueue() {
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const { addTab } = useTabStore();
	const { getVersionDashboardPath } = useVersionStore();
	const { getQueues, queues, lastFetchedPage, deleteMultipleQueues } = useMessageQueueStore();
	const { toast } = useToast();
	const canEdit = useAuthorizeVersion('queue.create');
	const { t } = useTranslation();
	const { versionId, orgId, appId } = useParams();
	const table = useTable({
		columns: MessageQueueColumns,
		data: queues,
	});
	const { getEnvironmentResources, environment } = useEnvironmentStore();
	const { mutateAsync: deleteMultipleQueueMutation } = useMutation({
		mutationFn: deleteMultipleQueues,
		onSuccess: () => {
			getEnvironmentResources({
				orgId: environment?.orgId,
				appId: environment?.appId,
				envId: environment?._id,
				versionId: environment?.versionId,
			});
			table?.resetRowSelection();
		},
		onError: ({ details }: APIError) => {
			toast({ action: 'error', title: details });
		},
	});

	function deleteMultipleQueuesHandler() {
		deleteMultipleQueueMutation({
			queueIds: table.getSelectedRowModel().rows.map((row) => row.original._id),
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
		});
	}

	const { fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } = useInfiniteScroll({
		queryFn: getQueues,
		lastFetchedPage,
		queryKey: 'queues',
		dataLength: queues.length,
	});

	function openLogTab() {
		addTab(versionId as string, {
			id: generateId(),
			title: t('queue.logs'),
			path: getVersionDashboardPath('queue/logs'),
			isActive: true,
			isDashboard: false,
			type: TabTypes.MessageQueue,
		});
	}
	return (
		<>
			<VersionTabLayout<MessageQueue>
				searchable
				isEmpty={queues.length === 0}
				title={t('queue.title') as string}
				type='queue'
				openCreateModal={() => setIsCreateModalOpen(true)}
				createButtonTitle={t('queue.create.title')}
				emptyStateTitle={t('queue.empty_text')}
				table={table}
				onMultipleDelete={deleteMultipleQueuesHandler}
				disabled={!canEdit}
				loading={isFetching && !queues.length}
				handlerButton={
					<Button variant='secondary' onClick={openLogTab}>
						{t('queue.view_logs')}
					</Button>
				}
			>
				<InfiniteScroll
					scrollableTarget='version-layout'
					dataLength={queues.length}
					next={fetchNextPage}
					hasMore={hasNextPage}
					loader={isFetchingNextPage && <TableLoading />}
				>
					<DataTable table={table} />
				</InfiniteScroll>
			</VersionTabLayout>
			<CreateMessageQueue open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
		</>
	);
}
