import { TabLink } from '@/features/version/Tabs';
import useAuthorizeApp from '@/hooks/useAuthorizeApp';
import useApplicationStore from '@/store/app/applicationStore';
import useAuthStore from '@/store/auth/authStore.ts';
import useMiddlewareStore from '@/store/middleware/middlewareStore';
import { ColumnDefWithClassName, Middleware, TabTypes } from '@/types';
import { translate } from '@/utils';
import { ActionsCell } from 'components/ActionsCell';
import { AuthUserAvatar } from 'components/AuthUserAvatar';
import { Checkbox } from 'components/Checkbox';
import { SortButton } from 'components/DataTable';
import { DateText } from 'components/DateText';
import { TableConfirmation } from 'components/Table';
import { notify } from '@/utils';
const MiddlewaresColumns: ColumnDefWithClassName<Middleware>[] = [
	{
		id: 'select',
		className: '!max-w-[25px] !w-[25px] !pr-0',
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
		cell: ({
			row: {
				original: { _id, name },
			},
		}) => {
			return <TabLink name={name} path={`${_id}`} type={TabTypes.Middleware} />;
		},
		accessorKey: 'name',
		sortingFn: 'textCaseSensitive',
	},
	{
		id: 'createdAt',
		header: ({ column }) => <SortButton text={translate('general.created_at')} column={column} />,
		accessorKey: 'createdAt',
		sortingFn: 'datetime',
		enableSorting: true,
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
		header: ({ column }) => <SortButton text={translate('general.updated_at')} column={column} />,
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
		size: 45,
		cell: ({ row: { original } }) => {
			const { setMiddleware, setEditMiddlewareDrawerIsOpen, deleteMiddleware } =
				useMiddlewareStore.getState();
			function handleEdit() {
				setMiddleware(original);
				setEditMiddlewareDrawerIsOpen(true);
			}

			async function deleteHandler() {
				deleteMiddleware({
					appId: original.appId,
					orgId: original.orgId,
					versionId: original.versionId,
					mwId: original._id,
					onSuccess: () => {
						notify({
							title: translate('general.success'),
							description: translate('version.middleware.delete.success'),
							type: 'success',
						});
					},
					onError: (error) => {
						notify({
							title: error.error,
							description: error.details,
							type: 'error',
						});
					},
				});
			}

			return (
				<ActionsCell<Middleware>
					original={original}
					canDeleteKey='middleware.delete'
					canEditKey='middleware.update'
					onEdit={handleEdit}
					type='version'
				>
					<ConfirmTable onDelete={deleteHandler} />
				</ActionsCell>
			);
		},
	},
];

function ConfirmTable({ onDelete }: { onDelete: () => void }) {
	return (
		<TableConfirmation
			align='end'
			closeOnConfirm
			showAvatar={false}
			title={translate('version.middleware.delete.title')}
			description={translate('version.middleware.delete.message')}
			onConfirm={onDelete}
			contentClassName='m-0'
			permissionKey='middleware.delete'
		/>
	);
}

export default MiddlewaresColumns;
