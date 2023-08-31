import { ConfirmationModal } from '@/components/ConfirmationModal';
import { DataTable } from '@/components/DataTable';
import { TableLoading } from '@/components/Table/Table';
import { EmptyEndpoint } from '@/components/icons';
import { PAGE_SIZE } from '@/constants';
import { EndpointColumns } from '@/features/endpoints';
import { useToast } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useEndpointStore from '@/store/endpoint/endpointStore';
import { APIError, Endpoint } from '@/types';
import { Row, Table } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useOutletContext, useParams, useSearchParams } from 'react-router-dom';
interface OutletContext {
	setIsCreateModalOpen: (isOpen: boolean) => void;
	setSelectedRows: (rows: Row<Endpoint>[]) => void;
	setTable: (table: Table<Endpoint>) => void;
	page: number;
	setPage: (page: number) => void;
	table: Table<Endpoint>;
	selectedRows: Row<Endpoint>[];
}

export default function MainEndpoint() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<APIError>();
	const [searchParams, setSearchParams] = useSearchParams();
	const { notify } = useToast();
	const { t } = useTranslation();
	const { versionId, orgId, appId } = useParams();

	const canCreate = useAuthorizeVersion('endpoint.create');
	const {
		endpoints,
		lastFetchedCount,
		isEndpointDeleteDialogOpen,
		toDeleteEndpoint,
		deleteEndpoint,
		getEndpoints,
		closeEndpointDeleteDialog,
		deleteMultipleEndpoints,
	} = useEndpointStore();

	const {
		setSelectedRows,
		setTable,
		page,
		setPage,
		setIsCreateModalOpen,
		table,
		selectedRows,
	}: OutletContext = useOutletContext();

	function deleteEndpointHandler() {
		setLoading(true);
		deleteEndpoint({
			epId: toDeleteEndpoint?._id as string,
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			onSuccess: () => {
				setLoading(false);
				closeEndpointDeleteDialog();
			},
			onError: (error) => {
				setError(error);
				setLoading(false);
				closeEndpointDeleteDialog();
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

	function deleteMultipleEndpointsHandler() {
		deleteMultipleEndpoints({
			endpointIds: selectedRows.map((row) => row.original._id),
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
			getEndpoints({
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
		<VersionTabLayout<Endpoint>
			icon={<EmptyEndpoint className='w-44 h-44' />}
			title={t('endpoint.title')}
			createButtonTitle={t('endpoint.add')}
			emptyStateTitle={t('endpoint.empty')}
			isEmpty={!endpoints.length}
			openCreateModal={() => {
				setIsCreateModalOpen(true);
			}}
			onMultipleDelete={deleteMultipleEndpointsHandler}
			onSearch={onInput}
			table={table}
			selectedRowLength={selectedRows.length}
			disabled={!canCreate}
			viewLogs
		>
			<InfiniteScroll
				scrollableTarget='version-layout'
				dataLength={endpoints.length}
				next={() => {
					setPage(page + 1);
				}}
				hasMore={lastFetchedCount >= PAGE_SIZE}
				loader={endpoints.length > 0 && <TableLoading />}
			>
				<DataTable
					columns={EndpointColumns}
					data={endpoints}
					setSelectedRows={setSelectedRows}
					setTable={setTable}
				/>
			</InfiniteScroll>
			<ConfirmationModal
				loading={loading}
				error={error}
				title={t('endpoint.delete.title')}
				alertTitle={t('endpoint.delete.message')}
				alertDescription={t('endpoint.delete.description')}
				description={
					<Trans
						i18nKey='endpoint.delete.confirmCode'
						values={{ confirmCode: toDeleteEndpoint?.iid }}
						components={{
							confirmCode: <span className='font-bold text-default' />,
						}}
					/>
				}
				confirmCode={toDeleteEndpoint?.iid as string}
				onConfirm={deleteEndpointHandler}
				isOpen={isEndpointDeleteDialogOpen}
				closeModal={closeEndpointDeleteDialog}
				closable
			/>
		</VersionTabLayout>
	);
}
