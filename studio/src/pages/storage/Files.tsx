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
import { APIError } from '@/types';
import { useMutation } from '@tanstack/react-query';
import _ from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';

export default function Files() {
	const [isRefreshing, setIsRefreshing] = useState(false);
	const { toast } = useToast();
	const { t } = useTranslation();
	const { getVersionDashboardPath } = useVersionStore();
	const {
		getFilesOfBucket,
		bucket,
		files,
		deleteMultipleFileFromBucket,
		fileCountInfo,
		storage,
		uploadFileToBucket,
		isEditFileDialogOpen,
		closeFileEditDialog,
		uploadProgress,
	} = useStorageStore();

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
			lastFetchedPage: _.isNil(fileCountInfo) ? undefined : fileCountInfo.currentPage - 1,
			dataLength: files.length,
			params: {
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
		mutationFn: deleteMultipleFileFromBucket,
		mutationKey: ['deleteMultipleFileFromBucket'],
		onSuccess: () => {
			table?.resetRowSelection();
		},
		onError: ({ details }: APIError) => {
			toast({ action: 'error', title: details });
		},
	});

	const { mutateAsync: updateFileMutation, isPending: uploadLoading } = useMutation({
		mutationFn: uploadFileToBucket,
		mutationKey: ['uploadFileToBucket'],
		onSuccess: () => {
			useStorageStore.setState({ uploadProgress: 0 });
		},
		onError: (error: APIError) => {
			toast({ action: 'error', title: error.details });
		},
	});

	function deleteMultipleFilesHandler() {
		deleteMultipleFileMutation({
			filePaths: table.getSelectedRowModel().rows.map((row) => row.original.path),
			storageName: storage?.name as string,
			bucketName: bucket?.name as string,
		});
	}

	function uploadFileHandler() {
		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.multiple = true;
		fileInput.onchange = (e) => {
			const files = (e.target as HTMLInputElement).files;
			if (!files) return;
			updateFileMutation({
				storageName: storage?.name,
				bucketName: bucket?.name,
				isPublic: true,
				upsert: true,
				files,
			});
		};
		fileInput.click();
	}
	async function onRefresh() {
		setIsRefreshing(true);
		await refetch();
		setIsRefreshing(false);
	}
	return (
		<VersionTabLayout
			searchable
			breadCrumb={<BreadCrumb goBackLink={bucketUrl} items={breadcrumbItems} />}
			isEmpty={files.length === 0}
			type='file'
			openCreateModal={uploadFileHandler}
			createButtonTitle={t('storage.file.upload')}
			emptyStateTitle={t('storage.file.empty_text')}
			onMultipleDelete={deleteMultipleFilesHandler}
			loading={isFetching && !files.length}
			table={table}
			handlerButton={
				<Button variant='secondary' onClick={onRefresh} iconOnly loading={isRefreshing}>
					{!isRefreshing && <Refresh className='mr-2 w-5 h-5' />}
					{t('general.refresh')}
				</Button>
			}
		>
			{uploadLoading && (uploadProgress > 0 || uploadProgress < 100) && (
				<Progress value={uploadProgress} />
			)}
			<InfiniteScroll
				scrollableTarget='version-layout'
				dataLength={files.length}
				next={fetchNextPage}
				hasMore={hasNextPage}
				loader={isFetchingNextPage && <TableLoading />}
			>
				<DataTable table={table} />
			</InfiniteScroll>
			<EditFile open={isEditFileDialogOpen} onClose={closeFileEditDialog} />
		</VersionTabLayout>
	);
}
