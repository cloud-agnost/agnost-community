import { DataTable } from '@/components/DataTable';
import { TableLoading } from '@/components/Table/Table';
import { CreateFunction, FunctionColumns } from '@/features/function';
import { useInfiniteScroll, useTable, useToast } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useFunctionStore from '@/store/function/functionStore';
import { APIError, HelperFunction } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams } from 'react-router-dom';

export default function MainFunction() {
	const { t } = useTranslation();
	const { toast } = useToast();
	const canCreate = useAuthorizeVersion('function.create');
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const { functions, lastFetchedPage, getFunctionsOfAppVersion, deleteMultipleFunctions } =
		useFunctionStore();
	const table = useTable({
		data: functions,
		columns: FunctionColumns,
	});
	const { versionId, orgId, appId } = useParams();

	const { mutateAsync: deleteFunction } = useMutation({
		mutationFn: deleteMultipleFunctions,
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

	function deleteMultipleFunctionsHandler() {
		deleteFunction({
			functionIds: table.getSelectedRowModel().rows.map((row) => row.original._id),
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
		});
	}
	const { fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } = useInfiniteScroll({
		queryFn: getFunctionsOfAppVersion,
		dataLength: functions.length,
		lastFetchedPage,
		queryKey: 'functions',
	});

	return (
		<>
			<VersionTabLayout
				searchable
				type='function'
				title={t('function.title') as string}
				createButtonTitle={t('function.add')}
				emptyStateTitle={t('function.empty_text')}
				isEmpty={!functions.length}
				openCreateModal={() => setIsCreateModalOpen(true)}
				onMultipleDelete={deleteMultipleFunctionsHandler}
				table={table}
				disabled={!canCreate}
				loading={isFetching && !functions.length}
			>
				<InfiniteScroll
					scrollableTarget='version-layout'
					dataLength={functions.length}
					next={fetchNextPage}
					hasMore={hasNextPage}
					loader={isFetchingNextPage && <TableLoading />}
				>
					<DataTable<HelperFunction> table={table} />
				</InfiniteScroll>
			</VersionTabLayout>
			<CreateFunction open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
		</>
	);
}
