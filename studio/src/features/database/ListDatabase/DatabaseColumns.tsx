import { ActionsCell } from '@/components/ActionsCell';
import { DATABASE_ICON_MAP } from '@/constants';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import { ColumnDefWithClassName, Database } from '@/types';
import { translate } from '@/utils';
import { Table } from '@phosphor-icons/react';
import { Badge } from 'components/Badge';
import { Button } from 'components/Button';
import { SortButton } from 'components/DataTable';
import { TabLink } from '@/features/version/Tabs';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from 'components/Tooltip';

const DatabaseColumns: ColumnDefWithClassName<Database>[] = [
	{
		id: 'name',
		header: ({ column }) => (
			<SortButton text={translate('general.name').toUpperCase()} column={column} />
		),
		accessorKey: 'name',
		sortingFn: 'textCaseSensitive',
		enableSorting: true,
		cell: ({ row: { original } }) => {
			const { setDatabase } = useDatabaseStore.getState();
			return (
				<TabLink
					name={original.name}
					path={`${original._id}/models`}
					type='Database'
					onClick={() => setDatabase(original)}
				/>
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
		enableSorting: true,
		cell: ({
			row: {
				original: { type },
			},
		}) => {
			const Icon = DATABASE_ICON_MAP[type];
			return (
				<span className='flex items-center gap-2 [&>svg]:text-lg'>
					<Icon />
					{type}
				</span>
			);
		},
	},
	{
		id: 'managed',
		header: ({ column }) => (
			<SortButton text={translate('general.managed').toUpperCase()} column={column} />
		),
		accessorKey: 'managed',
		sortingFn: 'textCaseSensitive',
		enableSorting: true,
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

			//Todo: Table permissions
			return (
				<div className='flex items-center gap-0.5 justify-end'>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									iconOnly
									variant='blank'
									rounded
									to={`${original._id}/models`}
									className='hover:bg-button-border-hover aspect-square text-icon-base hover:text-default text-xl'
								>
									<Table />
								</Button>
							</TooltipTrigger>
							<TooltipContent>{translate('database.models.title')}</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<ActionsCell
						original={original}
						onDelete={deleteHandler}
						onEdit={openEditDrawer}
						canDeleteKey='db.delete'
						canEditKey='db.update'
						type='version'
						disabled={!original.managed}
					/>
				</div>
			);
		},
	},
];

export default DatabaseColumns;
