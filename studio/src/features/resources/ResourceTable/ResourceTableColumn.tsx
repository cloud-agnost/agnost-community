import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { SortButton } from '@/components/DataTable';
import { DateText } from '@/components/DateText';
import { Pencil } from '@/components/icons';
import { BADGE_COLOR_MAP } from '@/constants';
import useResourceStore from '@/store/resources/resourceStore';
import { Resource } from '@/types';
import { translate } from '@/utils';
import { Trash } from '@phosphor-icons/react';
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
					{allowedRoles.sort().map((role) => {
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
		cell: ({ row }) => {
			return (
				<div className='flex items-center '>
					<Button variant='blank' iconOnly>
						<Pencil className='w-6 h-6 text-icon-base' />
					</Button>

					<Button
						variant='blank'
						iconOnly
						onClick={() =>
							useResourceStore.setState({
								deletedResource: row.original,
								isDeletedResourceModalOpen: true,
							})
						}
					>
						<Trash size={24} className='text-icon-base' />
					</Button>
				</div>
			);
		},
	},
];
