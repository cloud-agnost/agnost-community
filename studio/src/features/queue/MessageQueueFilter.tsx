import { Button } from '@/components/Button';
import { SearchInput } from '@/components/SearchInput';
import { SelectedRowDropdown } from '@/components/Table';
import { useToast } from '@/hooks';
import useMessageQueueStore from '@/store/queue/messageQueueStore';
import { MessageQueue } from '@/types';
import { Plus } from '@phosphor-icons/react';
import { Row, Table } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useParams, useSearchParams } from 'react-router-dom';
interface OutletContextProps {
	table: Table<MessageQueue>;
	selectedRows: Row<MessageQueue>[];
	setPage: (page: number) => void;
	setIsCreateModalOpen: (open: boolean) => void;
}
export default function MessageQueueFilter() {
	const { notify } = useToast();
	const { t } = useTranslation();
	const { deleteMultipleQueues } = useMessageQueueStore();
	const [searchParams, setSearchParams] = useSearchParams();
	const { table, selectedRows, setPage, setIsCreateModalOpen } =
		useOutletContext() as OutletContextProps;
	const { versionId, orgId, appId } = useParams();

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
	return (
		<div className='flex items-center justify-between'>
			<h1 className='text-default text-2xl font-semibold text-center'>{t('queue.title')}</h1>
			<div className='flex items-center justify-center gap-6'>
				<SearchInput
					value={searchParams.get('q') ?? undefined}
					onSearch={onInput}
					className='sm:w-[450px] flex-1'
				/>
				<SelectedRowDropdown<MessageQueue>
					selectedRowLength={selectedRows.length}
					table={table}
					onDelete={deleteMultipleQueuesHandler}
				/>
				<Button variant='primary' onClick={() => setIsCreateModalOpen(true)}>
					<Plus size={16} />
					<span className='ml-2'>{t('queue.create.title')}</span>
				</Button>
			</div>
		</div>
	);
}
