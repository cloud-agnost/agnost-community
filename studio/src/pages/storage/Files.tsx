import { BreadCrumb, BreadCrumbItem } from '@/components/BreadCrumb';
import { Button } from '@/components/Button';
import { DataTable } from '@/components/DataTable';
import { Progress } from '@/components/Progress';
import { MODULE_PAGE_SIZE } from '@/constants';
import { EditFile, FileColumns } from '@/features/storage';
import { useTable, useToast } from '@/hooks';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useStorageStore from '@/store/storage/storageStore';
import useVersionStore from '@/store/version/versionStore';
import { APIError, BucketCountInfo, TabTypes } from '@/types';
import { ArrowClockwise } from '@phosphor-icons/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Pagination } from '../version/navigator/Pagination';
export default function Files() {
	const [searchParams] = useSearchParams();
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

	const { refetch, isFetching } = useQuery({
		queryKey: [
			'getFilesOfBucket',
			storage?.name,
			bucket?.id,
			bucket?.name,
			searchParams.get('q'),
			searchParams.get('page'),
			searchParams.get('size'),
		],
		queryFn: () =>
			getFilesOfBucket({
				page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
				limit: searchParams.get('size') ? Number(searchParams.get('size')) : MODULE_PAGE_SIZE,
				returnCountInfo: true,
				search: searchParams.get('q') as string,
				storageName: storage?.name,
				bckId: bucket?.id as string,
				bucketName: bucket?.name as string,
			}),
		refetchOnWindowFocus: false,
		// enabled: isGridReady && modelId === model._id && window.location.pathname.includes(model._id),
		// &&
		// (dataCountInfo?.[modelId]?.currentPage === undefined ||
		// 	Math.ceil(data.length / MODULE_PAGE_SIZE) < (dataCountInfo?.[modelId]?.currentPage ?? 0)),
	});
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
			refetch();
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
						{!isRefreshing && <ArrowClockwise className='mr-1 w-3.5 h-3.5' />}
						{t('general.refresh')}
					</Button>
				}
			>
				<div className='space-y-6 h-full'>
					<DataTable
						table={table}
						containerClassName='table-fixed w-full h-[calc(100%-6rem)] overflow-auto relative'
						headerClassName='sticky top-0 z-10'
					/>
					<Pagination countInfo={fileCountInfo as BucketCountInfo} />
				</div>
				<EditFile open={isEditFileDialogOpen} onClose={closeFileEditDialog} />
			</VersionTabLayout>
		</>
	);
}
