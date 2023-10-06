import { ConfirmationModal } from '@/components/ConfirmationModal';
import { DataTable } from '@/components/DataTable';
import { TableLoading } from '@/components/Table/Table';
import { EmptyTask } from '@/components/icons';
import { PAGE_SIZE } from '@/constants';
import { TaskColumns } from '@/features/task';
import { useToast } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useTaskStore from '@/store/task/taskStore';
import { APIError, Task } from '@/types';
import { Row, Table } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useOutletContext, useParams, useSearchParams } from 'react-router-dom';
interface OutletContext {
	setIsCreateModalOpen: (isOpen: boolean) => void;
	setSelectedRows: (rows: Row<Task>[]) => void;
	setTable: (table: Table<Task>) => void;
	page: number;
	setPage: (page: number) => void;
	table: Table<Task>;
	selectedRows: Row<Task>[];
}

export default function MainTask() {
	const { t } = useTranslation();
	const { notify } = useToast();
	const canEdit = useAuthorizeVersion('task.create');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<APIError>();
	const {
		tasks,
		getTasks,
		lastFetchedCount,
		deleteMultipleTasks,
		toDeleteTask,
		isDeleteTaskModalOpen,
		deleteTask,
		closeDeleteTaskModal,
	} = useTaskStore();
	const { versionId, orgId, appId } = useParams();
	const [searchParams, setSearchParams] = useSearchParams();
	const {
		setSelectedRows,
		setTable,
		page,
		setPage,
		setIsCreateModalOpen,
		table,
		selectedRows,
	}: OutletContext = useOutletContext();

	function onInput(value: string) {
		value = value.trim();
		if (!value) {
			searchParams.delete('q');
			setSearchParams(searchParams);
			return;
		}
		setPage(0);
		setSearchParams({ ...searchParams, q: value });
	}

	function deleteMultipleTasksHandler() {
		deleteMultipleTasks({
			taskIds: selectedRows.map((row) => row.original._id),
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			onSuccess: () => {
				table.toggleAllRowsSelected(false);
				setPage(0);
			},
			onError: ({ error, details }) => {
				notify({ type: 'error', description: details, title: error });
			},
		});
	}
	function deleteTaskHandler() {
		setLoading(true);
		deleteTask({
			taskId: toDeleteTask?._id as string,
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			onSuccess: () => {
				setLoading(false);
				closeDeleteTaskModal();
			},
			onError: (error) => {
				setError(error);
				setLoading(false);
				closeDeleteTaskModal();
			},
		});
	}

	useEffect(() => {
		if (versionId && orgId && appId) {
			getTasks({
				orgId,
				appId,
				versionId,
				page,
				size: PAGE_SIZE,
				search: searchParams.get('q') ?? undefined,
				initialFetch: page === 0,
			});
		}
	}, [searchParams.get('q'), page]);

	return (
		<VersionTabLayout
			icon={<EmptyTask className='w-44 h-44' />}
			title={t('task.title')}
			createButtonTitle={t('task.add')}
			emptyStateTitle={t('task.empty_text')}
			isEmpty={!tasks.length}
			openCreateModal={() => {
				setIsCreateModalOpen(true);
			}}
			onMultipleDelete={deleteMultipleTasksHandler}
			onSearch={onInput}
			table={table}
			selectedRowLength={selectedRows.length}
			disabled={!canEdit}
			viewLogs
		>
			<InfiniteScroll
				scrollableTarget='version-layout'
				dataLength={tasks.length}
				next={() => setPage(page + 1)}
				hasMore={lastFetchedCount >= PAGE_SIZE}
				loader={tasks.length > 0 && <TableLoading />}
			>
				<DataTable<Task>
					data={tasks}
					columns={TaskColumns}
					setSelectedRows={setSelectedRows}
					setTable={setTable}
				/>
			</InfiniteScroll>
			<ConfirmationModal
				loading={loading}
				error={error}
				title={t('task.delete.title')}
				alertTitle={t('task.delete.message')}
				alertDescription={t('task.delete.description')}
				description={
					<Trans
						i18nKey='task.delete.confirmCode'
						values={{ confirmCode: toDeleteTask?.iid }}
						components={{
							confirmCode: <span className='font-bold text-default' />,
						}}
					/>
				}
				confirmCode={toDeleteTask?.iid as string}
				onConfirm={deleteTaskHandler}
				isOpen={isDeleteTaskModalOpen}
				closeModal={closeDeleteTaskModal}
				closable
			/>
		</VersionTabLayout>
	);
}
