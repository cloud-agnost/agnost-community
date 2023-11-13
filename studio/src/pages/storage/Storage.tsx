import { ConfirmationModal } from '@/components/ConfirmationModal';
import { DataTable } from '@/components/DataTable';
import { TableLoading } from '@/components/Table/Table';
import { CreateStorage, StorageColumns } from '@/features/storage';
import { useInfiniteScroll, useTable, useToast } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useStorageStore from '@/store/storage/storageStore';
import { APIError } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams } from 'react-router-dom';

export default function MainStorage() {
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const { notify } = useToast();
	const canCreateStorages = useAuthorizeVersion('storage.create');
	const { t } = useTranslation();
	const { versionId, orgId, appId } = useParams();

	const {
		getStorages,
		closeStorageDeleteDialog,
		deleteStorage,
		deleteMultipleStorages,
		lastFetchedPage,
		toDeleteStorage,
		storages,
		isStorageDeleteDialogOpen,
	} = useStorageStore();
	const table = useTable({
		data: storages,
		columns: StorageColumns,
	});
	const { isFetching, hasNextPage, fetchNextPage } = useInfiniteScroll({
		queryFn: getStorages,
		queryKey: 'getStorages',
		dataLength: storages.length,
		lastFetchedPage,
	});
	const { mutateAsync: deleteStorageMutation } = useMutation({
		mutationFn: deleteStorage,
		onSettled: closeStorageDeleteDialog,
	});
	const {
		mutateAsync: deleteMultipleStoragesMutation,
		isPending: deleteLoading,
		error: deleteError,
	} = useMutation({
		mutationFn: deleteMultipleStorages,
		onSuccess: () => {
			table?.resetRowSelection();
		},
		onError: ({ error, details }: APIError) => {
			notify({ type: 'error', description: details, title: error });
		},
	});
	function deleteStorageHandler() {
		deleteStorageMutation({
			storageId: toDeleteStorage?._id as string,
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
		});
	}
	function deleteMultipleStoragesHandler() {
		deleteMultipleStoragesMutation({
			storageIds: table.getSelectedRowModel().rows.map((row) => row.original._id),
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
		});
	}

	return (
		<>
			<VersionTabLayout
				isEmpty={!storages.length}
				title={t('storage.title')}
				type='storage'
				openCreateModal={() => setIsCreateModalOpen(true)}
				createButtonTitle={t('storage.create')}
				emptyStateTitle={t('storage.empty_text')}
				onMultipleDelete={deleteMultipleStoragesHandler}
				disabled={!canCreateStorages}
				loading={isFetching && lastFetchedPage === 0}
				table={table}
			>
				<InfiniteScroll
					scrollableTarget='version-layout'
					dataLength={storages.length}
					next={fetchNextPage}
					hasMore={hasNextPage}
					loader={isFetching && <TableLoading />}
				>
					<DataTable table={table} />
				</InfiniteScroll>
				<ConfirmationModal
					loading={deleteLoading}
					error={deleteError}
					title={t('storage.delete.title')}
					alertTitle={t('storage.delete.message')}
					alertDescription={t('storage.delete.description')}
					description={
						<Trans
							i18nKey='storage.delete.confirmCode'
							values={{ confirmCode: toDeleteStorage?.iid }}
							components={{
								confirmCode: <span className='font-bold text-default' />,
							}}
						/>
					}
					confirmCode={toDeleteStorage?.iid as string}
					onConfirm={deleteStorageHandler}
					isOpen={isStorageDeleteDialogOpen}
					closeModal={closeStorageDeleteDialog}
					closable
				/>
			</VersionTabLayout>
			<CreateStorage open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
		</>
	);
}
