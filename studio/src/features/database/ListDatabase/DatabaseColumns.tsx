import { ColumnDefWithClassName, Database } from '@/types';
import { SortButton } from 'components/DataTable';
import { translate } from '@/utils';
import { Button } from 'components/Button';
import { Pencil } from 'components/icons';
import { CopyButton } from 'components/CopyButton';
import { Badge } from 'components/Badge';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import { DATABASE_ICON_MAP } from '@/constants';
import { Table, Trash } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

const DatabaseColumns: ColumnDefWithClassName<Database>[] = [
	{
		id: 'name',
		header: ({ column }) => (
			<SortButton text={translate('general.name').toUpperCase()} column={column} />
		),
		accessorKey: 'name',
		sortingFn: 'textCaseSensitive',
		cell: ({
			row: {
				original: { _id, name },
			},
		}) => {
			return (
				<Link
					to={`${_id}/models`}
					className='flex items-center gap-2 justify-between hover:underline'
				>
					{name}
				</Link>
			);
		},
	},
	{
		id: 'iid',
		header: translate('general.id').toUpperCase(),
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
			const Icon = DATABASE_ICON_MAP[type];
			return (
				<span className='flex items-center gap-2'>
					<Icon />
					{type}
				</span>
			);
		},
	},
	{
		id: 'managed',
		header: translate('general.managed').toUpperCase(),
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
		cell: ({ row: { original } }) => {
			const {
				setToEditDatabase,
				setEditDatabaseDialogOpen,
				setIsOpenDeleteDatabaseDialog,
				setToDeleteDatabase,
			} = useDatabaseStore.getState();

			function openEditDrawer() {
				setToEditDatabase(original);
				setEditDatabaseDialogOpen(true);
			}

			function deleteHandler() {
				setToDeleteDatabase(original);
				setIsOpenDeleteDatabaseDialog(true);
			}

			return (
				<div className='flex items-center gap-0.5 justify-end'>
					<Button
						iconOnly
						variant='blank'
						rounded
						to={`${original._id}/models`}
						className='hover:bg-button-border-hover aspect-square text-icon-base hover:text-default text-xl'
					>
						<Table />
					</Button>
					<Button
						onClick={openEditDrawer}
						iconOnly
						variant='blank'
						rounded
						className='hover:bg-button-border-hover aspect-square text-icon-base hover:text-default text-xl'
					>
						<Pencil />
					</Button>
					<Button
						onClick={deleteHandler}
						variant='blank'
						rounded
						className='hover:bg-button-border-hover aspect-square text-icon-base hover:text-default text-xl'
						iconOnly
					>
						<Trash />
					</Button>
				</div>
			);
		},
	},
];

export default DatabaseColumns;
