import { CreateStorage, EditStorage, CreateBucket } from '@/features/storage';
import EditBucket from '@/features/storage/EditBucket';
import useStorageStore from '@/store/storage/storageStore';
import { Bucket, Storage } from '@/types';
import { Row, Table } from '@tanstack/react-table';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
export default function VersionStorage() {
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [selectedRows, setSelectedRows] = useState<Row<Storage>[]>([]);
	const [table, setTable] = useState<Table<Storage>>();
	const [page, setPage] = useState(0);
	const {
		isEditStorageDialogOpen,
		closeEditStorageDialog,
		isEditBucketDialogOpen,
		closeEditBucketDialog,
	} = useStorageStore();
	const [bucketTable, setBucketTable] = useState<Table<Bucket>>();
	const [isBucketCreateOpen, setIsBucketCreateOpen] = useState(false);
	const [selectedBuckets, setSelectedBuckets] = useState<Row<Bucket>[]>([]);
	const [bucketPage, setBucketPage] = useState(1);
	return (
		<>
			<CreateBucket open={isBucketCreateOpen} onClose={() => setIsBucketCreateOpen(false)} />
			<CreateStorage open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
			<EditStorage open={isEditStorageDialogOpen} onClose={closeEditStorageDialog} />
			<EditBucket open={isEditBucketDialogOpen} onClose={closeEditBucketDialog} />

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
					bucketTable,
					setBucketTable,
					isBucketCreateOpen,
					setIsBucketCreateOpen,
					selectedBuckets,
					setSelectedBuckets,
					bucketPage,
					setBucketPage,
				}}
			/>
		</>
	);
}
