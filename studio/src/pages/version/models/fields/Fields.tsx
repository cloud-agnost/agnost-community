import {
	CreateFieldButton,
	EditOrCreateFieldDrawer,
	FieldColumns,
} from '@/features/database/models/fields/ListFields';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion.tsx';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import useModelStore from '@/store/database/modelStore.ts';
import { Database, Field, Model } from '@/types';
import { Row, Table } from '@tanstack/react-table';
import { BreadCrumb, BreadCrumbItem } from 'components/BreadCrumb';
import { DataTable } from 'components/DataTable';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';

export default function Fields() {
	const { modelId, versionId, dbId, appId, orgId } = useParams() as Record<string, string>;
	const [parentModelIid, setParentModelIid] = useState<string>();
	const { isOpenEditFieldDialog, setIsOpenEditFieldDialog, models, getSpecificModelOfDatabase } =
		useModelStore();
	const [selectedRows, setSelectedRows] = useState<Row<Field>[]>();
	const { t } = useTranslation();
	const [table, setTable] = useState<Table<Field>>();
	const { databases } = useDatabaseStore();
	const { deleteMultipleField } = useModelStore();
	const canMultiDelete = useAuthorizeVersion('model.delete');
	const [searchParams] = useSearchParams();

	const model = models.find((model) => model._id === modelId) as Model;
	const parentModel = models.find((model) => model.iid === parentModelIid);

	useEffect(() => {
		findModel();
	}, [modelId]);

	async function findModel() {
		const model = await getSpecificModelOfDatabase({
			appId,
			versionId,
			orgId,
			dbId,
			modelId,
		});
		setParentModelIid(model.parentiid);
	}

	const filteredFields = useMemo(() => {
		const search = searchParams.get('q') ?? '';
		if (!search) return model?.fields;

		return model?.fields
			?.filter((f) => {
				return f.name.toLowerCase().includes(search.toLowerCase());
			})
			.sort((a, b) => b.order - a.order);
	}, [searchParams.get('q'), model]);

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
	const databaseUrl = `${databasesUrl}/${model?.dbId}/models`;
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
			{model && (
				<VersionTabLayout<Field>
					breadCrumb={
						<BreadCrumb
							goBackLink={parentModel ? goParentModelUrl : databaseUrl}
							items={breadcrumbItems}
						/>
					}
					isEmpty={!filteredFields.length}
					title={t('database.fields.title')}
					type='field'
					handlerButton={<CreateFieldButton />}
					emptyStateTitle={t('database.fields.no_fields')}
					table={table}
					selectedRowLength={selectedRows?.length}
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
			)}
			<EditOrCreateFieldDrawer
				key={isOpenEditFieldDialog.toString()}
				open={isOpenEditFieldDialog}
				onOpenChange={setIsOpenEditFieldDialog}
				editMode
			/>
		</>
	);
}
