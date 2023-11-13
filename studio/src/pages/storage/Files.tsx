import { BreadCrumb, BreadCrumbItem } from '@/components/BreadCrumb';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { DataTable } from '@/components/DataTable';
import { Progress } from '@/components/Progress';
import { TableLoading } from '@/components/Table/Table';
import { EditFile, FileColumns } from '@/features/storage';
import { useInfiniteScroll, useTable, useToast } from '@/hooks';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useStorageStore from '@/store/storage/storageStore';
import useVersionStore from '@/store/version/versionStore';
import { APIError } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { Trans, useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { LoaderFunctionArgs } from 'react-router-dom';

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
	const { notify } = useToast();
	const { t } = useTranslation();
	const { getVersionDashboardPath } = useVersionStore();
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

	const storageUrl = getVersionDashboardPath(`/${storage?.versionId}/storage`);
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

	const { isPending, hasNextPage, fetchNextPage } = useInfiniteScroll({
		queryFn: getFilesOfBucket,
		queryKey: 'files',
		lastFetchedPage: fileCountInfo.currentPage,
		dataLength: files.length,
	});

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
		onError: ({ error, details }: APIError) => {
			notify({ type: 'error', description: details, title: error });
		},
	});

	const {
		mutateAsync: deleteFileMutation,
		isPending: deleteLoading,
		error: deleteError,
	} = useMutation({
		mutationFn: deleteFileFromBucket,
		mutationKey: ['deleteFileFromBucket'],
		onSettled: closeDeleteFileDialog,
	});

	const { mutateAsync: updateFileMutation, isPending: uploadLoading } = useMutation({
		mutationFn: uploadFileToBucket,
		mutationKey: ['uploadFileToBucket'],
		onSuccess: () => {
			useStorageStore.setState({ uploadProgress: 0 });
		},
		onError: (error: APIError) => {
			notify({ type: 'error', description: error.details, title: error.error });
		},
	});

	function deleteMultipleFilesHandler() {
		deleteMultipleFileMutation({
			filePaths: table.getSelectedRowModel().rows.map((row) => row.original.path),
			storageName: storage?.name as string,
			bucketName: bucket?.name as string,
		});
	}
	function deleteFileHandler() {
		deleteFileMutation({
			storageName: storage?.name as string,
			bucketName: bucket?.name as string,
			filePath: toDeleteFile?.path as string,
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

	return (
		<VersionTabLayout
			breadCrumb={<BreadCrumb goBackLink={bucketUrl} items={breadcrumbItems} />}
			isEmpty={files.length === 0}
			title={bucket?.name}
			type='file'
			openCreateModal={uploadFileHandler}
			createButtonTitle={t('storage.file.upload')}
			emptyStateTitle={t('storage.file.empty_text')}
			onMultipleDelete={deleteMultipleFilesHandler}
			loading={isPending && !files.length}
		>
			{uploadLoading && (uploadProgress > 0 || uploadProgress < 100) && (
				<Progress value={uploadProgress} />
			)}
			<InfiniteScroll
				scrollableTarget='version-layout'
				dataLength={files.length}
				next={fetchNextPage}
				hasMore={hasNextPage}
				loader={isPending && <TableLoading />}
			>
				<DataTable table={table} />
				<ConfirmationModal
					loading={deleteLoading}
					error={deleteError}
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
