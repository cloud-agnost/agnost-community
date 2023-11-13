import { ActionsCell } from '@/components/ActionsCell';
import { DateText } from '@/components/DateText';
import { DATABASE_ICON_MAP } from '@/constants';
import { TabLink } from '@/features/version/Tabs';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import useOrganizationStore from '@/store/organization/organizationStore';
import { ColumnDefWithClassName, Database, TabTypes } from '@/types';
import { getVersionPermission, translate } from '@/utils';
import { Badge } from 'components/Badge';
import { SortButton } from 'components/DataTable';

const { openDeleteDatabaseDialog, openEditDatabaseDialog } = useDatabaseStore.getState();

const canEditDatabase = getVersionPermission('db.update');
const canDeleteDatabase = getVersionPermission('db.delete');

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
		id: 'assignUniqueName',
		header: ({ column }) => (
			<SortButton text={translate('database.add.unique.name')} column={column} />
		),
		accessorKey: 'assignUniqueName',
		sortingFn: 'textCaseSensitive',
		enableSorting: true,
		size: 200,
		cell: ({
			row: {
				original: { assignUniqueName },
			},
		}) => {
			return (
				<Badge
					rounded
					variant={assignUniqueName ? 'green' : 'red'}
					text={assignUniqueName ? translate('general.yes') : translate('general.no')}
					className='whitespace-nowrap'
				/>
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
		header: ({ column }) => (
			<SortButton
				className='whitespace-nowrap'
				text={translate('general.created_at')}
				column={column}
			/>
		),
		accessorKey: 'created_at',
		enableSorting: true,
		sortingFn: 'datetime',
		size: 200,
		cell: ({
			row: {
				original: { createdAt, createdBy },
			},
		}) => {
			const user = useOrganizationStore
				.getState()
				.members.find((member) => member.member._id === createdBy);

			return <DateText date={createdAt} user={user} />;
		},
	},

	{
		id: 'updatedAt',
		header: ({ column }) => (
			<SortButton
				className='whitespace-nowrap'
				text={translate('general.updated_at')}
				column={column}
			/>
		),
		accessorKey: 'updatedAt',
		enableSorting: true,
		sortingFn: 'datetime',
		size: 200,
		cell: ({
			row: {
				original: { updatedAt, updatedBy },
			},
		}) => {
			if (!updatedBy) return null;
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
			return (
				<ActionsCell
					original={original}
					onDelete={() => openDeleteDatabaseDialog(original)}
					onEdit={() => openEditDatabaseDialog(original)}
					canEdit={canEditDatabase}
					canDelete={canDeleteDatabase}
					disabled={!original.managed}
				/>
			);
		},
	},
];

export default DatabaseColumns;
