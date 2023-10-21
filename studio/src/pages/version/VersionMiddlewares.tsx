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
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams, useSearchParams } from 'react-router-dom';
const SIZE = 15;

export default function VersionMiddlewares() {
	const [selectedRows, setSelectedRows] = useState<Row<Middleware>[]>();
	const { getMiddlewaresOfAppVersion, deleteMultipleMiddlewares, middlewares, lastFetchedCount } =
		useMiddlewareStore();

	const [page, setPage] = useState(0);
	const [table, setTable] = useState<Table<Middleware>>();
	const { orgId, appId, versionId } = useParams();
	const canCreate = useAuthorizeVersion('middleware.create');
	const [searchParams] = useSearchParams();
	const { t } = useTranslation();
	const id = useId();
	const [open, setOpen] = useState(false);

	function deleteMultipleMiddlewaresHandler() {
		const rows = selectedRows?.map((row) => row.original);
		deleteMultipleMiddlewares({
			orgId: orgId as string,
			versionId: versionId as string,
			appId: appId as string,
			middlewareIds: rows?.map((row) => row._id) as string[],
		});
	}

	function next() {
		setPage((prevState) => prevState + 1);
	}
	useEffect(() => {
		getMiddlewaresOfAppVersion({
			orgId: orgId as string,
			versionId: versionId as string,
			appId: appId as string,
			size: PAGE_SIZE,
			page,
			search: searchParams.get('q') as string,
			initialFetch: page === 0,
		});
	}, [page, searchParams.get('q')]);
	return (
		<VersionTabLayout<Middleware>
			className='p-0'
			type='middleware'
			title={t('version.settings.middlewares')}
			emptyStateTitle={t('version.middleware.no_middleware_found')}
			isEmpty={!middlewares.length}
			openCreateModal={() => setOpen(true)}
			onMultipleDelete={deleteMultipleMiddlewaresHandler}
			onSearch={() => setPage(0)}
			table={table}
			selectedRowLength={selectedRows?.length}
			disabled={!canCreate}
		>
			<div id={id} className='space-y-6 h-full flex flex-col overflow-auto'>
				<InfiniteScroll
					next={next}
					className='max-h-full'
					hasMore={lastFetchedCount >= SIZE}
					scrollableTarget={id}
					loader={middlewares.length > 0 && <TableLoading />}
					dataLength={middlewares.length}
				>
					<DataTable<Middleware>
						columns={MiddlewaresColumns}
						data={middlewares}
						setTable={setTable}
						setSelectedRows={setSelectedRows}
					/>
				</InfiniteScroll>
			</div>
			<AddMiddlewareDrawer open={open} onOpenChange={setOpen} />
		</VersionTabLayout>
	);
}
