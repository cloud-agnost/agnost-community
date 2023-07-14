import { Checkbox } from 'components/Checkbox';
import { SortButton } from 'components/DataTable';
import { translate } from '@/utils';
import useAuthStore from '@/store/auth/authStore.ts';
import { AuthUserAvatar } from 'components/AuthUserAvatar';
import { DateText } from 'components/DateText';
import { TableConfirmation } from 'components/Table';
import { Button } from 'components/Button';
import { Trash } from '@phosphor-icons/react';
import { ColumnDefWithClassName, RateLimit } from '@/types';
import { Pencil } from 'components/icons';
import useVersionStore from '@/store/version/versionStore.ts';

const RateLimitsColumns: ColumnDefWithClassName<RateLimit>[] = [
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
		header: ({ column }) => (
			<SortButton text={translate('general.name').toUpperCase()} column={column} />
		),
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
		id: 'limit',
		header: translate('general.limit').toUpperCase(),
		accessorKey: 'limit',
		sortingFn: 'textCaseSensitive',
		cell: ({
			row: {
				original: { duration, rate },
			},
		}) => {
			return (
				<div className='whitespace-nowrap'>
					{translate('version.limiter_detail', {
						rate: rate,
						duration: duration,
					})}
				</div>
			);
		},
	},
	{
		id: 'created_at',
		header: ({ column }) => (
			<SortButton
				className='whitespace-nowrap'
				text={translate('general.created_at').toUpperCase()}
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
				text={translate('general.updated_at').toUpperCase()}
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
			const { version, setEditRateLimitDrawerIsOpen, setRateLimit, deleteRateLimit } =
				useVersionStore.getState();
			async function clickHandler() {
				if (!version) return;
				await deleteRateLimit({
					appId: version.appId,
					versionId: version._id,
					limitId: original._id,
					orgId: version.orgId,
				});
			}
			function editHandler() {
				setRateLimit(original);
				setEditRateLimitDrawerIsOpen(true);
			}

			return (
				<div className='flex items-center gap-0.5'>
					<Button
						variant='blank'
						onClick={editHandler}
						rounded
						className='hover:bg-button-border-hover aspect-square text-icon-base hover:text-default'
						iconOnly
					>
						<Pencil className='text-lg' />
					</Button>
					<TableConfirmation
						align='end'
						closeOnConfirm
						showAvatar={false}
						title={translate('version.delete_rate_limiter_title')}
						description={translate('version.delete_rate_limiter_message')}
						onConfirm={clickHandler}
						contentClassName='m-0'
					>
						<Button
							variant='blank'
							rounded
							className='hover:bg-button-border-hover aspect-square text-icon-base hover:text-default'
							iconOnly
						>
							<Trash size={20} />
						</Button>
					</TableConfirmation>
				</div>
			);
		},
	},
];

export default RateLimitsColumns;
