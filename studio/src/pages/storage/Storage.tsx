import { ConfirmationModal } from '@/components/ConfirmationModal';
import { DataTable } from '@/components/DataTable';
import { TableLoading } from '@/components/Table/Table';
import { PAGE_SIZE } from '@/constants';
import { StorageColumns } from '@/features/storage';
import { useToast } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useStorageStore from '@/store/storage/storageStore';
import { APIError, Storage } from '@/types';
import { Row, Table } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useOutletContext, useParams, useSearchParams } from 'react-router-dom';
interface OutletContext {
	setIsCreateModalOpen: (isOpen: boolean) => void;
	selectedRows: Row<Storage>[];
	setSelectedRows: (rows: Row<Storage>[]) => void;
	table: Table<Storage>;
	setTable: (table: Table<Storage>) => void;
	page: number;
	setPage: (page: number) => void;
}
export default function MainStorage() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<APIError>();
	const { notify } = useToast();
	const canCreateStorages = useAuthorizeVersion('storage.create');
	const [searchParams, setSearchParams] = useSearchParams();
	const { t } = useTranslation();
	const { versionId, orgId, appId } = useParams();

	const {
		getStorages,
		closeStorageDeleteDialog,
		deleteStorage,
		deleteMultipleStorages,
		lastFetchedCount,
		toDeleteStorage,
		storages,
		isStorageDeleteDialogOpen,
	} = useStorageStore();

	const {
		setSelectedRows,
		setTable,
		page,
		setPage,
		setIsCreateModalOpen,
		table,
		selectedRows,
	}: OutletContext = useOutletContext();

	function deleteStorageHandler() {
		setLoading(true);
		deleteStorage({
			storageId: toDeleteStorage?._id as string,
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			onSuccess: () => {
				setLoading(false);
				closeStorageDeleteDialog();
			},
			onError: (error) => {
				setError(error);
				setLoading(false);
				closeStorageDeleteDialog();
			},
		});
	}
	function onInput(value: string) {
		value = value.trim();
		if (!value) {
			searchParams.delete('q');
			setSearchParams(searchParams);
			return;
		}
		setPage(0);
		setSearchParams({ ...searchParams, q: value });
	}

	function deleteMultipleStoragesHandler() {
		deleteMultipleStorages({
			storageIds: selectedRows.map((row) => row.original._id),
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			onSuccess: () => {
				table.toggleAllRowsSelected(false);
				setPage(0);
			},
			onError: ({ error, details }) => {
				notify({ type: 'error', description: details, title: error });
			},
		});
	}
	useEffect(() => {
		if (versionId && orgId && appId) {
			getStorages({
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
		<VersionTabLayout
			isEmpty={storages.length === 0}
			title={t('storage.title')}
			type='storage'
			openCreateModal={() => setIsCreateModalOpen(true)}
			createButtonTitle={t('storage.create')}
			emptyStateTitle={t('storage.empty_text')}
			table={table}
			selectedRowLength={selectedRows?.length}
			onSearch={onInput}
			onMultipleDelete={deleteMultipleStoragesHandler}
			disabled={!canCreateStorages}
		>
			<InfiniteScroll
				scrollableTarget='version-layout'
				dataLength={storages.length}
				next={() => {
					setPage(page + 1);
				}}
				hasMore={lastFetchedCount >= PAGE_SIZE}
				loader={storages.length > 0 && <TableLoading />}
			>
				<DataTable
					columns={StorageColumns}
					data={storages}
					setSelectedRows={setSelectedRows}
					setTable={setTable}
				/>
			</InfiniteScroll>
			<ConfirmationModal
				loading={loading}
				error={error}
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
	);
}
