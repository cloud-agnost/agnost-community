import { ActionsCell } from '@/components/ActionsCell';
import { Badge } from '@/components/Badge';
import { TableConfirmation } from '@/components/Table';
import { TabLink } from '@/features/version/Tabs';
import { toast } from '@/hooks/useToast';
import useOrganizationStore from '@/store/organization/organizationStore';
import useStorageStore from '@/store/storage/storageStore';
import { APIError, Bucket, ColumnDefWithClassName, TabTypes } from '@/types';
import { getVersionPermission, translate } from '@/utils';
import { Prohibit } from '@phosphor-icons/react';
import { QueryClient } from '@tanstack/react-query';
import { Checkbox } from 'components/Checkbox';
import { SortButton } from 'components/DataTable';
import { DateText } from 'components/DateText';

const { emptyBucket, openDeleteBucketDialog, openEditBucketDialog } = useStorageStore.getState();

const queryClient = new QueryClient();
async function clearBucket(bucketName: string) {
	const storage = useStorageStore.getState().storage;
	return queryClient
		.getMutationCache()
		.build(queryClient, {
			mutationFn: emptyBucket,
			onError: (error: APIError) => {
				toast({
					title: error.details,
					action: 'error',
				});
			},
		})
		.execute({
			storageName: storage?.name,
			bucketName,
			onSuccess: () => {
				toast({
					title: translate('storage.bucket.empty'),
					action: 'success',
				});
			},
			onError: ({ details }) => {
				toast({
					title: details,
					action: 'error',
				});
			},
		});
}

const BucketColumns: ColumnDefWithClassName<Bucket>[] = [
	{
		id: 'select',
		enableResizing: false,
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
		header: () => <SortButton text={translate('general.name')} field='name' />,
		accessorKey: 'name',
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
		header: () => (
			<SortButton text={translate('storage.bucket.visibility.title')} field='isPublic' />
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
		header: () => <SortButton text={translate('storage.bucket.tags')} field='tags' />,
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
		id: 'createdAt',
		header: () => (
			<SortButton
				className='whitespace-nowrap'
				text={translate('general.created_at')}
				field='createdAt'
			/>
		),
		accessorKey: 'createdAt',
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
		id: 'updatedAt',
		header: () => (
			<SortButton
				className='whitespace-nowrap'
				text={translate('general.updated_at')}
				field='updatedAt'
			/>
		),
		accessorKey: 'updatedAt',
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
			const canEditBucket = getVersionPermission('storage.update');
			const canDeleteBucket = getVersionPermission('storage.delete');
			return (
				<div className='flex items-center justify-end'>
					<TableConfirmation
						align='end'
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
