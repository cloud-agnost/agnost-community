import { BreadCrumb, BreadCrumbItem } from '@/components/BreadCrumb';
import { Button } from '@/components/Button';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { MODULE_PAGE_SIZE } from '@/constants';
import { BucketColumns, CreateBucket } from '@/features/storage';
import { useToast } from '@/hooks';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useStorageStore from '@/store/storage/storageStore';
import { APIError, BucketCountInfo, TabTypes } from '@/types';
import { ArrowClockwise } from '@phosphor-icons/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { GridReadyEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css'; // Core CSS
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Theme
import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import { Pagination } from '../version/navigator/Pagination';
import { TableHeader } from '@/features/database/models/Navigator';
export default function Buckets() {
	const [isBucketCreateOpen, setIsBucketCreateOpen] = useState(false);
	const { toast } = useToast();
	const { t } = useTranslation();
	const { versionId, orgId, appId, storageId } = useParams();
	const [searchParams] = useSearchParams();
	const [selectedRowCount, setSelectedRowCount] = useState(0);
	const gridRef = useRef<AgGridReact<any>>(null);
	const {
		getBuckets,
		closeBucketDeleteDialog,
		buckets,
		toDeleteBucket,
		isBucketDeleteDialogOpen,
		deleteBucket,
		deleteMultipleBuckets,
		bucketCountInfo,
		storage,
	} = useStorageStore();

	const storageUrl = `/organization/${orgId}/apps/${appId}/version/${versionId}/storage`;
	const breadcrumbItems: BreadCrumbItem[] = [
		{
			name: t('storage.title').toString(),
			url: storageUrl,
		},
		{
			name: storage?.name,
		},
	];

	const { refetch, isFetching, isRefetching } = useQuery({
		queryKey: [
			'getBuckets',
			storage?.name,
			searchParams.get('q'),
			searchParams.get('page'),
			searchParams.get('size'),
		],
		queryFn: () =>
			getBuckets({
				page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
				limit: searchParams.get('size') ? Number(searchParams.get('size')) : MODULE_PAGE_SIZE,
				returnCountInfo: true,
				search: searchParams.get('q') as string,
				storageName: storage?.name,
			}),
		refetchOnWindowFocus: false,
		// enabled: isGridReady && modelId === model._id && window.location.pathname.includes(model._id),
		// &&
		// (dataCountInfo?.[modelId]?.currentPage === undefined ||
		// 	Math.ceil(data.length / MODULE_PAGE_SIZE) < (dataCountInfo?.[modelId]?.currentPage ?? 0)),
	});
	const {
		mutateAsync: deleteBucketMutation,
		isPending: deleteLoading,
		error: deleteError,
		reset,
	} = useMutation({
		mutationFn: () =>
			deleteBucket({
				storageName: storage?.name,
				bucketName: toDeleteBucket?.name as string,
				versionId: storage?.versionId,
			}),

		onSuccess: () => {
			refetch();
			closeBucketDeleteDialog();
		},
	});
	const { mutateAsync: deleteMultipleBucketsMutation } = useMutation({
		mutationFn: () =>
			deleteMultipleBuckets({
				deletedBuckets: gridRef.current?.api.getSelectedNodes().map(({ data: bucket }) => ({
					id: bucket.id,
					name: bucket.name,
				})) as { id: string; name: string }[],
				storageName: storage?.name,
				versionId: storage?.versionId,
			}),
		onSuccess: () => {
			setSelectedRowCount(0);
			gridRef.current?.api.deselectAll();
			refetch();
		},
		onError: ({ details }: APIError) => {
			toast({ action: 'error', title: details });
		},
	});

	useEffect(() => {
		refetch();
	}, [versionId, orgId, appId, storageId]);

	function onGridReady(event: GridReadyEvent) {
		event.api.showLoadingOverlay();
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
			<VersionTabLayout
				searchable
				isEmpty={buckets.length === 0}
				type={TabTypes.Bucket}
				openCreateModal={() => setIsBucketCreateOpen(true)}
				onMultipleDelete={deleteMultipleBucketsMutation}
				loading={isFetching && !buckets.length}
				breadCrumb={<BreadCrumb items={breadcrumbItems} />}
				selectedRowCount={selectedRowCount}
				onClearSelected={() => gridRef.current?.api.deselectAll()}
				handlerButton={
					<Button variant='secondary' onClick={() => refetch()} iconOnly loading={isRefetching}>
						{!isRefetching && <ArrowClockwise className='mr-1 w-3.5 h-3.5' />}
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
						rowData={buckets}
						columnDefs={BucketColumns}
						rowSelection='multiple'
						components={{
							agColumnHeader: TableHeader,
						}}
						autoSizePadding={20}
						ensureDomOrder
						suppressRowClickSelection
						enableCellTextSelection
						overlayLoadingTemplate={
							'<div class="flex space-x-6 justify-center items-center h-screen"><span class="sr-only">Loading...</span><div class="size-5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div><div class="size-5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div><div class="size-5 bg-brand-primary rounded-full animate-bounce"></div></div>'
						}
						onRowSelected={(event) =>
							setSelectedRowCount(event?.api.getSelectedNodes().length ?? 0)
						}
						columnHoverHighlight={false}
						defaultColDef={{
							resizable: true,
							flex: 1,
						}}
					/>
					<Pagination countInfo={bucketCountInfo as BucketCountInfo} />
				</div>
				<ConfirmationModal
					loading={deleteLoading}
					error={deleteError}
					title={t('storage.bucket.delete.title')}
					alertTitle={t('storage.bucket.delete.message')}
					alertDescription={t('storage.bucket.delete.description')}
					description={
						<Trans
							i18nKey='storage.bucket.delete.confirmCode'
							values={{ confirmCode: toDeleteBucket?.id }}
							components={{
								confirmCode: <span className='font-bold text-default' />,
							}}
						/>
					}
					confirmCode={toDeleteBucket?.id as string}
					onConfirm={deleteBucketMutation}
					isOpen={isBucketDeleteDialogOpen}
					closeModal={() => {
						reset();
						closeBucketDeleteDialog();
					}}
					closable
				/>
			</VersionTabLayout>
			<CreateBucket open={isBucketCreateOpen} onClose={() => setIsBucketCreateOpen(false)} />
		</>
	);
}
