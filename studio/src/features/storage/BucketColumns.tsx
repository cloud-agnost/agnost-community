import { ActionsCell } from '@/components/ActionsCell';
import { Badge } from '@/components/Badge';
import useOrganizationStore from '@/store/organization/organizationStore';
import useStorageStore from '@/store/storage/storageStore';
import { Bucket, ColumnDefWithClassName } from '@/types';
import { notify, translate } from '@/utils';
import { Prohibit } from '@phosphor-icons/react';
import { Button } from 'components/Button';
import { Checkbox } from 'components/Checkbox';
import { SortButton } from 'components/DataTable';
import { DateText } from 'components/DateText';
import { TabLink } from '@/features/version/Tabs';

const BucketColumns: ColumnDefWithClassName<Bucket>[] = [
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
		cell: ({ row: { original } }) => (
			<TabLink
				name={original.name}
				path={original.name}
				type='Storage'
				onClick={() => {
					useStorageStore.setState({ bucket: original });
				}}
			/>
		),
	},

	{
		id: 'visibility',
		header: translate('storage.bucket.visibility.title'),
		cell: ({
			row: {
				original: { isPublic },
			},
		}) => (
			<Badge
				variant={isPublic ? 'green' : 'yellow'}
				text={
					isPublic
						? translate('storage.bucket.visibility.public')
						: translate('storage.bucket.visibility.private')
				}
				rounded
			/>
		),
	},
	{
		id: 'tags',
		header: translate('storage.bucket.tags'),
		accessorKey: 'tags',
		cell: ({ row: { original } }) => {
			const { tags } = original;
			return (
				<div className='flex flex-wrap gap-4'>
					{Object.entries(tags).map(([key, value]) => (
						<Badge key={key} variant='gray' text={`${key}: ${value}`} rounded />
					))}
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
				original: { createdAt, userId },
			},
		}) => {
			const user = useOrganizationStore
				.getState()
				.members.find((member) => member.member._id === userId);

			return user && <DateText date={createdAt} user={user} />;
		},
	},

	{
		id: 'actions',
		className: 'actions !w-[50px]',
		cell: ({ row: { original } }) => {
			const { emptyBucket, openDeleteBucketDialog, openEditBucketDialog, storage } =
				useStorageStore.getState();

			return (
				<div className='flex items-center justify-end'>
					<Button
						iconOnly
						variant='blank'
						rounded
						className='text-xl hover:bg-wrapper-background-hover text-icon-base'
						onClick={() =>
							emptyBucket({
								storageName: storage?.name as string,
								bucketName: original.name,
								onSuccess: () => {
									notify({
										title: translate('general.success'),
										description: translate('storage.bucket.empty'),
										type: 'success',
									});
								},
								onError: ({ error, details }) => {
									notify({
										title: error,
										description: details,
										type: 'error',
									});
								},
							})
						}
					>
						<Prohibit />
					</Button>
					<ActionsCell
						original={original}
						onDelete={() => openDeleteBucketDialog(original)}
						onEdit={() => openEditBucketDialog(original)}
						canEditKey='storage.update'
						canDeleteKey='storage.delete'
						type='version'
					/>
				</div>
			);
		},
	},
];

export default BucketColumns;
