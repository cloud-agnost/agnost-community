import { ConfirmationModal } from '@/components/ConfirmationModal';
import { DataTable } from '@/components/DataTable';
import { TableLoading } from '@/components/Table/Table';
import { PAGE_SIZE } from '@/constants';
import { EndpointColumns, EndpointFilter } from '@/features/endpoints';
import useEndpointStore from '@/store/endpoint/endpointStore';
import { APIError, Endpoint } from '@/types';
import { Row, Table } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useOutletContext, useParams, useSearchParams } from 'react-router-dom';
interface OutletContext {
	setIsCreateModalOpen: (isOpen: boolean) => void;
	selectedRows: Row<Endpoint>[];
	setSelectedRows: (rows: Row<Endpoint>[]) => void;
	table: Table<Endpoint>;
	setTable: (table: Table<Endpoint>) => void;
	page: number;
	setPage: (page: number) => void;
}

export default function MainEndpoint() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<APIError>();
	const {
		endpoints,
		lastFetchedCount,
		endpoint,
		isEndpointDeleteDialogOpen,
		toDeleteEndpoint,
		deleteEndpoint,
		getEndpoints,
		closeEndpointDeleteDialog,
	} = useEndpointStore();
	const [searchParams] = useSearchParams();
	const { t } = useTranslation();
	const { versionId, orgId, appId } = useParams();

	const { setSelectedRows, setTable, page, setPage } = useOutletContext() as OutletContext;

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
		<div className='p-4 space-y-4'>
			<EndpointFilter />
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
				confirmCode={endpoint?.iid as string}
				onConfirm={deleteEndpointHandler}
				isOpen={isEndpointDeleteDialogOpen}
				closeModal={closeEndpointDeleteDialog}
				closable
			/>
		</div>
	);
}
