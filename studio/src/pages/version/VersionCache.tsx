import { ConfirmationModal } from '@/components/ConfirmationModal';
import { DataTable } from '@/components/DataTable';
import { TableLoading } from '@/components/Table/Table';
import { CacheColumns, EditCache } from '@/features/cache';
import { useInfiniteScroll, useTable, useToast } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useCacheStore from '@/store/cache/cacheStore';
import useEnvironmentStore from '@/store/environment/environmentStore';
import { APIError, Cache, TabTypes } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { Row } from '@tanstack/react-table';
import { Trans, useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams } from 'react-router-dom';

export default function VersionCache() {
	const canCreateCache = useAuthorizeVersion('cache.create');
	const { toast } = useToast();
	const { t } = useTranslation();
	const { versionId, orgId, appId } = useParams();
	const {
		getCaches,
		closeDeleteCacheModal,
		deleteCache,
		deleteMultipleCache,
		toggleCreateCacheModal,
		lastFetchedPage,
		toDeleteCache,
		caches,
		isDeleteCacheModalOpen,
	} = useCacheStore();
	const table = useTable({
		data: caches,
		columns: CacheColumns,
	});
	const { getEnvironmentResources, environment } = useEnvironmentStore();
	const { fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } = useInfiniteScroll({
		queryFn: getCaches,
		lastFetchedPage,
		dataLength: caches.length,
		queryKey: 'caches',
	});

	const {
		mutateAsync: deleteCacheMutation,
		error,
		isPending: isDeleting,
	} = useMutation({
		mutationFn: deleteCache,
		onSuccess: () => {
			getEnvironmentResources({
				orgId: environment?.orgId,
				appId: environment?.appId,
				envId: environment?._id,
				versionId: environment?.versionId,
			});
			closeDeleteCacheModal();
		},
	});

	const { mutateAsync: deleteMultipleCacheMutation } = useMutation({
		mutationFn: deleteMultipleCache,
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

	function deleteCacheHandler() {
		deleteCacheMutation({
			cacheId: toDeleteCache?._id,
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
		});
	}

	function deleteMultipleCachesHandler() {
		deleteMultipleCacheMutation({
			cacheIds: table
				?.getSelectedRowModel()
				.rows.map((row: Row<Cache>) => row.original._id) as string[],
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
		});
	}

	return (
		<VersionTabLayout
			searchable
			isEmpty={caches.length === 0}
			title={t('cache.title') as string}
			type={TabTypes.Cache}
			openCreateModal={toggleCreateCacheModal}
			createButtonTitle={t('cache.create')}
			emptyStateTitle={t('cache.empty_text')}
			table={table}
			onMultipleDelete={deleteMultipleCachesHandler}
			disabled={!canCreateCache}
			loading={isFetching && !caches.length}
		>
			<InfiniteScroll
				scrollableTarget='version-layout'
				dataLength={caches.length}
				next={fetchNextPage}
				hasMore={hasNextPage}
				loader={isFetchingNextPage && <TableLoading />}
			>
				<DataTable<Cache> table={table} />
			</InfiniteScroll>
			<ConfirmationModal
				loading={isDeleting}
				error={error}
				title={t('cache.delete.title')}
				alertTitle={t('cache.delete.message')}
				alertDescription={t('cache.delete.description')}
				description={
					<Trans
						i18nKey='cache.delete.confirmCode'
						values={{ confirmCode: toDeleteCache?.iid }}
						components={{
							confirmCode: <span className='font-bold text-default' />,
						}}
					/>
				}
				confirmCode={toDeleteCache?.iid}
				onConfirm={deleteCacheHandler}
				isOpen={isDeleteCacheModalOpen}
				closeModal={closeDeleteCacheModal}
				closable
			/>
		</VersionTabLayout>
	);
}
