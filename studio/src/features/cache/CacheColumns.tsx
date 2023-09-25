import { ActionsCell } from '@/components/ActionsCell';
import { Badge } from '@/components/Badge';
import { InstanceType } from '@/components/InstanceType';
import { Redis } from '@/components/icons';
import { BADGE_COLOR_MAP } from '@/constants';
import { TabLink } from '@/features/version/Tabs';
import useCacheStore from '@/store/cache/cacheStore';
import useOrganizationStore from '@/store/organization/organizationStore';
import { Cache, ColumnDefWithClassName } from '@/types';
import { translate } from '@/utils';
import { Checkbox } from 'components/Checkbox';
import { SortButton } from 'components/DataTable';
import { DateText } from 'components/DateText';

const CacheColumns: ColumnDefWithClassName<Cache>[] = [
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
		// cell: ({ row: { original } }) => {
		// 	const { name, _id } = original;
		// 	return (
		// 		<TabLink
		// 			name={name}
		// 			path={`${_id}`}
		// 			className='link'
		// 			onClick={() => {
		// 				useCacheStore.setState({ cache: original });
		// 			}}
		// 			type='Storage'
		// 		/>
		// 	);
		// },
	},
	{
		id: 'instance',
		header: translate('general.instance'),
		cell: ({
			row: {
				original: { iid },
			},
		}) => {
			return <InstanceType iid={iid} Icon={Redis} />;
		},
	},
	{
		id: 'assignUniqueName',
		header: ({ column }) => (
			<SortButton text={translate('cache.assignUniqueName')} column={column} />
		),
		enableSorting: true,
		sortingFn: 'basic',
		accessorKey: 'assignUniqueName',
		size: 200,
		cell: ({ row }) => {
			const { assignUniqueName } = row.original;
			const assignUniqueNameText = assignUniqueName
				? translate('general.yes')
				: translate('general.no');
			return (
				<Badge
					variant={BADGE_COLOR_MAP[assignUniqueNameText.toUpperCase()]}
					text={assignUniqueNameText}
					rounded
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
		className: 'actions !w-[50px]',
		cell: ({ row: { original } }) => {
			const { openEditCacheModal, openDeleteCacheModal } = useCacheStore.getState();
			return (
				<ActionsCell<Cache>
					original={original}
					onEdit={() => openEditCacheModal(original)}
					onDelete={() => openDeleteCacheModal(original)}
					canEditKey='cache.update'
					canDeleteKey='cache.delete'
					type='version'
				/>
			);
		},
	},
];

export default CacheColumns;
