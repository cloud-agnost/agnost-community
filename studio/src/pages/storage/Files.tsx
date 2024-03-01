import { BreadCrumb, BreadCrumbItem } from '@/components/BreadCrumb';
import { Button } from '@/components/Button';
import { Progress } from '@/components/Progress';
import { MODULE_PAGE_SIZE } from '@/constants';
import TableHeader from '@/features/database/models/Navigator/TableHeader';
import { EditFile, FileColumns } from '@/features/storage';
import { useToast } from '@/hooks';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useStorageStore from '@/store/storage/storageStore';
import useVersionStore from '@/store/version/versionStore';
import { APIError, BucketCountInfo, TabTypes } from '@/types';
import { ArrowClockwise } from '@phosphor-icons/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import _ from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Pagination } from '../version/navigator/Pagination';
export default function Files() {
	const [searchParams] = useSearchParams();
	const [selectedRowCount, setSelectedRowCount] = useState(0);
	const gridRef = useRef<AgGridReact<any>>(null);
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

	const { mutateAsync: deleteMultipleFileMutation } = useMutation({
		mutationFn: () =>
			deleteMultipleFileFromBucket({
				filePaths: gridRef.current?.api
					.getSelectedNodes()
					.map((node) => node.data.path) as string[],
				storageName: storage?.name as string,
				bucketName: bucket?.name as string,
				bckId: bucket?.id as string,
			}),
		mutationKey: ['deleteMultipleFileFromBucket'],
		onSuccess: () => {
			gridRef.current?.api.deselectAll();
			refetch();
			setSelectedRowCount(0);
		},
		onError: ({ details }: APIError) => {
			toast({ action: 'error', title: details });
		},
	});

	const { mutateAsync: uploadFileMutation, isPending: uploadLoading } = useMutation({
		mutationFn: (files: FileList | null) =>
			uploadFileToBucket({
				bckId: bucket?.id,
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
			refetch();
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

	function onGridReady(event: GridReadyEvent) {
		event.api.sizeColumnsToFit();
	}

	useEffect(() => {
		if (!_.isNil(gridRef.current?.api)) {
			if (isFetching) {
				gridRef.current.api.showLoadingOverlay();
			} else {
				gridRef.current.api.hideOverlay();
			}
		}
	}, [isFetching, gridRef.current]);
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
				selectedRowCount={selectedRowCount}
				onClearSelected={() => gridRef.current?.api.deselectAll()}
				handlerButton={
					<Button variant='secondary' onClick={() => refetch()} iconOnly>
						<ArrowClockwise className='mr-1 w-3.5 h-3.5' />
						{t('general.refresh')}
					</Button>
				}
			>
				<div className='ag-theme-alpine-dark h-full flex flex-col rounded'>
					<AgGridReact
						ref={gridRef}
						onGridReady={onGridReady}
						key={storage._id}
						className='flex-1 h-[500px]'
						rowData={files}
						columnDefs={FileColumns}
						rowSelection='multiple'
						components={{
							agColumnHeader: TableHeader,
						}}
						ensureDomOrder
						suppressRowClickSelection
						enableCellTextSelection
						overlayLoadingTemplate={
							'<div class="flex space-x-6 justify-center items-center h-screen"><span class="sr-only">Loading...</span><div class="size-5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div><div class="size-5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div><div class="size-5 bg-brand-primary rounded-full animate-bounce"></div></div>'
						}
						onRowSelected={(event) =>
							setSelectedRowCount(event?.api.getSelectedNodes().length ?? 0)
						}
						defaultColDef={{
							resizable: true,
							flex: 1,
						}}
					/>
					<Pagination countInfo={fileCountInfo as BucketCountInfo} />
				</div>
				<EditFile open={isEditFileDialogOpen} onClose={closeFileEditDialog} />
			</VersionTabLayout>
		</>
	);
}
