import './Middlewares.scss';
import { Dispatch, SetStateAction } from 'react';
import { DataTable } from 'components/DataTable';
import { GetMiddlewaresOfAppVersionParams, Middleware } from '@/types';
import { useState } from 'react';
import useMiddlewareStore from '@/store/middleware/middlewareStore.ts';
import { Row } from '@tanstack/react-table';
import { useParams, useSearchParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import { TableLoading } from 'components/Table/Table.tsx';
import MiddlewaresColumns from '@/features/version/Middlewares/MiddlewaresColumns.tsx';
import { MiddlewareActions } from '@/features/version/Middlewares/index.ts';
import { useTranslation } from 'react-i18next';
import { EmptyState } from 'components/EmptyState';
import { cn } from '@/utils';

interface MiddlewaresProps {
	selectedRows: Row<Middleware>[] | undefined;
	setSelectedRows: Dispatch<SetStateAction<Row<Middleware>[] | undefined>>;
	parentId?: string;
}

const SIZE = 15;

export default function Middlewares({ setSelectedRows, parentId, selectedRows }: MiddlewaresProps) {
	const [page, setPage] = useState(0);
	const { getMiddlewaresOfAppVersion, middlewares, lastFetchedCount } = useMiddlewareStore();
	const { orgId, appId, versionId } = useParams();
	const [searchParams] = useSearchParams();
	const { t } = useTranslation();

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
		console.log(data);
		await getMiddlewaresOfAppVersion(data);
	}

	function next() {
		setPage((prevState) => prevState + 1);
		getMiddlewares();
	}

	return (
		<>
			<div className='flex flex-col gap-2 items-center sm:flex-row justify-between'>
				<h1 className='text-[26px] text-default leading-[44px] font-semibold'>
					{t('version.settings.middlewares')}
				</h1>
				<MiddlewareActions selectedRows={selectedRows} />
			</div>
			<div
				className={cn(
					'flex-1 pb-6',
					middlewares.length === 0 && 'flex justify-center items-center h-full',
				)}
			>
				{middlewares.length === 0 ? (
					<EmptyState title={t('version.middleware.no_middleware_found')} />
				) : (
					<InfiniteScroll
						next={next}
						className='max-h-full'
						hasMore={lastFetchedCount >= SIZE}
						scrollableTarget={parentId}
						loader={middlewares.length > 0 && <TableLoading />}
						dataLength={middlewares.length}
					>
						<DataTable<Middleware>
							columns={MiddlewaresColumns}
							data={middlewares}
							noDataMessage={
								<p className='text-xl'>{t('version.middleware.no_middleware_found')}</p>
							}
							setSelectedRows={setSelectedRows}
						/>
					</InfiniteScroll>
				)}
			</div>
		</>
	);
}
