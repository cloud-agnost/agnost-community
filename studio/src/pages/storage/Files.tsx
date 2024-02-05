import { BreadCrumb, BreadCrumbItem } from '@/components/BreadCrumb';
import { Button } from '@/components/Button';
import { DataTable } from '@/components/DataTable';
import { Progress } from '@/components/Progress';
import { TableLoading } from '@/components/Table/Table';
import { Refresh } from '@/components/icons';
import { EditFile, FileColumns } from '@/features/storage';
import { useInfiniteScroll, useTable, useToast } from '@/hooks';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useStorageStore from '@/store/storage/storageStore';
import useVersionStore from '@/store/version/versionStore';
import { APIError, TabTypes } from '@/types';
import { useMutation } from '@tanstack/react-query';
import _ from 'lodash';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';

export default function Files() {
	const [isRefreshing, setIsRefreshing] = useState(false);
	const { toast } = useToast();
	const { t } = useTranslation();
	const { getVersionDashboardPath } = useVersionStore();
	const {
		files: stateFiles,
		getFilesOfBucket,
		bucket,
		deleteMultipleFileFromBucket,
		storage,
		uploadFileToBucket,
		isEditFileDialogOpen,
		closeFileEditDialog,
		uploadProgress,
		fileCountInfo: stateInfo,
	} = useStorageStore();
	const files = useMemo(() => stateFiles[bucket.id] ?? [], [bucket.id, stateFiles]);
	const fileCountInfo = useMemo(() => stateInfo?.[bucket.id], [bucket.id, stateInfo]);
	const storageUrl = getVersionDashboardPath('/storage');
	const bucketUrl = `${storageUrl}/${storage._id}`;
	const breadcrumbItems: BreadCrumbItem[] = [
		{
			name: t('storage.title').toString(),
			url: storageUrl,
		},
		{
			name: storage.name,
			url: bucketUrl,
		},
		{
			name: bucket?.name as string,
		},
	];

	const { isFetching, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } = useInfiniteScroll(
		{
			queryFn: getFilesOfBucket,
			queryKey: 'getFilesOfBucket',
			lastFetchedPage: _.isNil(fileCountInfo) ? undefined : fileCountInfo?.currentPage - 1,
			dataLength: files?.length,
			disableVersionParams: true,
			params: {
				bckId: bucket?.id as string,
				storageName: storage?.name as string,
				bucketName: bucket?.name as string,
				returnCountInfo: true,
			},
		},
	);
	const table = useTable({
		data: files,
		columns: FileColumns,
	});

	const { mutateAsync: deleteMultipleFileMutation } = useMutation({
		mutationFn: () =>
			deleteMultipleFileFromBucket({
				filePaths: table.getSelectedRowModel().rows.map((row) => row.original.path),
				storageName: storage?.name as string,
				bucketName: bucket?.name as string,
				bckId: bucket?.id as string,
			}),
		mutationKey: ['deleteMultipleFileFromBucket'],
		onSuccess: () => {
			table?.resetRowSelection();
		},
		onError: ({ details }: APIError) => {
			table?.resetRowSelection();
			toast({ action: 'error', title: details });
		},
	});

	const { mutateAsync: uploadFileMutation, isPending: uploadLoading } = useMutation({
		mutationFn: (files: FileList | null) =>
			uploadFileToBucket({
				bckId: bucket?.id as string,
				storageName: storage?.name,
				bucketName: bucket?.name,
				isPublic: true,
				upsert: true,
				files: files as FileList,
			}),
		mutationKey: ['uploadFileToBucket'],
		onSuccess: () => {
			toast({ action: 'success', title: t('storage.upload_success') as string });
			useStorageStore.setState({ uploadProgress: 0 });
		},
		onError: (error: APIError) => {
			toast({ action: 'error', title: error.details });
		},
	});

	function uploadFileHandler() {
		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.multiple = true;
		fileInput.onchange = (e) => {
			const files = (e.target as HTMLInputElement).files;
			if (!files) return;
			uploadFileMutation(files);
		};
		fileInput.click();
	}
	async function onRefresh() {
		setIsRefreshing(true);
		await refetch();
		setIsRefreshing(false);
	}
	return (
		<>
			{uploadLoading && (uploadProgress > 0 || uploadProgress < 100) && (
				<Progress value={uploadProgress} className='mb-5' />
			)}
			<VersionTabLayout
				searchable
				breadCrumb={<BreadCrumb items={breadcrumbItems} />}
				isEmpty={files?.length === 0}
				type={TabTypes.File}
				openCreateModal={uploadFileHandler}
				onMultipleDelete={deleteMultipleFileMutation}
				loading={isFetching && (!files?.length || files[0].bucketId !== bucket.id)}
				selectedRowCount={table.getSelectedRowModel().rows.length}
				onClearSelected={() => table.toggleAllRowsSelected(false)}
				handlerButton={
					<Button variant='secondary' onClick={onRefresh} iconOnly loading={isRefreshing}>
						{!isRefreshing && <Refresh className='mr-1 w-3.5 h-3.5' />}
						{t('general.refresh')}
					</Button>
				}
			>
				<InfiniteScroll
					scrollableTarget='version-layout'
					dataLength={files?.length}
					next={fetchNextPage}
					hasMore={hasNextPage}
					loader={isFetchingNextPage && <TableLoading />}
				>
					<DataTable table={table} />
				</InfiniteScroll>
				<EditFile open={isEditFileDialogOpen} onClose={closeFileEditDialog} />
			</VersionTabLayout>
		</>
	);
}
