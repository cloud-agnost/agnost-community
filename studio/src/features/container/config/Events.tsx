import { DataTable } from '@/components/DataTable';
import { useTable } from '@/hooks';
import useContainerStore from '@/store/container/containerStore';
import { ColumnDefWithClassName } from '@/types';
import { ContainerEvent, ContainerPod } from '@/types/container';
import { CheckCircle, Warning } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

export default function Events() {
	const { getContainerEvents, container } = useContainerStore();
	const { orgId, envId, projectId } = useParams() as Record<string, string>;
	const { data: events } = useQuery({
		queryKey: ['containerPods'],
		queryFn: () =>
			getContainerEvents({
				orgId,
				envId,
				projectId,
				containerId: container?._id!,
			}),
		refetchInterval: 3000,
	});
	const table = useTable<ContainerEvent>({
		columns: EventColumns,
		data: events ?? [],
	});
	return (
		<div className='table-container overflow-auto h-full'>
			<DataTable
				table={table}
				className='navigator h-full table-fixed relative'
				headerClassName='sticky top-0 z-50'
				containerClassName='!border-none h-full'
			/>
		</div>
	);
}

const EventColumns: ColumnDefWithClassName<ContainerEvent>[] = [
	{
		id: 'kind',
		header: 'Kind',
		accessorKey: 'kind',
		enableSorting: true,
		size: 200,
	},
	{
		id: 'message',
		header: 'Message',
		accessorKey: 'message',
		enableSorting: true,
		size: 300,
	},
	{
		id: 'reason',
		header: 'Reason',
		accessorKey: 'reason',
		enableSorting: true,
		size: 200,
		cell: ({ row }) => (
			<div className='flex items-center gap-2'>
				{row.original.type === 'Normal' ? (
					<CheckCircle size={16} className='text-elements-green' />
				) : (
					<Warning size={16} className='text-elements-yellow' />
				)}{' '}
				{row.original.type}
			</div>
		),
	},
	{
		id: 'firstSeen',
		header: 'First Seen',
		accessorKey: 'firstSeen',
		enableSorting: true,
		size: 200,
	},
	{
		id: 'lastSeen',
		header: 'Last Seen',
		accessorKey: 'lastSeen',
		enableSorting: true,
		size: 200,
	},
	{
		id: 'count',
		header: 'Count',
		accessorKey: 'count',
		enableSorting: true,
	},
];
