import { BreadCrumb, BreadCrumbItem } from '@/components/BreadCrumb';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { DataTable } from '@/components/DataTable';
import { Progress } from '@/components/Progress';
import { TableLoading } from '@/components/Table/Table';
import { PAGE_SIZE } from '@/constants';
import { EditFile, FileColumns } from '@/features/storage';
import { useToast } from '@/hooks';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useStorageStore from '@/store/storage/storageStore';
import { APIError, BucketFile } from '@/types';
import { Row, Table } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { LoaderFunctionArgs, useSearchParams } from 'react-router-dom';

Files.Loader = async ({ params }: LoaderFunctionArgs) => {
	const { bucketName } = params;
	const { bucket, buckets, storage, getBucket } = useStorageStore.getState();
	if (bucketName !== bucket?.name) {
		let selectedBucket = buckets.find((bucket) => bucket.name === bucketName);
		if (!selectedBucket) {
			selectedBucket = await getBucket({
				storageName: storage?.name as string,
				bucketName: bucketName as string,
			});
		}
		useStorageStore.setState({ bucket: selectedBucket });
	}
	return { props: {} };
};

export default function Files() {
	const [selectedRows, setSelectedRows] = useState<Row<BucketFile>[]>([]);
	const [table, setTable] = useState<Table<BucketFile>>();
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<APIError>();
	const { notify } = useToast();
	const [searchParams] = useSearchParams();
	const { t } = useTranslation();

	const {
		getFilesOfBucket,
		bucket,
		files,
		toDeleteFile,
		deleteFileFromBucket,
		deleteMultipleFileFromBucket,
		fileCountInfo,
		storage,
		closeDeleteFileDialog,
		isFileDeleteDialogOpen,
		uploadFileToBucket,
		isEditFileDialogOpen,
		closeFileEditDialog,
		uploadProgress,
	} = useStorageStore();

	const storageUrl = `/organization/${storage?.orgId}/apps/${storage?.appId}/version/${storage?.versionId}/storage`;
	const bucketUrl = `${storageUrl}/${storage._id}`;
	const breadcrumbItems: BreadCrumbItem[] = [
		{
			name: t('storage.title').toString(),
			url: storageUrl,
		},
		{
			name: t('storage.buckets') as string,
			url: bucketUrl,
		},
		{
			name: bucket?.name as string,
		},
	];
	function deleteMultipleFilesHandler() {
		deleteMultipleFileFromBucket({
			filePaths: selectedRows.map((row) => row.original.path),
			storageName: storage?.name as string,
			bucketName: bucket?.name as string,
			onSuccess: () => {
				table?.toggleAllRowsSelected(false);
				setPage(1);
			},
			onError: ({ error, details }) => {
				notify({ type: 'error', description: details, title: error });
			},
		});
	}
	function deleteFileHandler() {
		setLoading(true);
		deleteFileFromBucket({
			storageName: storage?.name as string,
			bucketName: bucket?.name as string,
			filePath: toDeleteFile?.path as string,
			onSuccess: () => {
				setLoading(false);
				closeDeleteFileDialog();
			},
			onError: (error) => {
				setError(error);
				setLoading(false);
				closeDeleteFileDialog();
			},
		});
	}

	function uploadFileHandler() {
		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.multiple = true;
		fileInput.onchange = (e) => {
			setLoading(true);
			const files = (e.target as HTMLInputElement).files;
			if (!files) return;
			uploadFileToBucket({
				storageName: storage?.name,
				bucketName: bucket?.name,
				isPublic: true,
				upsert: true,
				files,
				onSuccess: () => {
					setPage(1);
					setLoading(false);
					useStorageStore.setState({ uploadProgress: 0 });
				},
				onError: (error) => {
					setLoading(false);
					setError(error);
					notify({ type: 'error', description: error.details, title: error.error });
				},
			});
		};
		fileInput.click();
	}

	useEffect(() => {
		if (storage?.name && bucket?.name && page) {
			setLoading(true);
			getFilesOfBucket({
				storageName: storage?.name,
				bucketName: bucket?.name,
				page,
				limit: PAGE_SIZE,
				search: searchParams.get('q') as string,
				returnCountInfo: true,
			});
			setLoading(false);
		}
	}, [searchParams.get('q'), page, bucket?.name]);
	return (
		<VersionTabLayout
			breadCrumb={<BreadCrumb goBackLink={bucketUrl} items={breadcrumbItems} />}
			isEmpty={files.length === 0}
			title={bucket?.name}
			type='file'
			openCreateModal={uploadFileHandler}
			createButtonTitle={t('storage.file.upload')}
			emptyStateTitle={t('storage.file.empty_text')}
			table={table as Table<BucketFile>}
			onMultipleDelete={deleteMultipleFilesHandler}
		>
			{loading && (uploadProgress > 0 || uploadProgress < 100) && (
				<Progress value={uploadProgress} />
			)}
			<InfiniteScroll
				scrollableTarget='version-layout'
				dataLength={files.length}
				next={() => {
					setPage(page + 1);
				}}
				hasMore={fileCountInfo.count >= PAGE_SIZE}
				loader={loading && <TableLoading />}
			>
				<DataTable
					columns={FileColumns}
					data={files}
					setSelectedRows={setSelectedRows}
					setTable={setTable}
				/>
				<ConfirmationModal
					loading={loading}
					error={error}
					title={t('storage.file.delete.title')}
					alertTitle={t('storage.file.delete.message')}
					alertDescription={t('storage.file.delete.description')}
					description={
						<Trans
							i18nKey='storage.file.delete.confirmCode'
							values={{ confirmCode: toDeleteFile?.id }}
							components={{
								confirmCode: <span className='font-bold text-default' />,
							}}
						/>
					}
					confirmCode={toDeleteFile?.id as string}
					onConfirm={deleteFileHandler}
					isOpen={isFileDeleteDialogOpen}
					closeModal={closeDeleteFileDialog}
					closable
				/>
			</InfiniteScroll>
			<EditFile open={isEditFileDialogOpen} onClose={closeFileEditDialog} />
		</VersionTabLayout>
	);
}
