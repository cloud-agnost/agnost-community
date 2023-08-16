import { CreateStorage, EditStorage } from '@/features/storage';
import useStorageStore from '@/store/storage/storageStore';
import { Storage } from '@/types';
import { Row, Table } from '@tanstack/react-table';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
export default function VersionStorage() {
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [selectedRows, setSelectedRows] = useState<Row<Storage>[]>([]);
	const [table, setTable] = useState<Table<Storage>>();
	const [page, setPage] = useState(0);
	const { isEditStorageDialogOpen, closeEditStorageDialog } = useStorageStore();
	return (
		<>
			<CreateStorage open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
			<EditStorage open={isEditStorageDialogOpen} onClose={closeEditStorageDialog} />
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
				}}
			/>
		</>
	);
}
