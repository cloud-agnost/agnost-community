import { Button } from '@/components/Button';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { DataTable } from '@/components/DataTable';
import { TableLoading } from '@/components/Table/Table';
import { PAGE_SIZE } from '@/constants';
import { MessageQueueColumns } from '@/features/queue';
import { useToast } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useMessageQueueStore from '@/store/queue/messageQueueStore';
import { APIError, MessageQueue } from '@/types';
import { Row, Table } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useOutletContext, useParams, useSearchParams } from 'react-router-dom';
interface OutletContext {
	setIsCreateModalOpen: (isOpen: boolean) => void;
	selectedRows: Row<MessageQueue>[];
	setSelectedRows: (rows: Row<MessageQueue>[]) => void;
	table: Table<MessageQueue>;
	setTable: (table: Table<MessageQueue>) => void;
	page: number;
	setPage: (page: number) => void;
}
export default function MainMessageQueue() {
	const {
		getQueues,
		queues,
		isDeleteModalOpen,
		closeDeleteModal,
		lastFetchedCount,
		toDeleteQueue,
		deleteQueue,
		deleteMultipleQueues,
	} = useMessageQueueStore();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<APIError>();
	const { notify } = useToast();
	const canEdit = useAuthorizeVersion('queue.create');
	const [searchParams] = useSearchParams();
	const { t } = useTranslation();
	const { versionId, orgId, appId } = useParams();

	const {
		setSelectedRows,
		setTable,
		page,
		setPage,
		setIsCreateModalOpen,
		table,
		selectedRows,
	}: OutletContext = useOutletContext();

	function deleteQueueHandler() {
		setLoading(true);
		deleteQueue({
			queueId: toDeleteQueue?._id,
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			onSuccess: () => {
				setLoading(false);
				closeDeleteModal();
			},
			onError: (error) => {
				setError(error);
				setLoading(false);
				closeDeleteModal();
			},
		});
	}

	function deleteMultipleQueuesHandler() {
		deleteMultipleQueues({
			queueIds: selectedRows.map((row) => row.original._id),
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

	useEffect(() => {
		if (versionId && orgId && appId) {
			getQueues({
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
		<VersionTabLayout<MessageQueue>
			isEmpty={queues.length === 0}
			title={t('queue.title')}
			type='queue'
			openCreateModal={() => setIsCreateModalOpen(true)}
			createButtonTitle={t('queue.create.title')}
			emptyStateTitle={t('queue.empty_text')}
			table={table}
			selectedRowLength={selectedRows?.length}
			onSearch={() => setPage(0)}
			onMultipleDelete={deleteMultipleQueuesHandler}
			disabled={!canEdit}
			handlerButton={
				<Button variant='secondary' to='logs'>
					{t('queue.view_logs')}
				</Button>
			}
		>
			<InfiniteScroll
				scrollableTarget='version-layout'
				dataLength={queues.length}
				next={() => {
					setPage(page + 1);
				}}
				hasMore={lastFetchedCount >= PAGE_SIZE}
				loader={queues.length > 0 && <TableLoading />}
			>
				<DataTable
					columns={MessageQueueColumns}
					data={queues}
					setSelectedRows={setSelectedRows}
					setTable={setTable}
				/>
			</InfiniteScroll>
			<ConfirmationModal
				loading={loading}
				error={error}
				title={t('queue.delete.title')}
				alertTitle={t('queue.delete.message')}
				alertDescription={t('queue.delete.description')}
				description={
					<Trans
						i18nKey='queue.delete.confirmCode'
						values={{ confirmCode: toDeleteQueue?.iid }}
						components={{
							confirmCode: <span className='font-bold text-default' />,
						}}
					/>
				}
				confirmCode={toDeleteQueue?.iid}
				onConfirm={deleteQueueHandler}
				isOpen={isDeleteModalOpen}
				closeModal={closeDeleteModal}
				closable
			/>
		</VersionTabLayout>
	);
}
