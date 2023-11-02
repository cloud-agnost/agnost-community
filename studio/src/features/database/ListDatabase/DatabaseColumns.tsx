import { ActionsCell } from '@/components/ActionsCell';
import { DATABASE_ICON_MAP } from '@/constants';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import { ColumnDefWithClassName, Database, TabTypes } from '@/types';
import { translate } from '@/utils';
import { Table } from '@phosphor-icons/react';
import { Badge } from 'components/Badge';
import { Button } from 'components/Button';
import { SortButton } from 'components/DataTable';
import { TabLink } from '@/features/version/Tabs';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from 'components/Tooltip';
import useOrganizationStore from '@/store/organization/organizationStore';
import { DateText } from '@/components/DateText';

const DatabaseColumns: ColumnDefWithClassName<Database>[] = [
	{
		id: 'name',
		header: ({ column }) => <SortButton text={translate('general.name')} column={column} />,
		accessorKey: 'name',
		sortingFn: 'textCaseSensitive',
		enableSorting: true,
		size: 200,
		cell: ({ row: { original } }) => {
			const { setDatabase } = useDatabaseStore.getState();
			return (
				<TabLink
					name={original.name}
					path={`${original._id}/models`}
					type={TabTypes.Model}
					onClick={() => setDatabase(original)}
				/>
			);
		},
	},
	{
		id: 'type',
		header: ({ column }) => <SortButton text={translate('general.type')} column={column} />,
		accessorKey: 'type',
		sortingFn: 'textCaseSensitive',
		enableSorting: true,
		size: 200,
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
		header: ({ column }) => <SortButton text={translate('general.managed')} column={column} />,
		accessorKey: 'managed',
		sortingFn: 'textCaseSensitive',
		enableSorting: true,
		size: 200,
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
		id: 'created_at',
		header: ({ column }) => <SortButton text={translate('general.created_at')} column={column} />,
		enableSorting: true,
		sortingFn: 'datetime',
		accessorKey: 'createdAt',
		size: 200,
		cell: ({ row }) => {
			const { createdAt, createdBy } = row.original;
			const user = useOrganizationStore
				.getState()
				.members.find((member) => member.member._id === createdBy);

			return <DateText date={createdAt} user={user} />;
		},
	},

	{
		id: 'updated_at',
		header: ({ column }) => <SortButton text={translate('general.updated_at')} column={column} />,
		accessorKey: 'updatedAt',
		size: 200,
		cell: ({ row }) => {
			const { updatedAt, updatedBy } = row.original;
			const user = useOrganizationStore
				.getState()
				.members.find((member) => member.member._id === updatedBy);
			return updatedBy && <DateText date={updatedAt} user={user} />;
		},
	},
	{
		id: 'actions',
		className: 'actions',
		size: 50,
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
