import { BreadCrumb, BreadCrumbItem } from '@/components/BreadCrumb';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { DataTable } from '@/components/DataTable';
import { TableLoading } from '@/components/Table/Table';
import { PAGE_SIZE } from '@/constants';
import { BucketColumns } from '@/features/storage';
import { useToast } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useApplicationStore from '@/store/app/applicationStore';
import useStorageStore from '@/store/storage/storageStore';
import { APIError, AppRoles, Bucket } from '@/types';
import { getAppPermission } from '@/utils';
import { Row, Table } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
	LoaderFunctionArgs,
	redirect,
	useNavigate,
	useOutletContext,
	useParams,
	useSearchParams,
} from 'react-router-dom';
Buckets.loader = async ({ params }: LoaderFunctionArgs) => {
	const role = useApplicationStore.getState().application?.role;

	const { storageId, appId, orgId, versionId } = params;
	const { storage, storages } = useStorageStore.getState();

	if (storageId !== storage?._id) {
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
	}

	const permission = getAppPermission(role as AppRoles, 'app.storage.viewData');
	if (!permission) {
		return redirect('/404');
	}

	return { props: {} };
};

interface OutletContext {
	setIsBucketCreateOpen: (isOpen: boolean) => void;
	selectedBuckets: Row<Bucket>[];
	setSelectedBuckets: (rows: Row<Bucket>[]) => void;
	bucketTable: Table<Bucket>;
	setBucketTable: (table: Table<Bucket>) => void;
	bucketPage: number;
	setBucketPage: (page: number) => void;
}

export default function Buckets() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<APIError>();
	const { notify } = useToast();
	const [searchParams, setSearchParams] = useSearchParams();
	const { t } = useTranslation();
	const { versionId, orgId, appId } = useParams();
	const navigate = useNavigate();
	const viewData = useAuthorizeVersion('storage.viewData');

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

	const {
		setIsBucketCreateOpen,
		selectedBuckets,
		setSelectedBuckets,
		bucketTable,
		setBucketTable,
		bucketPage,
		setBucketPage,
	}: OutletContext = useOutletContext();
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

	function onInput(value: string) {
		value = value.trim();
		if (!value) {
			searchParams.delete('q');
			setSearchParams(searchParams);
			return;
		}
		setBucketPage(1);
		setSearchParams({ ...searchParams, q: value });
	}

	function deleteMultipleBucketsHandler() {
		deleteMultipleBuckets({
			bucketNames: selectedBuckets.map((row) => row.original.name),
			storageName: storage?.name,
			onSuccess: () => {
				bucketTable.toggleAllRowsSelected(false);
				setBucketPage(1);
			},
			onError: ({ error, details }) => {
				notify({ type: 'error', description: details, title: error });
			},
		});
	}
	function deleteBucketHandler() {
		setLoading(true);
		deleteBucket({
			storageName: storage?.name,
			bucketName: toDeleteBucket?.name as string,
			onSuccess: () => {
				setLoading(false);
				closeBucketDeleteDialog();
			},
			onError: (error) => {
				setError(error);
				setLoading(false);
				closeBucketDeleteDialog();
			},
		});
	}

	useEffect(() => {
		if (versionId && orgId && appId) {
			getBuckets({
				storageName: storage?.name,
				page: bucketPage,
				limit: PAGE_SIZE,
				search: searchParams.get('q') as string,
				returnCountInfo: true,
			});
		}
	}, [searchParams.get('q'), bucketPage, versionId, storage?.name]);

	useEffect(() => {
		if (!viewData) {
			navigate('/404');
		}
	}, [viewData]);

	return (
		<VersionTabLayout
			isEmpty={buckets.length === 0}
			title={t('storage.buckets')}
			type='bucket'
			openCreateModal={() => setIsBucketCreateOpen(true)}
			createButtonTitle={t('storage.bucket.create')}
			emptyStateTitle={t('storage.bucket.empty_text')}
			table={bucketTable}
			selectedRowLength={selectedBuckets?.length}
			onSearch={onInput}
			onMultipleDelete={deleteMultipleBucketsHandler}
			breadCrumb={<BreadCrumb goBackLink={storageUrl} items={breadcrumbItems} />}
		>
			<InfiniteScroll
				scrollableTarget='version-layout'
				dataLength={buckets.length}
				next={() => {
					setBucketPage(bucketPage + 1);
				}}
				hasMore={bucketCountInfo.count >= PAGE_SIZE}
				loader={buckets.length > 0 && <TableLoading />}
			>
				<DataTable
					columns={BucketColumns}
					data={buckets}
					setSelectedRows={setSelectedBuckets}
					setTable={setBucketTable}
				/>
				<ConfirmationModal
					loading={loading}
					error={error}
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
	);
}
