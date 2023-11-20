import { ActionsCell } from '@/components/ActionsCell';
import { Badge } from '@/components/Badge';
import { TableConfirmation } from '@/components/Table';
import { TabLink } from '@/features/version/Tabs';
import useOrganizationStore from '@/store/organization/organizationStore';
import useStorageStore from '@/store/storage/storageStore';
import { APIError, Bucket, ColumnDefWithClassName, TabTypes } from '@/types';
import { getVersionPermission, notify, translate } from '@/utils';
import { Prohibit } from '@phosphor-icons/react';
import { QueryClient } from '@tanstack/react-query';
import { Checkbox } from 'components/Checkbox';
import { SortButton } from 'components/DataTable';
import { DateText } from 'components/DateText';

const canEditBucket = getVersionPermission('storage.update');
const canDeleteBucket = getVersionPermission('storage.delete');

const { emptyBucket, openDeleteBucketDialog, openEditBucketDialog, storage } =
	useStorageStore.getState();

const queryClient = new QueryClient();
function clearBucket(bucketName: string) {
	queryClient
		.getMutationCache()
		.build(queryClient, {
			mutationFn: emptyBucket,
			onError: (error: APIError) => {
				notify({
					title: error.error,
					description: error.details,
					type: 'error',
				});
			},
		})
		.execute({
			storageName: storage?.name,
			bucketName,
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
		});
}

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
				path={`bucket/${original.name}`}
				type={TabTypes.Bucket}
				onClick={() => {
					useStorageStore.setState({ bucket: original });
				}}
			/>
		),
	},

	{
		id: 'visibility',
		header: ({ column }) => (
			<SortButton text={translate('storage.bucket.visibility.title')} column={column} />
		),
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
		header: ({ column }) => <SortButton text={translate('storage.bucket.tags')} column={column} />,
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
		id: 'updated_at',
		header: ({ column }) => (
			<SortButton
				className='whitespace-nowrap'
				text={translate('general.updated_at')}
				column={column}
			/>
		),
		accessorKey: 'updated_at',
		enableSorting: true,
		sortingFn: 'datetime',
		size: 200,
		cell: ({
			row: {
				original: { updatedAt, userId },
			},
		}) => {
			const user = useOrganizationStore
				.getState()
				.members.find((member) => member.member._id === userId);

			return user && <DateText date={updatedAt} user={user} />;
		},
	},

	{
		id: 'actions',
		className: 'actions !w-[50px]',
		cell: ({ row: { original } }) => {
			return (
				<div className='flex items-center justify-end'>
					<TableConfirmation
						align='end'
						closeOnConfirm
						title={translate('storage.clear.title')}
						description={translate('storage.clear.message')}
						onConfirm={() => clearBucket(original.name)}
						contentClassName='m-0'
						hasPermission={canDeleteBucket}
						tooltip='Clear bucket'
						icon={<Prohibit size={20} />}
					/>

					<ActionsCell
						original={original}
						onDelete={() => openDeleteBucketDialog(original)}
						onEdit={() => openEditBucketDialog(original)}
						canEdit={canEditBucket}
						canDelete={canDeleteBucket}
					/>
				</div>
			);
		},
	},
];

export default BucketColumns;
