import { Button } from '@/components/Button';
import { DataTable } from '@/components/DataTable';
import { TableLoading } from '@/components/Table/Table';
import { MODULE_PAGE_SIZE } from '@/constants';
import { EndpointColumns } from '@/features/endpoints';
import { useTable, useToast } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useEndpointStore from '@/store/endpoint/endpointStore';
import { Endpoint } from '@/types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useOutletContext, useParams, useSearchParams } from 'react-router-dom';
interface OutletContext {
	setIsCreateModalOpen: (isOpen: boolean) => void;
}

export default function MainEndpoint() {
	const [loading, setLoading] = useState(false);
	const [searchParams] = useSearchParams();
	const { notify } = useToast();
	const { t } = useTranslation();
	const { versionId, orgId, appId } = useParams();
	const canCreate = useAuthorizeVersion('endpoint.create');
	const { endpoints, lastFetchedCount, getEndpoints, deleteMultipleEndpoints } = useEndpointStore();
	const table = useTable({
		data: endpoints,
		columns: EndpointColumns,
	});

	const { setIsCreateModalOpen }: OutletContext = useOutletContext();

	function deleteMultipleEndpointsHandler() {
		deleteMultipleEndpoints({
			endpointIds: table.getSelectedRowModel().rows.map((row) => row.original._id),
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			onSuccess: () => {
				table.toggleAllRowsSelected(false);
			},
			onError: ({ error, details }) => {
				notify({ type: 'error', description: details, title: error });
			},
		});
	}

	useEffect(() => {
		if (versionId && orgId && appId) {
			setLoading(true);
			getEndpoints({
				orgId,
				appId,
				versionId,
				page: 0,
				size: MODULE_PAGE_SIZE,
				search: searchParams.get('q') ?? undefined,
			});
			setLoading(false);
		}
	}, [searchParams.get('q')]);

	return (
		<VersionTabLayout<Endpoint>
			type='endpoint'
			title={t('endpoint.title')}
			createButtonTitle={t('endpoint.add')}
			emptyStateTitle={t('endpoint.empty')}
			isEmpty={!endpoints.length}
			openCreateModal={() => setIsCreateModalOpen(true)}
			onMultipleDelete={deleteMultipleEndpointsHandler}
			table={table}
			disabled={!canCreate}
			handlerButton={
				<Button variant='secondary' to='logs'>
					{t('queue.view_logs')}
				</Button>
			}
		>
			<InfiniteScroll
				scrollableTarget='version-layout'
				dataLength={endpoints.length}
				next={() => {}}
				hasMore={lastFetchedCount >= MODULE_PAGE_SIZE}
				loader={loading && <TableLoading />}
			>
				<DataTable table={table} />
			</InfiniteScroll>
		</VersionTabLayout>
	);
}
