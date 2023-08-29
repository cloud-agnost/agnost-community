import { ColumnDefWithClassName, Middleware } from '@/types';
import { Checkbox } from 'components/Checkbox';
import { SortButton } from 'components/DataTable';
import { translate } from '@/utils';
import useAuthStore from '@/store/auth/authStore.ts';
import { AuthUserAvatar } from 'components/AuthUserAvatar';
import { DateText } from 'components/DateText';
import { ActionsCell } from 'components/ActionsCell';
import { Link } from 'react-router-dom';
import useMiddlewareStore from '@/store/middleware/middlewareStore';

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
			return (
				<Link
					to={`${_id}`}
					className='flex items-center gap-2 justify-between text-button-primary hover:underline'
				>
					{name}
				</Link>
			);
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
			const { setMiddleware, setEditMiddlewareDrawerIsOpen } = useMiddlewareStore.getState();
			function handleEdit() {
				setMiddleware(original);
				setEditMiddlewareDrawerIsOpen(true);
			}
			return (
				<ActionsCell<Middleware>
					original={original}
					canDeleteKey='middleware.delete'
					canEditKey='middleware.update'
					onEdit={handleEdit}
					type='version'
				/>
			);
		},
	},
];

export default MiddlewaresColumns;
