import { Task } from '@/types';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Table, Row } from '@tanstack/react-table';
import CreateTask from '@/features/task/CreateTask';
import EditTask from '@/features/task/EditTask';
export default function VersionTask() {
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
	const [selectedRows, setSelectedRows] = useState<Row<Task>[]>([]);
	const [table, setTable] = useState<Table<Task>>();
	const [page, setPage] = useState(0);
	return (
		<>
			<CreateTask open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
			<EditTask open={isEditTaskOpen} onClose={() => setIsEditTaskOpen(false)} />
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
					isEditTaskOpen,
					setIsEditTaskOpen,
				}}
			/>
		</>
	);
}
