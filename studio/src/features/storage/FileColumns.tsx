import { ActionsCell } from '@/components/ActionsCell';
import { Badge } from '@/components/Badge';
import { TableConfirmation } from '@/components/Table';
import useEnvironmentStore from '@/store/environment/environmentStore';
import useStorageStore from '@/store/storage/storageStore';
import { APIError, BucketFile, ColumnDefWithClassName } from '@/types';
import { formatFileSize, getVersionPermission, translate } from '@/utils';
import { Copy, Swap } from '@phosphor-icons/react';
import { QueryClient } from '@tanstack/react-query';
import { Button } from '@/components/Button';
import { Checkbox } from 'components/Checkbox';
import { SortButton } from 'components/DataTable';
import { DateText } from 'components/DateText';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'components/Tooltip';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/useToast';
const { copyFileInBucket, replaceFileInBucket, openFileEditDialog, deleteFileFromBucket } =
	useStorageStore.getState();

const queryClient = new QueryClient();
async function deleteFileHandler(toDeleteFile: BucketFile) {
	const { bucket, storage } = useStorageStore.getState();
	return queryClient
		.getMutationCache()
		.build(queryClient, {
			mutationFn: deleteFileFromBucket,
			onError: ({ details }: APIError) => {
				toast({
					title: details,
					action: 'error',
				});
			},
		})
		.execute({
			bckId: bucket.id,
			storageName: storage?.name,
			bucketName: bucket.name,
			filePath: toDeleteFile.path,
		});
}

function replaceFile(filePath: string) {
	const { bucket, storage } = useStorageStore.getState();
	const input = document.createElement('input');
	input.type = 'file';
	input.onchange = (e) => {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		queryClient
			.getMutationCache()
			.build(queryClient, {
				mutationFn: replaceFileInBucket,
				onSuccess: () => {
					toast({
						title: translate('storage.file.replace_success'),
						action: 'success',
					});
				},
				onError: ({ details }: APIError) => {
					toast({
						title: details,
						action: 'error',
					});
				},
			})
			.execute({
				bckId: bucket.id,
				storageName: storage?.name,
				bucketName: bucket.name,
				filePath,
				file,
			});
	};
	input.click();
}
function copyFile(filePath: string) {
	const { bucket, storage } = useStorageStore.getState();
	queryClient
		.getMutationCache()
		.build(queryClient, {
			mutationFn: copyFileInBucket,
			onSuccess: () => {
				toast({
					title: translate('storage.file.copy_success'),
					action: 'success',
				});
			},
			onError: ({ details }: APIError) => {
				toast({
					title: details,
					action: 'error',
				});
			},
		})
		.execute({
			bckId: bucket.id,
			storageName: storage?.name,
			bucketName: bucket.name,
			filePath,
		});
}
const FileColumns: ColumnDefWithClassName<BucketFile>[] = [
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
	},
	{
		id: 'id',
		header: () => <SortButton text={translate('general.id')} field='id' />,
		accessorKey: 'id',
	},
	{
		id: 'path',
		header: () => <SortButton text={translate('storage.file.path')} field='path' />,
		accessorKey: 'path',
		className: '!w-[300px]',
		cell: ({ row: { original } }) => {
			const environment = useEnvironmentStore.getState().environment;
			const publicPath = `${window.location.origin}/${environment?.iid}/agnost/object/${original.id}`;
			return (
				<Link to={publicPath} className='link' target='_blank' rel='noopener noreferrer'>
					{original.path}
				</Link>
			);
		},
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
		id: 'size',
		header: () => <SortButton text={translate('storage.file.size')} field='size' />,
		accessorKey: 'size',
		sortingFn: 'textCaseSensitive',
		cell: ({
			row: {
				original: { size },
			},
		}) => formatFileSize(size),
	},
	{
		id: 'mimeType',
		header: () => <SortButton text={translate('storage.file.mimeType')} field='mimeType' />,
		accessorKey: 'mimeType',
		sortingFn: 'textCaseSensitive',
	},
	{
		id: 'tags',
		header: translate('storage.bucket.tags'),
		accessorKey: 'tags',
		size: 300,
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
		id: 'uploadedAt',
		header: () => (
			<SortButton
				className='whitespace-nowrap'
				text={translate('general.created_at')}
				field='uploadedAt'
			/>
		),
		accessorKey: 'uploadedAt',
		size: 200,
		cell: ({
			row: {
				original: { uploadedAt },
			},
		}) => {
			return <DateText date={uploadedAt} />;
		},
	},

	{
		id: 'actions',
		className: 'actions w-[50px]',
		size: 50,
		cell: ({ row: { original } }) => {
			const canEditBucket = getVersionPermission('storage.update');
			const canDeleteBucket = getVersionPermission('storage.delete');
			return (
				<div className='flex items-center justify-end'>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant='icon' rounded onClick={() => copyFile(original.path)}>
									<Copy />
								</Button>
							</TooltipTrigger>
							<TooltipContent>{translate('storage.file.copy')}</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant='icon' rounded onClick={() => replaceFile(original.path)}>
									<Swap />
								</Button>
							</TooltipTrigger>
							<TooltipContent>{translate('storage.file.replace')}</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					<ActionsCell
						original={original}
						onEdit={() => openFileEditDialog(original)}
						canEdit={canEditBucket}
						canDelete={canDeleteBucket}
					>
						<TableConfirmation
							align='end'
							title={translate('storage.file.delete.title')}
							description={translate('storage.file.delete.message')}
							onConfirm={() => deleteFileHandler(original)}
							contentClassName='m-0'
							hasPermission={canDeleteBucket}
						/>
					</ActionsCell>
				</div>
			);
		},
	},
];

export default FileColumns;
