import { Database, Model } from '@/types';
import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { DataTable } from 'components/DataTable';
import {
	EditOrCreateModelDrawer,
	ModelColumns,
} from '@/features/database/models/ListModels/index.ts';
import { Row, Table } from '@tanstack/react-table';
import { Model as ModelIcon } from '@/components/icons';
import useModelStore from '@/store/database/modelStore.ts';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion.tsx';
import { useParams } from 'react-router-dom';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import { BreadCrumb, BreadCrumbItem } from 'components/BreadCrumb';
import { Button } from '@/components/Button';
import { useTabNavigate } from '@/hooks';
export default function ListModels() {
	const { models } = useModelStore();
	const [selectedRows, setSelectedRows] = useState<Row<Model>[]>();
	const [search, setSearch] = useState('');
	const { t } = useTranslation();
	const [table, setTable] = useState<Table<Model>>();
	const [createModelDrawerIsOpen, setCreateModelDrawerIsOpen] = useState(false);
	const canCreateModel = useAuthorizeVersion('model.create');
	const deleteMultipleModel = useModelStore((state) => state.deleteMultipleModel);
	const { dbId } = useParams();
	const { databases } = useDatabaseStore();
	const navigate = useTabNavigate();
	const filteredModels = useMemo(() => {
		if (!search) return models;

		return models.filter((model) => {
			return model.name.toLowerCase().includes(search.toLowerCase());
		});
	}, [search, models]);

	const database = useMemo(() => {
		return databases.find((database) => database._id === dbId) as Database;
	}, [databases, dbId]);

	const hasNoModels = filteredModels.length === 0;

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
				onSearchInputClear={() => setSearch('')}
				isEmpty={hasNoModels}
				title={t('database.models.title')}
				icon={<ModelIcon className='w-44 h-44' />}
				openCreateModal={() => setCreateModelDrawerIsOpen(true)}
				createButtonTitle={t('database.models.create')}
				emptyStateTitle={t('database.models.no_models')}
				table={table}
				selectedRowLength={selectedRows?.length}
				onSearch={(value) => setSearch(value)}
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
								type: 'Database',
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
				open={createModelDrawerIsOpen}
				onOpenChange={setCreateModelDrawerIsOpen}
			/>
		</>
	);
}
