import { DataTable } from '@/components/DataTable';
import { TableLoading } from '@/components/Table/Table';
import { useInfiniteScroll, useTable } from '@/hooks';
import useVersionStore from '@/store/version/versionStore';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useSearchParams } from 'react-router-dom';
import { VersionLogColumns } from './VersionLogColumns';
import { useMemo } from 'react';

interface VersionLogsTableProps {
	type: 'queue' | 'task' | 'endpoint';
}

export default function VersionLogsTable({ type }: VersionLogsTableProps) {
	const { endpointLogs, queueLogs, taskLogs, getVersionLogs, lastFetchedLogPage } =
		useVersionStore();
	const logs = useMemo(() => {
		if (type === 'endpoint') return endpointLogs;
		if (type === 'queue') return queueLogs;
		return taskLogs;
	}, [type, taskLogs, endpointLogs, queueLogs]);
	console.log(logs);
	const [searchParams] = useSearchParams();
	const table = useTable({
		data: logs,
		columns: VersionLogColumns,
		initialState: {
			columnVisibility: {
				path: type === 'endpoint',
				method: type === 'endpoint',
			},
		},
	});
	const { hasNextPage, fetchNextPage, isPending } = useInfiniteScroll({
		lastFetchedPage: lastFetchedLogPage,
		queryFn: getVersionLogs,
		dataLength: logs.length,
		queryKey: 'versionLogs',
		params: {
			type,
			start: searchParams.get('start'),
			end: searchParams.get('end'),
		},
	});

	return (
		<InfiniteScroll
			scrollableTarget='version-layout'
			dataLength={logs?.length}
			next={fetchNextPage}
			hasMore={hasNextPage}
			loader={isPending && <TableLoading />}
		>
			<DataTable table={table} className='table-fixed' />
		</InfiniteScroll>
	);
}
