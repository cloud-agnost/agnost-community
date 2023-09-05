import { ActionsCell } from '@/components/ActionsCell';
import { Badge } from '@/components/Badge';
import useEnvironmentStore from '@/store/environment/environmentStore';
import useStorageStore from '@/store/storage/storageStore';
import { BucketFile, ColumnDefWithClassName } from '@/types';
import { notify, translate, formatFileSize } from '@/utils';
import { Copy, Swap } from '@phosphor-icons/react';
import { Button } from 'components/Button';
import { Checkbox } from 'components/Checkbox';
import { SortButton } from 'components/DataTable';
import { DateText } from 'components/DateText';
import { Link } from 'react-router-dom';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from 'components/Tooltip';
const FileColumns: ColumnDefWithClassName<BucketFile>[] = [
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
		id: 'id',
		header: ({ column }) => <SortButton text={translate('general.id')} column={column} />,
		accessorKey: 'id',
		sortingFn: 'textCaseSensitive',
	},
	{
		id: 'path',
		header: ({ column }) => <SortButton text={translate('storage.file.path')} column={column} />,
		accessorKey: 'path',
		sortingFn: 'textCaseSensitive',
		className: '!w-[300px]',
		cell: ({ row: { original } }) => {
			const environment = useEnvironmentStore.getState().environment;
			const publicPath = `${window.location.origin}/${environment?.iid}/object/${original.id}`;
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
		id: 'size',
		header: ({ column }) => <SortButton text={translate('storage.file.size')} column={column} />,
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
		header: ({ column }) => (
			<SortButton text={translate('storage.file.mimeType')} column={column} />
		),
		accessorKey: 'mimeType',
		sortingFn: 'textCaseSensitive',
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
			const {
				copyFileInBucket,
				replaceFileInBucket,
				openDeleteFileDialog,
				openFileEditDialog,
				storage,
				bucket,
			} = useStorageStore.getState();

			function replaceFile() {
				const input = document.createElement('input');
				input.type = 'file';
				input.onchange = (e) => {
					const file = (e.target as HTMLInputElement).files?.[0];
					if (!file) return;
					replaceFileInBucket({
						storageName: storage?.name,
						bucketName: bucket.name,
						filePath: original.path,
						file,
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
				};
				input.click();
			}
			function copyFile() {
				copyFileInBucket({
					storageName: storage?.name,
					bucketName: bucket.name,
					filePath: original.path,
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
			return (
				<div className='flex items-center justify-end'>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									iconOnly
									variant='blank'
									rounded
									className='text-xl hover:bg-wrapper-background-hover text-icon-base'
									onClick={copyFile}
								>
									<Copy />
								</Button>
							</TooltipTrigger>
							<TooltipContent>{translate('storage.file.copy')}</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									iconOnly
									variant='blank'
									rounded
									className='text-xl hover:bg-wrapper-background-hover text-icon-base'
									onClick={replaceFile}
								>
									<Swap />
								</Button>
							</TooltipTrigger>
							<TooltipContent>{translate('storage.file.replace')}</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					<ActionsCell
						original={original}
						onDelete={() => openDeleteFileDialog(original)}
						onEdit={() => openFileEditDialog(original)}
						canEditKey='storage.update'
						canDeleteKey='storage.delete'
						type='version'
					/>
				</div>
			);
		},
	},
];

export default FileColumns;
