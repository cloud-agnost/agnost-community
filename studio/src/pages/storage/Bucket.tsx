import { BreadCrumb, BreadCrumbItem } from '@/components/BreadCrumb';
import { Button } from '@/components/Button';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { DataTable } from '@/components/DataTable';
import { TableLoading } from '@/components/Table/Table';
import { Refresh } from '@/components/icons';
import { BucketColumns, CreateBucket } from '@/features/storage';
import { useInfiniteScroll, useTable, useToast } from '@/hooks';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useStorageStore from '@/store/storage/storageStore';
import { APIError } from '@/types';
import { useMutation } from '@tanstack/react-query';
import _ from 'lodash';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams } from 'react-router-dom';
export default function Buckets() {
	const [isBucketCreateOpen, setIsBucketCreateOpen] = useState(false);
	const { toast } = useToast();
	const [isRefreshing, setIsRefreshing] = useState(false);
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
			name: storage?.name,
		},
	];

	const table = useTable({
		data: buckets,
		columns: BucketColumns,
	});
	const { hasNextPage, isFetching, fetchNextPage, isFetchingNextPage, refetch } = useInfiniteScroll(
		{
			queryFn: getBuckets,
			queryKey: 'getBuckets',
			dataLength: buckets.length,
			disableVersionParams: true,
			lastFetchedPage: _.isNil(bucketCountInfo) ? undefined : bucketCountInfo.currentPage - 1,
			params: {
				storageName: storage?.name,
				returnCountInfo: true,
			},
		},
	);
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
			table?.resetRowSelection();
		},
		onError: ({ details }: APIError) => {
			toast({ action: 'error', title: details });
		},
	});

	async function onRefresh() {
		setIsRefreshing(true);
		await refetch();
		setIsRefreshing(false);
	}
	return (
		<>
			<VersionTabLayout
				searchable
				isEmpty={buckets.length === 0}
				type='bucket'
				openCreateModal={() => setIsBucketCreateOpen(true)}
				createButtonTitle={t('storage.bucket.create')}
				emptyStateTitle={t('storage.bucket.empty_text')}
				onMultipleDelete={deleteMultipleBucketsMutation}
				loading={isFetching && !buckets.length}
				breadCrumb={<BreadCrumb goBackLink={storageUrl} items={breadcrumbItems} />}
				table={table}
				handlerButton={
					<Button variant='secondary' onClick={onRefresh} iconOnly loading={isRefreshing}>
						{!isRefreshing && <Refresh className='mr-2 w-5 h-5' />}
						{t('general.refresh')}
					</Button>
				}
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
						onConfirm={deleteBucketMutation}
						isOpen={isBucketDeleteDialogOpen}
						closeModal={() => {
							reset();
							closeBucketDeleteDialog();
						}}
						closable
					/>
				</InfiniteScroll>
			</VersionTabLayout>
			<CreateBucket open={isBucketCreateOpen} onClose={() => setIsBucketCreateOpen(false)} />
		</>
	);
}
