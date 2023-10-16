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
		header: ({ column }) => <SortButton text={translate('general.name')} column={column} />,
	},
	{
		accessorKey: 'type',
		header: ({ column }) => <SortButton text={translate('general.type')} column={column} />,
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
		header: ({ column }) => <SortButton text={translate('cluster.k8sType')} column={column} />,
		cell: ({ row }) => {
			const { k8sType } = row.original;
			return <Badge variant={k8sType === 'Deployment' ? 'blue' : 'orange'} text={k8sType} />;
		},
	},
	{
		accessorKey: 'info.version',
		header: ({ column }) => <SortButton text={translate('general.version')} column={column} />,
		cell: ({ row }) => (
			<div className='text-sm text-default truncate w-[30ch]'>{row.original.info?.version}</div>
		),
	},
	{
		accessorKey: 'info.runningReplicas',
		header: ({ column }) => (
			<SortButton text={translate('cluster.running_replicas')} column={column} />
		),
		cell: ({ row }) => (
			<span className='text-sm text-default'>{row.original.info?.runningReplicas}</span>
		),
	},
	{
		header: translate('general.actions'),
		accessorKey: 'actions',
		className: 'actions',
		cell: ({ row }) => {
			return row.original.editable ? (
				<Button
					iconOnly
					variant='blank'
					size='sm'
					onClick={() => openEditClusterComponent(row.original)}
				>
					<Pencil className='w-4 h-4' />
				</Button>
			) : null;
		},
	},
];
export default ClusterComponentColumns;