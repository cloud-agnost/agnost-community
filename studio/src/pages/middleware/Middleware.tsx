import { AddMiddlewareDrawer } from '@/features/version/Middlewares';
import MiddlewaresColumns from '@/features/version/Middlewares/MiddlewaresColumns.tsx';
import { useInfiniteScroll, useTable, useToast } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion.tsx';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useMiddlewareStore from '@/store/middleware/middlewareStore.ts';
import { APIError, Middleware } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { DataTable } from 'components/DataTable';
import { TableLoading } from 'components/Table/Table.tsx';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams } from 'react-router-dom';

export default function MainMiddleware() {
	const { toast } = useToast();
	const { getMiddlewaresOfAppVersion, deleteMultipleMiddlewares, lastFetchedPage, middlewares } =
		useMiddlewareStore();
	const table = useTable({
		data: middlewares,
		columns: MiddlewaresColumns,
	});
	const { orgId, appId, versionId } = useParams();
	const canCreate = useAuthorizeVersion('middleware.create');
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);

	const { fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } = useInfiniteScroll({
		queryFn: getMiddlewaresOfAppVersion,
		lastFetchedPage,
		dataLength: middlewares.length,
		queryKey: 'middlewares',
	});

	const { mutateAsync: deleteMiddleware } = useMutation({
		mutationFn: deleteMultipleMiddlewares,
		onSuccess: () => {
			table?.toggleAllRowsSelected(false);
		},
		onError: (error: APIError) => {
			toast({
				title: error.details,
				action: 'error',
			});
		},
	});

	function deleteMultipleMiddlewaresHandler() {
		const middlewareIds = table.getSelectedRowModel().rows.map((row) => row.original._id);
		deleteMiddleware({
			orgId: orgId as string,
			versionId: versionId as string,
			appId: appId as string,
			middlewareIds,
		});
	}
	return (
		<Fragment>
			<VersionTabLayout<Middleware>
				searchable
				className='p-0'
				type='middleware'
				title={t('version.settings.middlewares') as string}
				emptyStateTitle={t('version.middleware.no_middleware_found')}
				createButtonTitle={t('version.middleware.add_middleware')}
				isEmpty={!middlewares.length}
				openCreateModal={() => setOpen(true)}
				onMultipleDelete={deleteMultipleMiddlewaresHandler}
				table={table}
				disabled={!canCreate}
				loading={isFetching && !middlewares.length}
			>
				<InfiniteScroll
					scrollableTarget='version-layout'
					dataLength={middlewares.length}
					next={fetchNextPage}
					hasMore={hasNextPage}
					loader={isFetchingNextPage && <TableLoading />}
				>
					<DataTable<Middleware> table={table} />
				</InfiniteScroll>
			</VersionTabLayout>
			<AddMiddlewareDrawer open={open} onOpenChange={setOpen} />
		</Fragment>
	);
}
