import { ActionsCell } from '@/components/ActionsCell';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { TableConfirmation } from '@/components/Table';
import { toast } from '@/hooks/useToast';
import useEnvironmentStore from '@/store/environment/environmentStore';
import useStorageStore from '@/store/storage/storageStore';
import { APIError, BucketFile } from '@/types';
import {
	DATE_TIME_FORMAT,
	convertUTC,
	formatFileSize,
	getVersionPermission,
	translate,
} from '@/utils';
import { Copy, Swap } from '@phosphor-icons/react';
import { QueryClient } from '@tanstack/react-query';
import { ColDef, ICellRendererParams, ValueFormatterParams } from 'ag-grid-community';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'components/Tooltip';
import { Link } from 'react-router-dom';

const { copyFileInBucket, replaceFileInBucket, openFileEditDialog, deleteFileFromBucket } =
	useStorageStore.getState();

const queryClient = new QueryClient();
async function deleteFileHandler(toDeleteFile: BucketFile) {
	const { bucket, storage, getFilesOfBucket, fileCountInfo } = useStorageStore.getState();
	const info = fileCountInfo?.[bucket.id];
	return queryClient
		.getMutationCache()
		.build(queryClient, {
			mutationFn: deleteFileFromBucket,
			onError: ({ details }: APIError) => {
				toast({
					title: details,
					action: 'error',
				});

				getFilesOfBucket({
					bckId: bucket.id,
					storageName: storage?.name,
					bucketName: bucket.name,
					limit: info?.pageSize ?? 25,
					page: info?.currentPage ?? 1,
					returnCountInfo: true,
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
const FileColumns: ColDef<BucketFile>[] = [
	{
		checkboxSelection: true,
		headerCheckboxSelection: true,
		width: 50,
		pinned: 'left',
	},
	{
		field: 'id',
		headerComponentParams: { text: translate('general.id'), field: 'id' },
	},
	{
		field: 'path',
		headerComponentParams: { text: translate('storage.file.path'), field: 'id' },
		width: 300,
		cellRenderer: ({ value, data }: ICellRendererParams) => {
			const environment = useEnvironmentStore.getState().environment;
			const publicPath = `${window.location.origin}/${environment?.iid}/agnost/object/${data.id}`;
			return (
				<Link to={publicPath} className='link' target='_blank' rel='noopener noreferrer'>
					{value}
				</Link>
			);
		},
	},
	{
		field: 'isPublic',
		headerComponentParams: {
			text: translate('storage.bucket.visibility.title'),
			field: 'isPublic',
		},
		cellRenderer: ({ value }: ICellRendererParams) => (
			<Badge
				variant={value ? 'green' : 'yellow'}
				text={
					value
						? translate('storage.bucket.visibility.public')
						: translate('storage.bucket.visibility.private')
				}
				rounded
			/>
		),
	},
	{
		field: 'size',
		headerComponentParams: {
			text: translate('storage.file.size'),
			field: 'isPublic',
		},
		valueFormatter: ({ value }: ValueFormatterParams) => formatFileSize(value),
	},
	{
		field: 'mimeType',
		headerComponentParams: {
			text: translate('storage.file.mimeType'),
			field: 'mimeType',
		},
	},
	{
		field: 'tags',
		headerComponentParams: {
			text: translate('storage.bucket.tags'),
			field: 'tags',
		},
		cellRenderer: ({ value }: ICellRendererParams) => {
			return (
				<div className='flex flex-wrap gap-4'>
					{Object.entries(value).map(([key, value]) => (
						<Badge key={key} variant='gray' text={`${key}: ${value}`} rounded />
					))}
				</div>
			);
		},
	},
	{
		field: 'uploadedAt',
		headerComponentParams: {
			text: translate('general.uploadedAt'),
			field: 'createdAt',
		},
		valueFormatter: ({ value }) => convertUTC(value, DATE_TIME_FORMAT),
	},
	{
		field: 'updatedAt',
		headerComponentParams: {
			text: translate('general.updated_at'),
			field: 'updatedAt',
		},
		valueFormatter: ({ value }) => convertUTC(value, DATE_TIME_FORMAT),
	},
	{
		pinned: 'right',
		cellRenderer: ({ data }: ICellRendererParams) => {
			const canEditBucket = getVersionPermission('storage.update');
			const canDeleteBucket = getVersionPermission('storage.delete');
			return (
				<div className='flex items-center justify-end'>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant='icon' size='sm' rounded onClick={() => copyFile(data.path)}>
									<Copy size={20} />
								</Button>
							</TooltipTrigger>
							<TooltipContent>{translate('storage.file.copy')}</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant='icon' size='sm' rounded onClick={() => replaceFile(data.path)}>
									<Swap size={20} />
								</Button>
							</TooltipTrigger>
							<TooltipContent>{translate('storage.file.replace')}</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					<ActionsCell
						original={data}
						onEdit={() => openFileEditDialog(data)}
						canEdit={canEditBucket}
						canDelete={canDeleteBucket}
					>
						<TableConfirmation
							align='end'
							title={translate('storage.file.delete.title')}
							description={translate('storage.file.delete.message')}
							onConfirm={() => deleteFileHandler(data)}
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
