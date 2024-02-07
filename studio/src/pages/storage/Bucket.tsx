import { BreadCrumb, BreadCrumbItem } from '@/components/BreadCrumb';
import { Button } from '@/components/Button';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { DataTable } from '@/components/DataTable';
import { MODULE_PAGE_SIZE } from '@/constants';
import { BucketColumns, CreateBucket } from '@/features/storage';
import { useTable, useToast } from '@/hooks';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useStorageStore from '@/store/storage/storageStore';
import { APIError, BucketCountInfo, TabTypes } from '@/types';
import { ArrowClockwise } from '@phosphor-icons/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import { Pagination } from '../version/navigator/Pagination';
export default function Buckets() {
	const [isBucketCreateOpen, setIsBucketCreateOpen] = useState(false);
	const { toast } = useToast();
	const { t } = useTranslation();
	const { versionId, orgId, appId, storageId } = useParams();
	const [searchParams] = useSearchParams();
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

	const table = useTable({
		data: buckets,
		columns: BucketColumns,
	});

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
				deletedBuckets: table.getSelectedRowModel().rows.map(({ original: bucket }) => ({
					id: bucket.id,
					name: bucket.name,
				})),
				storageName: storage?.name,
				versionId: storage?.versionId,
			}),
		onSuccess: () => {
			refetch();
			table?.resetRowSelection();
		},
		onError: ({ details }: APIError) => {
			toast({ action: 'error', title: details });
		},
	});

	useEffect(() => {
		refetch();
	}, [versionId, orgId, appId, storageId]);
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
				selectedRowCount={table.getSelectedRowModel().rows.length}
				onClearSelected={() => table.toggleAllRowsSelected(false)}
				handlerButton={
					<Button variant='secondary' onClick={() => refetch()} iconOnly loading={isRefetching}>
						{!isRefetching && <ArrowClockwise className='mr-1 w-3.5 h-3.5' />}
						{t('general.refresh')}
					</Button>
				}
			>
				<DataTable
					table={table}
					containerClassName='table-fixed w-full h-[calc(100%-5.5rem)] overflow-auto relative'
					headerClassName='sticky top-0 z-10'
				/>
				<Pagination countInfo={bucketCountInfo as BucketCountInfo} />
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
