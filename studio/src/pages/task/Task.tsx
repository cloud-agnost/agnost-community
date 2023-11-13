import { DataTable } from '@/components/DataTable';
import { TableLoading } from '@/components/Table/Table';
import { CreateTask, TaskColumns } from '@/features/task';
import { useInfiniteScroll, useTable, useToast } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useTaskStore from '@/store/task/taskStore';
import { APIError, Task } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams } from 'react-router-dom';

export default function MainTask() {
	const { t } = useTranslation();
	const { notify } = useToast();
	const canEdit = useAuthorizeVersion('task.create');
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	const { tasks, getTasks, lastFetchedPage, deleteMultipleTasks } = useTaskStore();
	const { versionId, orgId, appId } = useParams();

	const { hasNextPage, fetchNextPage, isFetching, isFetchingNextPage } = useInfiniteScroll({
		queryFn: getTasks,
		lastFetchedPage,
		dataLength: tasks.length,
		queryKey: 'getTasks',
	});

	const table = useTable({
		data: tasks,
		columns: TaskColumns,
	});

	const { mutateAsync: deleteMultipleTasksMutation } = useMutation({
		mutationFn: deleteMultipleTasks,
		onSuccess: () => {
			table?.resetRowSelection();
		},
		onError: ({ error, details }: APIError) => {
			notify({ type: 'error', description: details, title: error });
		},
	});

	function deleteMultipleTasksHandler() {
		deleteMultipleTasksMutation({
			taskIds: table.getSelectedRowModel().rows.map((row) => row.original._id),
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
		});
	}
	return (
		<>
			<VersionTabLayout
				type='task'
				title={t('task.title')}
				createButtonTitle={t('task.add')}
				emptyStateTitle={t('task.empty_text')}
				isEmpty={!tasks.length}
				openCreateModal={() => setIsCreateModalOpen(true)}
				onMultipleDelete={deleteMultipleTasksHandler}
				table={table}
				disabled={!canEdit}
				loading={isFetching && !tasks.length}
			>
				<InfiniteScroll
					scrollableTarget='version-layout'
					dataLength={tasks.length}
					next={fetchNextPage}
					hasMore={hasNextPage}
					loader={isFetchingNextPage && <TableLoading />}
				>
					<DataTable<Task> table={table} />
				</InfiniteScroll>
			</VersionTabLayout>
			<CreateTask open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
		</>
	);
}
