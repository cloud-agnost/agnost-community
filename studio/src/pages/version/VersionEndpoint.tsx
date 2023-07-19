import { DataTable } from '@/components/DataTable';
import { TableLoading } from '@/components/Table/Table';
import { PAGE_SIZE } from '@/constants';
import { EndpointFilter, EndpointColumns, CreateEndpoint } from '@/features/endpoints';
import useEndpointStore from '@/store/endpoint/endpointStore';
import { Endpoint } from '@/types';
import { Row, Table } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams, useSearchParams } from 'react-router-dom';

export default function VersionDatabase() {
	const [openCreateModal, setOpenCreateModal] = useState(false);
	const [page, setPage] = useState(0);
	const { endpoints, lastFetchedCount, getEndpoints } = useEndpointStore();
	const [searchParams] = useSearchParams();
	const [selectedRows, setSelectedRows] = useState<Row<Endpoint>[]>([]);
	const [table, setTable] = useState<Table<any>>();
	const { versionId, orgId, appId } = useParams();

	useEffect(() => {
		if (versionId && orgId && appId) {
			getEndpoints({
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
		<div className='p-4 space-y-4'>
			<EndpointFilter
				table={table as Table<any>}
				selectedRows={selectedRows}
				setPage={setPage}
				setOpenCreateModal={setOpenCreateModal}
			/>
			<InfiniteScroll
				scrollableTarget='version-layout'
				dataLength={endpoints.length}
				next={() => {
					setPage(page + 1);
				}}
				hasMore={lastFetchedCount >= PAGE_SIZE}
				loader={endpoints.length > 0 && <TableLoading />}
			>
				<DataTable
					columns={EndpointColumns}
					data={endpoints}
					setSelectedRows={setSelectedRows}
					setTable={setTable}
				/>
			</InfiniteScroll>
			<CreateEndpoint open={openCreateModal} onClose={() => setOpenCreateModal(false)} />
		</div>
	);
}
