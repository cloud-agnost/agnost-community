import { ColumnDefWithClassName, Database } from '@/types';
import { SortButton } from 'components/DataTable';
import { translate } from '@/utils';
import { Button } from 'components/Button';
import { Pencil, Refresh } from 'components/icons';
import { CopyButton } from 'components/CopyButton';
import { Badge } from 'components/Badge';
import { Trash } from '@phosphor-icons/react';

const DatabaseColumns: ColumnDefWithClassName<Database>[] = [
	{
		id: 'name',
		header: ({ column }) => (
			<SortButton text={translate('general.name').toUpperCase()} column={column} />
		),
		accessorKey: 'name',
		sortingFn: 'textCaseSensitive',
	},
	{
		id: 'iid',
		header: ({ column }) => (
			<SortButton text={translate('general.id').toUpperCase()} column={column} />
		),
		accessorKey: 'iid',
		sortingFn: 'textCaseSensitive',
		cell: ({
			row: {
				original: { iid },
			},
		}) => {
			return (
				<div className='flex items-center gap-2 justify-between'>
					<span className='whitespace-nowrap'>{iid}</span>
					<CopyButton text={iid} />
				</div>
			);
		},
	},
	{
		id: 'type',
		header: ({ column }) => (
			<SortButton text={translate('general.type').toUpperCase()} column={column} />
		),
		accessorKey: 'type',
		sortingFn: 'textCaseSensitive',

		cell: ({
			row: {
				original: { type },
			},
		}) => {
			return <span className='whitespace-nowrap'>{type}</span>;
		},
	},
	{
		id: 'managed',
		header: ({ column }) => (
			<SortButton text={translate('general.managed').toUpperCase()} column={column} />
		),
		accessorKey: 'managed',
		sortingFn: 'textCaseSensitive',

		cell: ({
			row: {
				original: { managed },
			},
		}) => {
			return (
				<Badge
					rounded
					variant={managed ? 'green' : 'red'}
					text={managed ? translate('general.yes') : translate('general.no')}
					className='whitespace-nowrap'
				/>
			);
		},
	},
	{
		id: 'actions',
		className: 'actions !w-[50px]',
		cell: () => {
			function openEditDrawer() {
				// TODO: open edit drawer
			}
			return (
				<div className='flex items-center justify-end'>
					<Button
						onClick={openEditDrawer}
						iconOnly
						variant='blank'
						rounded
						className='text-xl hover:bg-wrapper-background-hover text-icon-base'
					>
						<Pencil />
					</Button>
					<Button
						onClick={openEditDrawer}
						iconOnly
						variant='blank'
						rounded
						className='text-xl hover:bg-wrapper-background-hover text-icon-base'
					>
						<Trash />
					</Button>
					<Button
						onClick={openEditDrawer}
						iconOnly
						variant='blank'
						rounded
						className='text-xl hover:bg-wrapper-background-hover text-icon-base'
					>
						<Refresh />
					</Button>
				</div>
			);
		},
	},
];

export default DatabaseColumns;
