import { Database, Field, Model } from '@/types';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import { DataTable } from 'components/DataTable';
import { Row, Table } from '@tanstack/react-table';
import { Model as ModelIcon } from '@/components/icons';
import { CreateFieldButton, FieldColumns } from '@/features/database/models/fields/ListFields';
import { BreadCrumb, BreadCrumbItem } from 'components/BreadCrumb';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import { useParams } from 'react-router-dom';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion.tsx';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import useModelStore from '@/store/database/modelStore.ts';

interface ListFieldsProps {
	model: Model;
	parentModel?: Model;
}

export default function ListFields({ model, parentModel }: ListFieldsProps) {
	const [selectedRows, setSelectedRows] = useState<Row<Field>[]>();
	const [search, setSearch] = useState('');
	const { t } = useTranslation();
	const [table, setTable] = useState<Table<Field>>();
	const { databases } = useDatabaseStore();
	const { deleteMultipleField } = useModelStore();
	const { dbId } = useParams();
	const canMultiDelete = useAuthorizeVersion('model.delete');

	const filteredFields = useMemo(() => {
		if (!search) return model.fields;

		return model.fields
			.filter((f) => {
				return f.name.toLowerCase().includes(search.toLowerCase());
			})
			.sort((a, b) => b.order - a.order);
	}, [search, model]);

	useEffect(() => {
		setSelectedRows((selectedRows) => {
			return selectedRows?.filter((row) => row.original.creator !== 'system');
		});
		if (table) {
			table?.setRowSelection((updater) => {
				return updater;
			});
		}
	}, []);

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
		setSelectedRows(undefined);
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
		<VersionTabLayout<Field>
			breadCrumb={
				<BreadCrumb
					goBackLink={parentModel ? goParentModelUrl : databaseUrl}
					items={breadcrumbItems}
				/>
			}
			onSearchInputClear={() => setSearch('')}
			isEmpty={!filteredFields.length}
			title={t('database.fields.title')}
			icon={<ModelIcon className='w-44 h-44' />}
			handlerButton={<CreateFieldButton />}
			emptyStateTitle={t('database.fields.no_fields')}
			table={table}
			selectedRowLength={selectedRows?.length}
			onSearch={(value) => setSearch(value)}
			disabled={!canMultiDelete}
			onMultipleDelete={deleteHandler}
		>
			<DataTable<Field>
				setTable={setTable}
				columns={FieldColumns}
				data={filteredFields}
				noDataMessage={<p className='text-xl'>{t('database.fields.no_fields')}</p>}
				setSelectedRows={setSelectedRows}
			/>
		</VersionTabLayout>
	);
}
