import { ActionsCell } from '@/components/ActionsCell';
import { Badge } from '@/components/Badge';
import { SortButton } from '@/components/DataTable';
import { BADGE_COLOR_MAP } from '@/constants';
import useResourceStore from '@/store/resources/resourceStore';
import { ColumnDefWithClassName, Resource } from '@/types';
import { translate } from '@/utils';
export const EnvironmentResourcesColumn: ColumnDefWithClassName<Resource>[] = [
	{
		id: 'name',
		header: ({ column }) => {
			return <SortButton text={translate('resources.table.name')} column={column} />;
		},
		accessorKey: 'name',
		size: 200,
	},
	{
		id: 'type',
		header: ({ column }) => {
			return <SortButton text={translate('resources.table.type')} column={column} />;
		},
		accessorKey: 'instance',
		size: 200,
	},
	{
		id: 'status',
		header: ({ column }) => {
			return <SortButton text={translate('resources.table.status')} column={column} />;
		},
		accessorKey: 'status',
		size: 200,
		cell: ({ row }) => {
			const { status } = row.original;
			return <Badge text={status} variant={BADGE_COLOR_MAP[status.toUpperCase()]} rounded />;
		},
	},
	{
		id: 'managed',
		header: ({ column }) => {
			return <SortButton text={translate('resources.table.managed')} column={column} />;
		},
		accessorKey: 'managed',
		size: 200,
		cell: ({ row }) => {
			const { managed } = row.original;
			const text = managed ? 'Yes' : 'No';
			return <Badge text={text} variant={BADGE_COLOR_MAP[text.toUpperCase()]} rounded />;
		},
	},
	{
		id: 'actions',
		header: translate('resources.table.actions'),
		className: 'actions',
		size: 45,
		cell: ({ row }) => {
			return (
				<ActionsCell
					original={row.original}
					onDelete={() => () =>
						useResourceStore.setState({
							deletedResource: row.original,
							isDeletedResourceModalOpen: true,
						})
					}
					canEditKey='resource.update'
					canDeleteKey='resource.delete'
					type='org'
				/>
			);
		},
	},
];
