import { ConfirmationModal } from '@/components/ConfirmationModal';
import { DataTable } from '@/components/DataTable';
import { TableLoading } from '@/components/Table/Table';
import { PAGE_SIZE } from '@/constants';
import { CacheColumns, CreateCache, EditCache } from '@/features/cache';
import { useToast } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useCacheStore from '@/store/cache/cacheStore';
import { APIError, Cache } from '@/types';
import { Row, Table } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams, useSearchParams } from 'react-router-dom';

export default function VersionCache() {
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [selectedRows, setSelectedRows] = useState<Row<Cache>[]>([]);
	const [table, setTable] = useState<Table<Cache>>();
	const [page, setPage] = useState(0);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<APIError>();
	const { notify } = useToast();
	const canCreateCache = useAuthorizeVersion('cache.create');
	const [searchParams] = useSearchParams();
	const { t } = useTranslation();
	const { versionId, orgId, appId } = useParams();
	const {
		getCaches,
		closeDeleteCacheModal,
		deleteCache,
		deleteMultipleCache,
		lastFetchedCount,
		toDeleteCache,
		caches,
		isDeleteCacheModalOpen,
		isEditCacheModalOpen,
		closeEditCacheModal,
	} = useCacheStore();

	function deleteCacheHandler() {
		setLoading(true);
		deleteCache({
			cacheId: toDeleteCache?._id,
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			onSuccess: () => {
				setLoading(false);
				closeDeleteCacheModal();
			},
			onError: (error) => {
				setError(error);
				setLoading(false);
				closeDeleteCacheModal();
			},
		});
	}

	function deleteMultipleCachesHandler() {
		deleteMultipleCache({
			cacheIds: selectedRows.map((row) => row.original._id),
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			onSuccess: () => {
				table?.toggleAllRowsSelected(false);
				setPage(0);
			},
			onError: ({ error, details }) => {
				notify({ type: 'error', description: details, title: error });
			},
		});
	}
	useEffect(() => {
		if (versionId && orgId && appId) {
			getCaches({
				orgId,
				appId,
				versionId,
				page,
				size: PAGE_SIZE,
				search: searchParams.get('q') ?? undefined,
				initialFetch: page === 0,
			});
		}
	}, [searchParams.get('q'), page]);

	return (
		<>
			<VersionTabLayout
				isEmpty={caches.length === 0}
				title={t('cache.title')}
				type='cache'
				openCreateModal={() => setIsCreateModalOpen(true)}
				createButtonTitle={t('cache.create')}
				emptyStateTitle={t('cache.empty_text')}
				table={table}
				selectedRowLength={selectedRows?.length}
				onSearch={() => setPage(0)}
				onMultipleDelete={deleteMultipleCachesHandler}
				disabled={!canCreateCache}
			>
				<InfiniteScroll
					scrollableTarget='version-layout'
					dataLength={caches.length}
					next={() => {
						setPage(page + 1);
					}}
					hasMore={lastFetchedCount >= PAGE_SIZE}
					loader={caches.length > 0 && <TableLoading />}
				>
					<DataTable
						columns={CacheColumns}
						data={caches}
						setSelectedRows={setSelectedRows}
						setTable={setTable}
					/>
				</InfiniteScroll>
				<ConfirmationModal
					loading={loading}
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
			<CreateCache open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
			<EditCache open={isEditCacheModalOpen} onClose={closeEditCacheModal} />
		</>
	);
}
