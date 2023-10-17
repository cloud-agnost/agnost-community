import { ConfirmationModal } from '@/components/ConfirmationModal';
import { DataTable } from '@/components/DataTable';
import { TableLoading } from '@/components/Table/Table';
import { PAGE_SIZE } from '@/constants';
import { FunctionColumns } from '@/features/function';
import { useToast } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useFunctionStore from '@/store/function/functionStore';
import { APIError, HelperFunction } from '@/types';
import { Row, Table } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useOutletContext, useParams, useSearchParams } from 'react-router-dom';
interface OutletContext {
	setIsCreateModalOpen: (isOpen: boolean) => void;
}

export default function MainFunction() {
	const { t } = useTranslation();
	const { notify } = useToast();
	const canCreate = useAuthorizeVersion('function.create');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<APIError>();
	const [selectedRows, setSelectedRows] = useState<Row<HelperFunction>[]>([]);
	const [table, setTable] = useState<Table<HelperFunction>>();
	const [page, setPage] = useState(0);
	const {
		functions,
		getFunctionsOfAppVersion,
		lastFetchedCount,
		deleteMultipleFunctions,
		toDeleteFunction,
		isDeleteFunctionModalOpen,
		deleteFunction,
		closeDeleteFunctionModal,
	} = useFunctionStore();
	const { versionId, orgId, appId } = useParams();
	const [searchParams, setSearchParams] = useSearchParams();
	const { setIsCreateModalOpen }: OutletContext = useOutletContext();

	function onInput(value: string) {
		value = value.trim();
		if (!value) {
			searchParams.delete('q');
			setSearchParams(searchParams);
			return;
		}
		setPage(0);
		setSearchParams({ ...searchParams, q: value });
	}

	function deleteMultipleFunctionsHandler() {
		deleteMultipleFunctions({
			functionIds: selectedRows.map((row) => row.original._id),
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			onSuccess: () => {
				table?.toggleAllRowsSelected(false);
				setPage(0);
			},
			onError: ({ error, details }) => {
				notify({ type: 'error', description: details, title: error });
			},
		});
	}
	function deleteFunctionHandler() {
		setLoading(true);
		deleteFunction({
			funcId: toDeleteFunction?._id,
			orgId: orgId as string,
			appId: appId as string,
			versionId: versionId as string,
			onSuccess: () => {
				setLoading(false);
				closeDeleteFunctionModal();
			},
			onError: (error) => {
				setError(error);
				setLoading(false);
				closeDeleteFunctionModal();
			},
		});
	}

	useEffect(() => {
		if (versionId && orgId && appId) {
			getFunctionsOfAppVersion({
				orgId,
				appId,
				versionId,
				page,
				size: PAGE_SIZE,
				search: searchParams.get('q') ?? undefined,
				initialFetch: page === 0,
			});
		}
	}, [searchParams.get('q'), page]);

	return (
		<VersionTabLayout
			type='function'
			title={t('function.title')}
			createButtonTitle={t('function.add')}
			emptyStateTitle={t('function.empty_text')}
			isEmpty={!functions.length}
			openCreateModal={() => {
				setIsCreateModalOpen(true);
			}}
			onMultipleDelete={deleteMultipleFunctionsHandler}
			onSearch={onInput}
			table={table}
			selectedRowLength={selectedRows.length}
			disabled={!canCreate}
		>
			<InfiniteScroll
				scrollableTarget='version-layout'
				dataLength={functions.length}
				next={() => setPage(page + 1)}
				hasMore={lastFetchedCount >= PAGE_SIZE}
				loader={functions.length > 0 && <TableLoading />}
			>
				<DataTable<HelperFunction>
					data={functions}
					columns={FunctionColumns}
					setSelectedRows={setSelectedRows}
					setTable={setTable}
				/>
			</InfiniteScroll>
			<ConfirmationModal
				loading={loading}
				error={error}
				title={t('function.delete.title')}
				alertTitle={t('function.delete.message')}
				alertDescription={t('function.delete.description')}
				description={
					<Trans
						i18nKey='function.delete.confirmCode'
						values={{ confirmCode: toDeleteFunction?.iid }}
						components={{
							confirmCode: <span className='font-bold text-default' />,
						}}
					/>
				}
				confirmCode={toDeleteFunction?.iid}
				onConfirm={deleteFunctionHandler}
				isOpen={isDeleteFunctionModalOpen}
				closeModal={closeDeleteFunctionModal}
				closable
			/>
		</VersionTabLayout>
	);
}
