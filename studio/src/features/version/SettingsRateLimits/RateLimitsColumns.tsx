import { ActionsCell } from '@/components/ActionsCell';
import useAuthStore from '@/store/auth/authStore.ts';
import useSettingsStore from '@/store/version/settingsStore';
import useVersionStore from '@/store/version/versionStore.ts';
import { ColumnDefWithClassName, RateLimit } from '@/types';
import { getVersionPermission, translate } from '@/utils';
import { AuthUserAvatar } from 'components/AuthUserAvatar';
import { Checkbox } from 'components/Checkbox';
import { SortButton } from 'components/DataTable';
import { DateText } from 'components/DateText';
import { TableConfirmation } from 'components/Table';

const canEditRateLimit = getVersionPermission('version.limit.update');
const canDeleteRateLimit = getVersionPermission('version.limit.delete');

const RateLimitsColumns: ColumnDefWithClassName<RateLimit>[] = [
	{
		id: 'select',
		className:
			'!max-w-[40px] !w-[40px] [&_.checkbox-wrapper]:mx-auto [&_.checkbox-wrapper]:w-fit !p-0',
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
		header: translate('general.limit'),
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
		className: 'actions !w-[50px]',
		cell: ({ row: { original } }) => {
			const { version } = useVersionStore.getState();
			const { setEditRateLimitDrawerIsOpen, setRateLimit, deleteRateLimit } =
				useSettingsStore.getState();
			async function onDelete() {
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
				<ActionsCell original={original} onEdit={editHandler} canEdit={canEditRateLimit}>
					<TableConfirmation
						align='end'
						closeOnConfirm
						title={translate('version.npm.delete_modal_title')}
						description={translate('version.npm.delete_modal_desc')}
						onConfirm={onDelete}
						contentClassName='m-0'
						hasPermission={canDeleteRateLimit}
					/>
				</ActionsCell>
			);
		},
	},
];

export default RateLimitsColumns;
