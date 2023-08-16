import { Database, Model } from '@/types';
import { useTranslation } from 'react-i18next';
import { Dispatch, SetStateAction, useMemo } from 'react';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import { useParams } from 'react-router-dom';
import { SearchInput } from 'components/SearchInput';
import { Row, Table } from '@tanstack/react-table';
import { SelectedRowButton } from 'components/Table';
import { CreateModelButton } from '@/features/database/models/ListModels/index.ts';
import useModelStore from '@/store/database/modelStore.ts';
import { BreadCrumb, BreadCrumbItem } from 'components/BreadCrumb';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';

interface ModelActionsProps {
	setSelectedRows: Dispatch<SetStateAction<Row<Model>[] | undefined>>;
	selectedRows: Row<Model>[] | undefined;
	setSearch: Dispatch<SetStateAction<string>>;
	table: Table<Model> | undefined;
}
export default function ModelActions({
	selectedRows,
	setSearch,
	setSelectedRows,
	table,
}: ModelActionsProps) {
	const { databases } = useDatabaseStore();
	const deleteMultipleModel = useModelStore((state) => state.deleteMultipleModel);
	const { t } = useTranslation();
	const { dbId } = useParams();
	const canMultiDelete = useAuthorizeVersion('model.delete');
	const database = useMemo(() => {
		return databases.find((database) => database._id === dbId) as Database;
	}, [databases, dbId]);

	async function deleteAll() {
		if (!database) return;
		await deleteMultipleModel({
			dbId: database._id,
			versionId: database.versionId,
			appId: database.appId,
			orgId: database.orgId,
			modelIds: selectedRows?.map((row) => row.original._id) as string[],
		});
		setSelectedRows(undefined);
	}

	const databasesUrl = `/organization/${database?.orgId}/apps/${database?.appId}/version/${database?.versionId}/database`;

	const breadcrumbItems: BreadCrumbItem[] = [
		{
			name: t('database.page_title').toString(),
			url: databasesUrl,
		},
		{
			name: database?.name,
		},
	];

	return (
		<>
			<BreadCrumb goBackLink={databasesUrl} items={breadcrumbItems} />
			<div className='flex flex-col gap-2 sm:items-center sm:flex-row justify-between'>
				<h1 className='text-[26px] text-default leading-[44px] font-semibold'>
					{t('database.models.title', {
						database: database?.name,
					})}
				</h1>
				<div className='flex gap-4 w-full sm:w-auto'>
					<SearchInput
						onChange={(e) => setSearch(e.target.value)}
						className='flex-1 lg:w-[450px]'
					/>
					{!!selectedRows?.length && (
						<SelectedRowButton<Model>
							table={table}
							onDelete={deleteAll}
							selectedRowLength={selectedRows?.length}
							disabled={!canMultiDelete}
						/>
					)}
					<CreateModelButton />
				</div>
			</div>
		</>
	);
}
