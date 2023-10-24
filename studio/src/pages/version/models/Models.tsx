import { Button } from '@/components/Button';
import { EditOrCreateModelDrawer } from '@/features/database/models/ListModels';
import { ModelColumns } from '@/features/database/models/ListModels/index.ts';
import { useTabNavigate } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion.tsx';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import useModelStore from '@/store/database/modelStore.ts';
import { Database, Model, TabTypes } from '@/types';
import { Row, Table } from '@tanstack/react-table';
import { BreadCrumb, BreadCrumbItem } from 'components/BreadCrumb';
import { DataTable } from 'components/DataTable';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';

export default function Models() {
	const { models, deleteMultipleModel, isOpenEditModelDialog, setIsOpenEditModelDialog } =
		useModelStore();
	const [selectedRows, setSelectedRows] = useState<Row<Model>[]>();
	const [searchParams] = useSearchParams();
	const { t } = useTranslation();
	const [table, setTable] = useState<Table<Model>>();
	const canCreateModel = useAuthorizeVersion('model.create');
	const { dbId } = useParams();
	const { databases } = useDatabaseStore();
	const navigate = useTabNavigate();

	const filteredModels = useMemo(() => {
		const search = searchParams.get('q') ?? '';
		if (!search) return models;

		return models.filter((model) => {
			return model.name.toLowerCase().includes(search.toLowerCase());
		});
	}, [searchParams.get('q'), models]);

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
		table?.resetRowSelection();
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
			<VersionTabLayout<Model>
				breadCrumb={<BreadCrumb goBackLink={databasesUrl} items={breadcrumbItems} />}
				isEmpty={filteredModels.length === 0}
				title={t('database.models.title')}
				type='model'
				openCreateModal={() => setIsOpenEditModelDialog(true)}
				createButtonTitle={t('database.models.create')}
				emptyStateTitle={t('database.models.no_models')}
				table={table}
				selectedRowLength={selectedRows?.length}
				onSearch={() => {}}
				disabled={!canCreateModel}
				onMultipleDelete={deleteAll}
				handlerButton={
					<Button
						variant='secondary'
						onClick={() => {
							navigate({
								title: 'Navigator',
								path: `${databasesUrl}/${database._id}/navigator`,
								isActive: true,
								isDashboard: false,
								type: TabTypes.Navigator,
							});
						}}
					>
						View Data
					</Button>
				}
			>
				<DataTable<Model>
					columns={ModelColumns}
					data={filteredModels.filter((model) => model.type === 'model')}
					setTable={setTable}
					noDataMessage={<p className='text-xl'>{t('database.models.no_models')}</p>}
					setSelectedRows={setSelectedRows}
				/>
			</VersionTabLayout>
			<EditOrCreateModelDrawer
				open={isOpenEditModelDialog}
				onOpenChange={setIsOpenEditModelDialog}
				editMode={true}
			/>
		</>
	);
}
