import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { SortButton } from '@/components/DataTable';
import { Pencil } from '@/components/icons';
import { RESOURCE_ICON_MAP } from '@/constants';
import useClusterStore from '@/store/cluster/clusterStore';
import { ClusterComponent, ColumnDefWithClassName } from '@/types';
import { translate } from '@/utils';

const { openEditClusterComponent } = useClusterStore.getState();

const ClusterComponentColumns: ColumnDefWithClassName<ClusterComponent>[] = [
	{
		accessorKey: 'title',
		header: () => <SortButton text={translate('general.name')} field='title' />,
	},
	{
		accessorKey: 'type',
		header: () => <SortButton text={translate('general.type')} field='type' />,
		cell: ({ row }) => {
			const { type } = row.original;
			const Icon = RESOURCE_ICON_MAP[type];
			return (
				<div className='flex items-center space-x-2'>
					<Icon className='w-6 h-6' />
					<span className='text-sm text-default'>{type}</span>
				</div>
			);
		},
	},
	{
		accessorKey: 'status',
		header: () => <SortButton text={translate('cluster.k8sType')} field='status' />,
		cell: ({ row }) => {
			const { k8sType } = row.original;
			return <Badge variant={k8sType === 'Deployment' ? 'blue' : 'orange'} text={k8sType} />;
		},
	},
	{
		accessorKey: 'info.version',
		header: () => <SortButton text={translate('general.version')} field='info.version' />,
		cell: ({ row }) => (
			<div className='text-sm text-default truncate'>{row.original.info?.version}</div>
		),
	},
	{
		accessorKey: 'info.runningReplicas',
		header: () => (
			<SortButton text={translate('cluster.running_replicas')} field='info.runningReplicas' />
		),
		cell: ({ row }) => (
			<span className='text-sm text-default'>{row.original.info?.runningReplicas}</span>
		),
	},
	{
		accessorKey: 'info.size',
		header: () => <SortButton text={translate('storage.file.size')} field='info.runningReplicas' />,
		cell: ({ row }) => <span className='text-sm text-default'>{row.original.info?.size}</span>,
	},
	{
		header: translate('general.actions'),
		accessorKey: 'actions',
		className: 'actions',
		cell: ({ row }) => {
			return row.original.editable ? (
				<Button
					variant='icon'
					size='sm'
					rounded
					onClick={() => openEditClusterComponent(row.original)}
				>
					<Pencil className='w-4 h-4' />
				</Button>
			) : null;
		},
	},
];
export default ClusterComponentColumns;
