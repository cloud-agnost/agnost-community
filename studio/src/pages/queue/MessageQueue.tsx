import { Button } from '@/components/Button';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { TableLoading } from '@/components/Table/Table';
import { EmptyQueue } from '@/components/icons';
import { PAGE_SIZE } from '@/constants';
import { MessageQueueColumns, MessageQueueFilter } from '@/features/queue';
import useMessageQueueStore from '@/store/queue/messageQueueStore';
import { APIError, MessageQueue } from '@/types';
import { cn } from '@/utils';
import { Plus } from '@phosphor-icons/react';
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
	} = useMessageQueueStore();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<APIError>();

	const [searchParams] = useSearchParams();
	const { t } = useTranslation();
	const { versionId, orgId, appId } = useParams();

	const { setSelectedRows, setTable, page, setPage, setIsCreateModalOpen } =
		useOutletContext() as OutletContext;

	function deleteQueueHandler() {
		setLoading(true);
		deleteQueue({
			queueId: toDeleteQueue?._id as string,
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
		<div className={cn(queues.length === 0 && 'flex flex-col items-center justify-center h-[80%]')}>
			{queues.length === 0 ? (
				<EmptyState title={t('queue.empty_text')} icon={<EmptyQueue className='w-44 h-44' />}>
					<Button onClick={() => setIsCreateModalOpen(true)}>
						<Plus size={16} className='mr-2' weight='bold' />
						{t('queue.create.title')}
					</Button>
				</EmptyState>
			) : (
				<div className='space-y-6'>
					<MessageQueueFilter />
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
						confirmCode={toDeleteQueue?.iid as string}
						onConfirm={deleteQueueHandler}
						isOpen={isDeleteModalOpen}
						closeModal={closeDeleteModal}
						closable
					/>
				</div>
			)}
		</div>
	);
}
