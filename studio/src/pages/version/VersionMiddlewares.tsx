import { AddMiddlewareButton } from '@/features/version/Middlewares';
import { useId, useMemo, useState } from 'react';
import { Row, Table } from '@tanstack/react-table';
import { GetMiddlewaresOfAppVersionParams, Middleware } from '@/types';
import { useParams, useSearchParams } from 'react-router-dom';
import useMiddlewareStore from '@/store/middleware/middlewareStore.ts';
import { EmptyEndpoint } from 'components/icons';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import { useTranslation } from 'react-i18next';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion.tsx';
import { TableLoading } from 'components/Table/Table.tsx';
import { DataTable } from 'components/DataTable';
import MiddlewaresColumns from '@/features/version/Middlewares/MiddlewaresColumns.tsx';
import InfiniteScroll from 'react-infinite-scroll-component';
const SIZE = 15;

export default function VersionMiddlewares() {
	const [selectedRows, setSelectedRows] = useState<Row<Middleware>[]>();
	const {
		getMiddlewaresOfAppVersion,
		deleteMiddleware,
		deleteMultipleMiddlewares,
		middlewares,
		lastFetchedCount,
	} = useMiddlewareStore();
	const [search, setSearch] = useState<string>('');
	const [page, setPage] = useState(0);
	const [table, setTable] = useState<Table<Middleware>>();
	const { orgId, appId, versionId } = useParams();
	const canCreate = useAuthorizeVersion('middleware.create');
	const [searchParams] = useSearchParams();
	const { t } = useTranslation();
	const id = useId();

	const filteredMiddlewares = useMemo(() => {
		if (!search) return middlewares;
		return middlewares.filter((middleware) =>
			middleware.name.toLowerCase().includes(search.toLowerCase()),
		);
	}, [middlewares, search]);

	function onInput(value: string) {
		value = value.trim();
		setSearch(value);
	}

	async function deleteHandler() {
		const rows = selectedRows?.map((row) => row.original);
		if (!rows || rows.length === 0) return;
		const { orgId, versionId, appId } = rows[0];

		if (rows.length === 1) {
			await deleteMiddleware({
				orgId,
				versionId,
				appId,
				mwId: rows[0]._id,
			});
		} else {
			await deleteMultipleMiddlewares({
				orgId,
				versionId,
				appId,
				middlewareIds: rows.map((row) => row._id),
			});
		}
	}

	async function getMiddlewares() {
		if (!orgId || !appId || !versionId) return;

		const data: GetMiddlewaresOfAppVersionParams = {
			orgId,
			appId,
			versionId,
			page,
			size: SIZE,
		};

		if (searchParams.has('q')) {
			data.search = searchParams.get('q') as string;
		}
		await getMiddlewaresOfAppVersion(data);
	}

	function next() {
		setPage((prevState) => prevState + 1);
		getMiddlewares();
	}

	return (
		<VersionTabLayout<Middleware>
			className='p-0'
			icon={<EmptyEndpoint className='w-44 h-44' />}
			title={t('version.settings.middlewares')}
			emptyStateTitle={t('version.middleware.no_middleware_found')}
			isEmpty={!filteredMiddlewares.length}
			handlerButton={<AddMiddlewareButton />}
			onMultipleDelete={deleteHandler}
			onSearch={onInput}
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
		</VersionTabLayout>
	);
}
