import { CreateMessageQueue, EditMessageQueue } from '@/features/queue';
import { MessageQueue } from '@/types';
import { Row, Table } from '@tanstack/react-table';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
export default function VersionQueue() {
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isQueueEditModalOpen, setIsQueueEditModalOpen] = useState(false);
	const [selectedRows, setSelectedRows] = useState<Row<MessageQueue>[]>([]);
	const [table, setTable] = useState<Table<MessageQueue>>();
	const [page, setPage] = useState(0);
	return (
		<>
			<CreateMessageQueue open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
			<EditMessageQueue
				open={isQueueEditModalOpen}
				onClose={() => setIsQueueEditModalOpen(false)}
			/>
			<Outlet
				context={{
					isCreateModalOpen,
					setIsCreateModalOpen,
					selectedRows,
					setSelectedRows,
					table,
					setTable,
					page,
					setPage,
					isQueueEditModalOpen,
					setIsQueueEditModalOpen,
				}}
			/>
		</>
	);
}
