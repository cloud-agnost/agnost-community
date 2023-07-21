import { DataTable } from '@/components/DataTable';
import { TableLoading } from '@/components/Table/Table';
import { PAGE_SIZE } from '@/constants';
import { EndpointColumns, EndpointFilter } from '@/features/endpoints';
import useEndpointStore from '@/store/endpoint/endpointStore';
import { useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { Endpoint } from '@/types';
import { Row, Table } from '@tanstack/react-table';

interface OutletContext {
	setIsCreateModalOpen: (isOpen: boolean) => void;
	selectedRows: Row<Endpoint>[];
	setSelectedRows: (rows: Row<Endpoint>[]) => void;
	table: Table<Endpoint>;
	setTable: (table: Table<Endpoint>) => void;
	page: number;
	setPage: (page: number) => void;
}

export default function MainEndpoint() {
	const { endpoints, lastFetchedCount, getEndpoints } = useEndpointStore();
	const [searchParams] = useSearchParams();

	const { versionId, orgId, appId } = useParams();

	const { setSelectedRows, setTable, page, setPage } = useOutletContext() as OutletContext;

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
			<EndpointFilter />
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
		</div>
	);
}
