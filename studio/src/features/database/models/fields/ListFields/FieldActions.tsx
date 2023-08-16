import { Database, Field, Model } from '@/types';
import { useTranslation } from 'react-i18next';
import { Dispatch, SetStateAction, useMemo } from 'react';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import { useParams } from 'react-router-dom';
import { SearchInput } from 'components/SearchInput';
import { Row, Table } from '@tanstack/react-table';
import { SelectedRowButton } from 'components/Table';
import useModelStore from '@/store/database/modelStore.ts';
import { CreateFieldButton } from '@/features/database/models/fields/ListFields';
import { BreadCrumb, BreadCrumbItem } from 'components/BreadCrumb';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion';

interface ModelActionsProps {
	setSelectedRows: Dispatch<SetStateAction<Row<Field>[] | undefined>>;
	selectedRows: Row<Field>[] | undefined;
	setSearch: Dispatch<SetStateAction<string>>;
	table: Table<Field> | undefined;
	model: Model;
	parentModel?: Model;
}
export default function ModelActions({
	selectedRows,
	setSearch,
	table,
	model,
	parentModel,
}: ModelActionsProps) {
	const { databases } = useDatabaseStore();
	const { deleteMultipleField } = useModelStore();
	const { t } = useTranslation();
	const { dbId } = useParams();
	const canMultiDelete = useAuthorizeVersion('model.delete');
	const database = useMemo(() => {
		return databases.find((database) => database._id === dbId) as Database;
	}, [databases, dbId]);

	async function deleteHandler() {
		await deleteMultipleField({
			dbId: model.dbId,
			modelId: model._id,
			appId: database.appId,
			orgId: database.orgId,
			versionId: database.versionId,
			fieldIds: selectedRows?.map((row) => row.original._id) as string[],
		});
		table?.resetRowSelection?.();
	}

	const databasesUrl = `/organization/${database?.orgId}/apps/${database?.appId}/version/${database?.versionId}/database`;
	const databaseUrl = `${databasesUrl}/${model.dbId}/models`;
	const goParentModelUrl = `${databaseUrl}/${parentModel?._id}/fields`;

	const breadcrumbItems: BreadCrumbItem[] = [
		{
			name: t('database.page_title').toString(),
			url: databasesUrl,
		},
		{
			name: database?.name,
			url: databaseUrl,
		},
		{
			name: parentModel?.name,
			url: goParentModelUrl,
		},
		{
			name: model?.name,
		},
	];

	return (
		<>
			<BreadCrumb
				goBackLink={parentModel ? goParentModelUrl : databaseUrl}
				items={breadcrumbItems}
			/>
			<div className='flex flex-col gap-2 sm:items-center sm:flex-row justify-between'>
				<h1 className='text-[26px] text-default leading-[44px] font-semibold'>
					{t('database.fields.title', {
						model: parentModel ? `${parentModel.name}.${model?.name}` : model.name,
					})}
				</h1>
				<div className='flex gap-4 w-full sm:w-auto'>
					<SearchInput
						onClear={() => setSearch('')}
						onChange={(e) => setSearch(e.target.value)}
						className='flex-1 lg:w-[450px]'
					/>
					{!!selectedRows?.length && (
						<SelectedRowButton<Field>
							table={table}
							onDelete={deleteHandler}
							selectedRowLength={selectedRows?.length}
							disabled={!canMultiDelete}
						/>
					)}
					<CreateFieldButton />
				</div>
			</div>
		</>
	);
}
