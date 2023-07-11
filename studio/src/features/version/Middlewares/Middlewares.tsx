import './Middlewares.scss';
import { Dispatch, SetStateAction } from 'react';
import { DataTable } from 'components/DataTable';
import { Middleware } from '@/types';
import { useState } from 'react';
import useMiddlewareStore from '@/store/middleware/middlewareStore.ts';
import { Row } from '@tanstack/react-table';
import { useParams } from 'react-router-dom';
import { translate } from '@/utils';
import InfiniteScroll from 'react-infinite-scroll-component';
import { TableLoading } from 'components/Table/Table.tsx';
import MiddlewaresColumns from '@/features/version/Middlewares/MiddlewaresColumns.tsx';

interface MiddlewaresProps {
	selectedRows: Row<Middleware>[] | undefined;
	setSelectedRows: Dispatch<SetStateAction<Row<Middleware>[] | undefined>>;
}

const SIZE = 15;

export default function Middlewares({ setSelectedRows }: MiddlewaresProps) {
	const [page, setPage] = useState(0);
	const { getMiddlewaresOfAppVersion, middlewares, lastFetchedCount } = useMiddlewareStore();
	const { orgId, appId, versionId } = useParams();

	async function getMiddlewares() {
		if (!orgId || !appId || !versionId) return;

		await getMiddlewaresOfAppVersion({
			orgId,
			appId,
			versionId,
			page,
			size: SIZE,
		});
	}

	function next() {
		setPage((prevState) => prevState + 1);
		getMiddlewares();
	}

	return (
		<div className='data-table-container'>
			<InfiniteScroll
				next={next}
				hasMore={lastFetchedCount >= SIZE}
				scrollableTarget='setting-container-content'
				loader={middlewares.length > 0 && <TableLoading />}
				dataLength={middlewares.length}
			>
				<DataTable<Middleware>
					columns={MiddlewaresColumns}
					data={middlewares}
					noDataMessage={
						<p className='text-xl'>{translate('version.middleware.no_middleware_found')}</p>
					}
					setSelectedRows={setSelectedRows}
				/>
			</InfiniteScroll>
		</div>
	);
}
