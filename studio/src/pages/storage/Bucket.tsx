import { BreadCrumb, BreadCrumbItem } from '@/components/BreadCrumb';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { DataTable } from '@/components/DataTable';
import { TableLoading } from '@/components/Table/Table';
import { BucketColumns, CreateBucket } from '@/features/storage';
import { useInfiniteScroll, useTable, useToast } from '@/hooks';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useApplicationStore from '@/store/app/applicationStore';
import useStorageStore from '@/store/storage/storageStore';
import { APIError } from '@/types';
import { getAppPermission } from '@/utils';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { LoaderFunctionArgs, redirect, useParams } from 'react-router-dom';
Buckets.loader = async ({ params }: LoaderFunctionArgs) => {
	const role = useApplicationStore.getState().application?.role;

	const { storageId, appId, orgId, versionId } = params;
	const { storages } = useStorageStore.getState();

	let selectedStorage = storages.find((storage) => storage._id === storageId);
	if (!selectedStorage) {
		selectedStorage = await useStorageStore.getState().getStorageById({
			storageId: storageId as string,
			appId: appId as string,
			orgId: orgId as string,
			versionId: versionId as string,
		});
	}
	useStorageStore.setState({ storage: selectedStorage });

	const permission = getAppPermission(`${role}.app.storage.viewData`);

	if (!permission) {
		return redirect('/401');
	}

	return { props: {} };
};

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
			name: t('storage.buckets') as string,
		},
	];

	const table = useTable({
		data: buckets,
		columns: BucketColumns,
	});
	const { hasNextPage, isPending, fetchNextPage } = useInfiniteScroll({
		queryFn: getBuckets,
		queryKey: 'getBuckets',
		dataLength: buckets.length,
		lastFetchedPage: bucketCountInfo.currentPage ?? 0,
		params: {
			storageName: storage?.name,
			returnCountInfo: true,
		},
	});

	const {
		mutationAsync: deleteBucketMutation,
		isPending: deleteLoading,
		error: deleteError,
	} = useMutation({
		mutationFn: deleteBucket,
		onSettled: () => {
			closeBucketDeleteDialog();
		},
	});
	const { mutationAsync: deleteMultipleBucketsMutation } = useMutation({
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
			bucketNames: table.getSelectedRowModel().rows.map((bucket) => bucket.original.name),
			storageName: storage?.name,
		});
	}
	function deleteBucketHandler() {
		deleteBucketMutation({
			storageName: storage?.name,
			bucketName: toDeleteBucket?.name as string,
		});
	}

	return (
		<>
			<VersionTabLayout
				isEmpty={buckets.length === 0}
				title={t('storage.buckets')}
				type='bucket'
				openCreateModal={() => setIsBucketCreateOpen(true)}
				createButtonTitle={t('storage.bucket.create')}
				emptyStateTitle={t('storage.bucket.empty_text')}
				onMultipleDelete={deleteMultipleBucketsHandler}
				loading={isPending && !buckets.length}
				breadCrumb={<BreadCrumb goBackLink={storageUrl} items={breadcrumbItems} />}
			>
				<InfiniteScroll
					scrollableTarget='version-layout'
					dataLength={buckets.length}
					next={fetchNextPage}
					hasMore={hasNextPage}
					loader={isPending && <TableLoading />}
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
