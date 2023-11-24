import { BreadCrumb, BreadCrumbItem } from '@/components/BreadCrumb';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { DataTable } from '@/components/DataTable';
import { TableLoading } from '@/components/Table/Table';
import { BucketColumns, CreateBucket } from '@/features/storage';
import { useInfiniteScroll, useTable, useToast } from '@/hooks';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useStorageStore from '@/store/storage/storageStore';
import { APIError } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams } from 'react-router-dom';
export default function Buckets() {
	const [isBucketCreateOpen, setIsBucketCreateOpen] = useState(false);
	const { notify } = useToast();
	const { t } = useTranslation();
	const { versionId, orgId, appId } = useParams();
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
			name: storage?.name as string,
		},
	];

	const table = useTable({
		data: buckets,
		columns: BucketColumns,
	});
	const { hasNextPage, isFetching, fetchNextPage, isFetchingNextPage } = useInfiniteScroll({
		queryFn: getBuckets,
		queryKey: 'getBuckets',
		dataLength: buckets.length,
		lastFetchedPage: bucketCountInfo.currentPage ? bucketCountInfo.currentPage - 1 : 0,
		params: {
			storageName: storage?.name,
			returnCountInfo: true,
		},
	});

	const {
		mutateAsync: deleteBucketMutation,
		isPending: deleteLoading,
		error: deleteError,
	} = useMutation({
		mutationFn: deleteBucket,
		onSettled: () => {
			closeBucketDeleteDialog();
		},
	});
	const { mutateAsync: deleteMultipleBucketsMutation } = useMutation({
		mutationFn: deleteMultipleBuckets,
		onSuccess: () => {
			table?.resetRowSelection();
		},
		onError: ({ error, details }: APIError) => {
			notify({ type: 'error', description: details, title: error });
		},
	});

	function deleteMultipleBucketsHandler() {
		deleteMultipleBucketsMutation({
			deletedBuckets: table.getSelectedRowModel().rows.map(({ original: bucket }) => ({
				id: bucket.id,
				name: bucket.name,
			})),
			storageName: storage?.name,
			versionId: storage?.versionId,
		});
	}
	function deleteBucketHandler() {
		console.log(toDeleteBucket);
		deleteBucketMutation({
			storageName: storage?.name,
			bucketName: toDeleteBucket?.name as string,
			versionId: storage?.versionId,
		});
	}
	return (
		<>
			<VersionTabLayout
				searchable
				isEmpty={buckets.length === 0}
				title={t('storage.buckets')}
				type='bucket'
				openCreateModal={() => setIsBucketCreateOpen(true)}
				createButtonTitle={t('storage.bucket.create')}
				emptyStateTitle={t('storage.bucket.empty_text')}
				onMultipleDelete={deleteMultipleBucketsHandler}
				loading={isFetching && !buckets.length}
				breadCrumb={<BreadCrumb goBackLink={storageUrl} items={breadcrumbItems} />}
				table={table}
			>
				<InfiniteScroll
					scrollableTarget='version-layout'
					dataLength={buckets.length}
					next={fetchNextPage}
					hasMore={hasNextPage}
					loader={isFetchingNextPage && <TableLoading />}
				>
					<DataTable table={table} />
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
						onConfirm={deleteBucketHandler}
						isOpen={isBucketDeleteDialogOpen}
						closeModal={closeBucketDeleteDialog}
						closable
					/>
				</InfiniteScroll>
			</VersionTabLayout>
			<CreateBucket open={isBucketCreateOpen} onClose={() => setIsBucketCreateOpen(false)} />
		</>
	);
}
