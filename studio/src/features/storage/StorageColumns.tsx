import { ActionsCell } from '@/components/ActionsCell';
import { InstanceType } from '@/components/InstanceType';
import { STORAGE_ICON_MAP } from '@/constants';
import { TabLink } from '@/features/version/Tabs';
import useEnvironmentStore from '@/store/environment/environmentStore';
import useOrganizationStore from '@/store/organization/organizationStore';
import useStorageStore from '@/store/storage/storageStore';
import { ColumnDefWithClassName, Storage } from '@/types';
import { translate } from '@/utils';
import { Checkbox } from 'components/Checkbox';
import { SortButton } from 'components/DataTable';
import { DateText } from 'components/DateText';

const StorageColumns: ColumnDefWithClassName<Storage>[] = [
	{
		id: 'select',
		className: '!max-w-[40px] !w-[40px]',
		header: ({ table }) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected()}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label='Select all'
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label='Select row'
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},

	{
		id: 'name',
		header: ({ column }) => <SortButton text={translate('general.name')} column={column} />,
		accessorKey: 'name',
		sortingFn: 'textCaseSensitive',
		cell: ({ row: { original } }) => {
			const { name, _id } = original;
			return (
				<TabLink
					name={name}
					path={`${_id}`}
					className='link'
					onClick={() => {
						useStorageStore.setState({ storage: original });
					}}
				/>
			);
		},
	},
	{
		id: 'instance',
		header: translate('general.instance'),
		cell: ({
			row: {
				original: { iid },
			},
		}) => {
			const environment = useEnvironmentStore.getState().environment;
			const instance = environment?.mappings.find((mapping) => mapping.design.iid === iid)
				?.resource.instance;
			const Icon = STORAGE_ICON_MAP[instance as string];
			return <InstanceType iid={iid} Icon={Icon} />;
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
		className: 'actions !w-[50px]',
		cell: ({ row: { original } }) => {
			const { openDeleteStorageDialog, openEditStorageDialog } = useStorageStore.getState();
			return (
				<ActionsCell<Storage>
					original={original}
					onEdit={() => openEditStorageDialog(original)}
					onDelete={() => openDeleteStorageDialog(original)}
					canEditKey='storage.update'
					canDeleteKey='storage.delete'
					type='version'
				/>
			);
		},
	},
];

export default StorageColumns;
