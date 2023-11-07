import { DataTable } from '@/components/DataTable';
import { TableLoading } from '@/components/Table/Table';
import { CreateFunction, FunctionColumns } from '@/features/function';
import { useInfiniteScroll, useToast } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useFunctionStore from '@/store/function/functionStore';
import { APIError, HelperFunction } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { Row, Table } from '@tanstack/react-table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams } from 'react-router-dom';

export default function MainFunction() {
	const { t } = useTranslation();
	const { notify } = useToast();
	const canCreate = useAuthorizeVersion('function.create');
	const [selectedRows, setSelectedRows] = useState<Row<HelperFunction>[]>([]);
	const [table, setTable] = useState<Table<HelperFunction>>();
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const { functions, lastFetchedPage, getFunctionsOfAppVersion, deleteMultipleFunctions } =
		useFunctionStore();
	const { versionId, orgId, appId } = useParams();

	const { mutateAsync: deleteFunction } = useMutation({
		mutationFn: deleteMultipleFunctions,
		onSuccess: () => {
			if (!functions.length) refetch();
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

	function deleteMultipleFunctionsHandler() {
		deleteFunction({
			functionIds: selectedRows.map((row) => row.original._id),
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
		});
	}
	const { fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteScroll({
		queryFn: getFunctionsOfAppVersion,
		dataLength: functions.length,
		lastFetchedPage,
	});

	return (
		<>
			<VersionTabLayout
				type='function'
				title={t('function.title')}
				createButtonTitle={t('function.add')}
				emptyStateTitle={t('function.empty_text')}
				isEmpty={!functions.length}
				openCreateModal={() => setIsCreateModalOpen(true)}
				onMultipleDelete={deleteMultipleFunctionsHandler}
				table={table}
				disabled={!canCreate}
			>
				<InfiniteScroll
					scrollableTarget='version-layout'
					dataLength={functions.length}
					next={fetchNextPage}
					hasMore={hasNextPage}
					loader={isFetchingNextPage && <TableLoading />}
				>
					<DataTable<HelperFunction>
						data={functions}
						columns={FunctionColumns}
						setSelectedRows={setSelectedRows}
						setTable={setTable}
					/>
				</InfiniteScroll>
			</VersionTabLayout>
			<CreateFunction open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
		</>
	);
}
