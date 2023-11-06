import { AddMiddlewareDrawer } from '@/features/version/Middlewares';
import MiddlewaresColumns from '@/features/version/Middlewares/MiddlewaresColumns.tsx';
import { useToast, useInfiniteScroll } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion.tsx';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useMiddlewareStore from '@/store/middleware/middlewareStore.ts';
import { APIError, Middleware } from '@/types';
import { Row, Table } from '@tanstack/react-table';
import { DataTable } from 'components/DataTable';
import { TableLoading } from 'components/Table/Table.tsx';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
export default function MainMiddleware() {
	const { notify } = useToast();
	const [selectedRows, setSelectedRows] = useState<Row<Middleware>[]>();
	const { getMiddlewaresOfAppVersion, deleteMultipleMiddlewares, lastFetchedPage, middlewares } =
		useMiddlewareStore();

	const [table, setTable] = useState<Table<Middleware>>();
	const { orgId, appId, versionId } = useParams();
	const canCreate = useAuthorizeVersion('middleware.create');
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);

	const { fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteScroll({
		queryFn: getMiddlewaresOfAppVersion,
		lastFetchedPage,
		dataLength: middlewares.length,
	});

	const { mutateAsync: deleteMiddleware } = useMutation({
		mutationFn: deleteMultipleMiddlewares,
		onSuccess: () => {
			table?.toggleAllRowsSelected(false);
		},
		onError: (error: APIError) => {
			notify({
				title: error.error,
				description: error.details,
				type: 'error',
			});
		},
	});

	function deleteMultipleMiddlewaresHandler() {
		const rows = selectedRows?.map((row) => row.original);
		deleteMiddleware({
			orgId: orgId as string,
			versionId: versionId as string,
			appId: appId as string,
			middlewareIds: rows?.map((row) => row._id) as string[],
		});
	}

	return (
		<>
			<VersionTabLayout<Middleware>
				className='p-0'
				type='middleware'
				title={t('version.settings.middlewares')}
				emptyStateTitle={t('version.middleware.no_middleware_found')}
				createButtonTitle={t('version.middleware.add_middleware')}
				isEmpty={!middlewares.length}
				openCreateModal={() => setOpen(true)}
				onMultipleDelete={deleteMultipleMiddlewaresHandler}
				table={table}
				selectedRowLength={selectedRows?.length}
				disabled={!canCreate}
			>
				<InfiniteScroll
					scrollableTarget='version-layout'
					dataLength={middlewares.length}
					next={fetchNextPage}
					hasMore={hasNextPage}
					loader={isFetchingNextPage && <TableLoading />}
				>
					<DataTable<Middleware>
						columns={MiddlewaresColumns}
						data={middlewares}
						setTable={setTable}
						setSelectedRows={setSelectedRows}
					/>
				</InfiniteScroll>
			</VersionTabLayout>
			<AddMiddlewareDrawer open={open} onOpenChange={setOpen} />
		</>
	);
}
