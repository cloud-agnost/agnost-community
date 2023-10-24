import { ActionsCell } from '@/components/ActionsCell';
import useAuthorizeApp from '@/hooks/useAuthorizeApp';
import useApplicationStore from '@/store/app/applicationStore';
import useAuthStore from '@/store/auth/authStore.ts';
import useSettingsStore from '@/store/version/settingsStore';
import useVersionStore from '@/store/version/versionStore.ts';
import { ColumnDefWithClassName, Param } from '@/types';
import { translate } from '@/utils';
import { AuthUserAvatar } from 'components/AuthUserAvatar';
import { Checkbox } from 'components/Checkbox';
import { SortButton } from 'components/DataTable';
import { DateText } from 'components/DateText';
import { TableConfirmation } from 'components/Table';

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
			const isMe = useAuthStore.getState().user?._id === createdBy;
			const avatar = isMe ? <AuthUserAvatar className='border' size='sm' /> : null;
			return <DateText date={createdAt}>{avatar}</DateText>;
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
			const isMe = useAuthStore.getState().user?._id === updatedBy;
			const avatar = isMe ? <AuthUserAvatar className='border' size='sm' /> : null;
			return <DateText date={updatedAt}>{avatar}</DateText>;
		},
	},
	{
		id: 'actions',
		className: 'actions',
		cell: ({ row: { original } }) => {
			const { version } = useVersionStore.getState();
			const { deleteParam, setParam, setEditParamDrawerIsOpen } = useSettingsStore.getState();
			async function clickHandler() {
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
				<ActionsCell
					original={original}
					canEditKey='version.key.update'
					onEdit={editHandler}
					type='version'
				>
					<ConfirmTable onDelete={clickHandler} />
				</ActionsCell>
			);
		},
	},
];

function ConfirmTable({ onDelete }: { onDelete: () => void }) {
	const role = useApplicationStore.getState().role;
	const hasAppPermission = useAuthorizeApp({
		key: 'version.key.delete',
		role,
	});
	return (
		<TableConfirmation
			align='end'
			closeOnConfirm
			showAvatar={false}
			title={translate('version.variable.delete_modal_title')}
			description={translate('version.variable.delete_modal_desc')}
			onConfirm={onDelete}
			contentClassName='m-0'
			disabled={!hasAppPermission}
		/>
	);
}

export default VariableColumns;
