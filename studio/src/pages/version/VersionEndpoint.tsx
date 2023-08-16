import { Outlet } from 'react-router-dom';
import { CreateEndpoint, EditEndpointDrawer } from '@/features/endpoints';
import { useState } from 'react';
import { Endpoint } from '@/types';
import { Row, Table } from '@tanstack/react-table';
export default function VersionEndpoint() {
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isEditEndpointOpen, setIsEditEndpointOpen] = useState(false);
	const [selectedRows, setSelectedRows] = useState<Row<Endpoint>[]>([]);
	const [table, setTable] = useState<Table<Endpoint>>();
	const [page, setPage] = useState(0);
	return (
		<>
			<CreateEndpoint open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
			<EditEndpointDrawer open={isEditEndpointOpen} onClose={() => setIsEditEndpointOpen(false)} />
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
					isEditEndpointOpen,
					setIsEditEndpointOpen,
				}}
			/>
		</>
	);
}
