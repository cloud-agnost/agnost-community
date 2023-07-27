import { Badge } from '@/components/Badge';
import { SortButton } from '@/components/DataTable';
import { DateText } from '@/components/DateText';
import { TableActions } from '@/components/Table';
import { BADGE_COLOR_MAP } from '@/constants';
import { Resource } from '@/types';
import { translate } from '@/utils';
import { ColumnDef } from '@tanstack/react-table';

export const ResourceTableColumn: ColumnDef<Resource>[] = [
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
		id: 'allowedRoles',
		header: ({ column }) => {
			return <SortButton text={translate('resources.table.allowedRoles')} column={column} />;
		},
		accessorKey: 'allowedRoles',
		size: 200,
		cell: ({ row }) => {
			const { allowedRoles } = row.original;
			return (
				<div className='flex gap-2'>
					{allowedRoles.map((role) => {
						return <Badge key={role} text={role} variant={BADGE_COLOR_MAP[role.toUpperCase()]} />;
					})}
				</div>
			);
		},
	},
	{
		id: 'createdAt',
		header: ({ column }) => {
			return <SortButton text={translate('resources.table.createdAt')} column={column} />;
		},
		accessorKey: 'createdAt',
		size: 200,
		cell: ({ row }) => {
			const { createdAt } = row.original;
			return <DateText date={createdAt} />;
		},
	},
	{
		id: 'actions',
		header: translate('resources.table.actions'),
		size: 45,
		cell: () => {
			return (
				<>
					<TableActions
						onDelete={() => console.log('delete')}
						onEdit={() => console.log('edit')}
						confirmationTitle='delete'
						confirmationDescription='delete'
					/>
				</>
			);
		},
	},
];
