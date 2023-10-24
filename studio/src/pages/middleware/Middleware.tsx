import { PAGE_SIZE } from '@/constants';
import { AddMiddlewareDrawer } from '@/features/version/Middlewares';
import MiddlewaresColumns from '@/features/version/Middlewares/MiddlewaresColumns.tsx';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion.tsx';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useMiddlewareStore from '@/store/middleware/middlewareStore.ts';
import { Middleware } from '@/types';
import { Row, Table } from '@tanstack/react-table';
import { DataTable } from 'components/DataTable';
import { TableLoading } from 'components/Table/Table.tsx';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks';
export default function MainMiddleware() {
	const { notify } = useToast();
	const [selectedRows, setSelectedRows] = useState<Row<Middleware>[]>();
	const { getMiddlewaresOfAppVersion, deleteMultipleMiddlewares, middlewares, lastFetchedCount } =
		useMiddlewareStore();
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(0);
	const [table, setTable] = useState<Table<Middleware>>();
	const { orgId, appId, versionId } = useParams();
	const canCreate = useAuthorizeVersion('middleware.create');
	const [searchParams] = useSearchParams();
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);

	function deleteMultipleMiddlewaresHandler() {
		const rows = selectedRows?.map((row) => row.original);
		deleteMultipleMiddlewares({
			orgId: orgId as string,
			versionId: versionId as string,
			appId: appId as string,
			middlewareIds: rows?.map((row) => row._id) as string[],
			onSuccess: () => {
				notify({
					title: t('general.success'),
					description: t('version.middleware.delete.success'),
					type: 'success',
				});
			},
			onError: (error) => {
				notify({
					title: error.error,
					description: error.details,
					type: 'error',
				});
			},
		});
	}

	useEffect(() => {
		setLoading(true);
		getMiddlewaresOfAppVersion({
			orgId: orgId as string,
			versionId: versionId as string,
			appId: appId as string,
			size: PAGE_SIZE,
			page,
			search: searchParams.get('q') as string,
		});
		setLoading(false);
	}, [page, searchParams.get('q')]);
	return (
		<VersionTabLayout<Middleware>
			className='p-0'
			type='middleware'
			title={t('version.settings.middlewares')}
			emptyStateTitle={t('version.middleware.no_middleware_found')}
			createButtonTitle={t('version.middleware.add_middleware')}
			isEmpty={!middlewares.length}
			openCreateModal={() => setOpen(true)}
			onMultipleDelete={deleteMultipleMiddlewaresHandler}
			onSearch={() => setPage(0)}
			table={table}
			selectedRowLength={selectedRows?.length}
			disabled={!canCreate}
		>
			<InfiniteScroll
				scrollableTarget='version-layout'
				dataLength={middlewares.length}
				next={() => setPage(page + 1)}
				hasMore={lastFetchedCount >= PAGE_SIZE}
				loader={loading && <TableLoading />}
			>
				<DataTable<Middleware>
					columns={MiddlewaresColumns}
					data={middlewares}
					setTable={setTable}
					setSelectedRows={setSelectedRows}
				/>
			</InfiniteScroll>
			<AddMiddlewareDrawer open={open} onOpenChange={setOpen} />
		</VersionTabLayout>
	);
}
