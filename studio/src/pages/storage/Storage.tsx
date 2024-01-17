import { DataTable } from '@/components/DataTable';
import { TableLoading } from '@/components/Table/Table';
import { StorageColumns } from '@/features/storage';
import { useInfiniteScroll, useTable, useToast } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useEnvironmentStore from '@/store/environment/environmentStore';
import useStorageStore from '@/store/storage/storageStore';
import { APIError, TabTypes } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams } from 'react-router-dom';

export default function MainStorage() {
	const { toast } = useToast();
	const canCreateStorages = useAuthorizeVersion('storage.create');
	const { t } = useTranslation();
	const { versionId, orgId, appId } = useParams();

	const { getStorages, deleteMultipleStorages, toggleCreateModal, lastFetchedPage, storages } =
		useStorageStore();
	const table = useTable({
		data: storages,
		columns: StorageColumns,
	});
	const { isFetching, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteScroll({
		queryFn: getStorages,
		queryKey: 'getStorages',
		dataLength: storages.length,
		lastFetchedPage,
	});
	const { getEnvironmentResources, environment } = useEnvironmentStore();

	const { mutateAsync: deleteMultipleStoragesMutation } = useMutation({
		mutationFn: deleteMultipleStorages,
		onSuccess: () => {
			getEnvironmentResources({
				orgId: environment?.orgId,
				appId: environment?.appId,
				envId: environment?._id,
				versionId: environment?.versionId,
			});
			table?.resetRowSelection();
		},
		onError: ({ details }: APIError) => {
			toast({ action: 'error', title: details });
		},
	});

	function deleteMultipleStoragesHandler() {
		deleteMultipleStoragesMutation({
			storageIds: table.getSelectedRowModel().rows.map((row) => row.original._id),
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
		});
	}

	return (
		<VersionTabLayout
			searchable
			isEmpty={!storages.length}
			title={t('storage.title') as string}
			type={TabTypes.Storage}
			openCreateModal={toggleCreateModal}
			createButtonTitle={t('storage.create')}
			emptyStateTitle={t('storage.empty_text')}
			onMultipleDelete={deleteMultipleStoragesHandler}
			disabled={!canCreateStorages}
			loading={isFetching && !storages.length}
			table={table}
		>
			<InfiniteScroll
				scrollableTarget='version-layout'
				dataLength={storages.length}
				next={fetchNextPage}
				hasMore={hasNextPage}
				loader={isFetchingNextPage && <TableLoading />}
			>
				<DataTable table={table} />
			</InfiniteScroll>
		</VersionTabLayout>
	);
}
