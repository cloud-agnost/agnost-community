import { DataTable } from '@/components/DataTable';
import { TableLoading } from '@/components/Table/Table';
import { useInfiniteScroll, useTable } from '@/hooks';
import useVersionStore from '@/store/version/versionStore';
import { Range } from 'react-date-range';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useSearchParams } from 'react-router-dom';
import { VersionLogColumns } from './VersionLogColumns';

interface VersionLogsTableProps {
	type: 'queue' | 'task' | 'endpoint';
	date: Range[];
}

export default function VersionLogsTable({ date, type }: VersionLogsTableProps) {
	const { logs, getVersionLogs, lastFetchedLogPage } = useVersionStore();
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
			start: searchParams.get('start') ?? date[0].startDate?.toISOString(),
			end: searchParams.get('end') ?? date[0].endDate?.toISOString(),
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
			<DataTable table={table} />
		</InfiniteScroll>
	);
}
