import { ActionsCell } from '@/components/ActionsCell';
import useAuthStore from '@/store/auth/authStore.ts';
import useOrganizationStore from '@/store/organization/organizationStore';
import useSettingsStore from '@/store/version/settingsStore';
import useVersionStore from '@/store/version/versionStore.ts';
import { ColumnDefWithClassName, Param } from '@/types';
import { getVersionPermission, translate } from '@/utils';
import { AuthUserAvatar } from 'components/AuthUserAvatar';
import { Checkbox } from 'components/Checkbox';
import { SortButton } from 'components/DataTable';
import { DateText } from 'components/DateText';
import { TableConfirmation } from 'components/Table';

const canEditParam = getVersionPermission('version.param.update');
const canDeleteParam = getVersionPermission('version.param.delete');

const VariableColumns: ColumnDefWithClassName<Param>[] = [
	{
		id: 'select',
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
		size: 40,
	},
	{
		id: 'name',
		header: ({ column }) => <SortButton text={translate('general.name')} column={column} />,
		accessorKey: 'name',
		sortingFn: 'textCaseSensitive',
		cell: ({
			row: {
				original: { name },
			},
		}) => {
			return <div className='truncate max-w-[15ch]'>{name}</div>;
		},
		size: 100,
	},
	{
		id: 'value',
		header: ({ column }) => <SortButton text={translate('general.value')} column={column} />,
		accessorKey: 'value',
		sortingFn: 'textCaseSensitive',
		cell: ({
			row: {
				original: { value },
			},
		}) => {
			return <div className='truncate max-w-[30ch]'>{value}</div>;
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
		cell: ({ row: { original } }) => {
			const { version } = useVersionStore.getState();
			const { deleteParam, setParam, setEditParamDrawerIsOpen } = useSettingsStore.getState();
			async function onDelete() {
				if (!version) return;
				await deleteParam({
					versionId: version?._id,
					orgId: version?.orgId,
					appId: version?.appId,
					paramId: original._id,
				});
			}

			function editHandler() {
				setParam(original);
				setEditParamDrawerIsOpen(true);
			}
			return (
				<ActionsCell original={original} onEdit={editHandler} canEdit={canEditParam}>
					<TableConfirmation
						align='end'
						closeOnConfirm
						title={translate('version.variable.delete_modal_title')}
						description={translate('version.variable.delete_modal_desc')}
						onConfirm={onDelete}
						contentClassName='m-0'
						hasPermission={canDeleteParam}
					/>
				</ActionsCell>
			);
		},
	},
];

export default VariableColumns;
