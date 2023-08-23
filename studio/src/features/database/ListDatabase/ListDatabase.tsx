import { DataTable } from 'components/DataTable';
import { Database } from '@/types';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import { useMemo, useState } from 'react';
import { Row, Table } from '@tanstack/react-table';
import { Trans, useTranslation } from 'react-i18next';
import { DatabaseIcon } from 'components/icons';
import { DatabaseColumns } from '@/features/database/ListDatabase/index.ts';
import { CreateAndEditDatabaseDrawer } from '@/features/database/CreateAndEditDatabaseDrawer';
import { ConfirmationModal } from 'components/ConfirmationModal';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion.tsx';
import { useSearchParams } from 'react-router-dom';

export default function ListDatabase() {
	const {
		databases,
		toDeleteDatabase,
		isOpenDeleteDatabaseDialog,
		setIsOpenDeleteDatabaseDialog,
		setEditDatabaseDialogOpen,
		deleteDatabase,
		editDatabaseDialogOpen,
	} = useDatabaseStore();
	const [selectedRows, setSelectedRows] = useState<Row<Database>[]>();
	const { t } = useTranslation();
	const canEdit = useAuthorizeVersion('db.create');
	const [createDrawerIsOpen, setCreateDrawerIsOpen] = useState(false);
	const [table, setTable] = useState<Table<Database>>();
	const [searchParams, setSearchParams] = useSearchParams();

	const search = searchParams.get('q') ?? '';

	function setSearch(value?: string) {
		if (!value || value === '') searchParams.delete('q');
		else searchParams.set('q', value);
		setSearchParams(searchParams);
	}

	const databasesForSearch = useMemo(() => {
		if (!search) return databases;
		return databases.filter((database) =>
			database.name.toLowerCase().includes(search.toLowerCase()),
		);
	}, [search, databases]);

	async function deleteHandler() {
		if (!toDeleteDatabase) return;
		await deleteDatabase({
			orgId: toDeleteDatabase.orgId,
			appId: toDeleteDatabase.appId,
			dbId: toDeleteDatabase._id,
			versionId: toDeleteDatabase.versionId,
		});
		setIsOpenDeleteDatabaseDialog(false);
	}

	function onSearch(value: string) {
		setSearch(value.trim());
	}

	const data = databasesForSearch.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

	return (
		<>
			<VersionTabLayout<Database>
				onSearchInputClear={() => onSearch('')}
				className='p-0'
				isEmpty={data.length === 0}
				title={t('database.page_title')}
				icon={<DatabaseIcon className='w-44 h-44' />}
				openCreateModal={() => setCreateDrawerIsOpen(true)}
				createButtonTitle={t('database.add.title')}
				emptyStateTitle={t('database.empty_text')}
				table={table}
				selectedRowLength={selectedRows?.length}
				onSearch={onSearch}
				disabled={!canEdit}
			>
				<DataTable<Database>
					columns={DatabaseColumns}
					setTable={setTable}
					data={databasesForSearch.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))}
					noDataMessage={<p className='text-xl'>{t('database.empty_text')}</p>}
					setSelectedRows={setSelectedRows}
				/>
			</VersionTabLayout>

			<CreateAndEditDatabaseDrawer
				open={editDatabaseDialogOpen}
				onOpenChange={setEditDatabaseDialogOpen}
				editMode
			/>
			<CreateAndEditDatabaseDrawer open={createDrawerIsOpen} onOpenChange={setCreateDrawerIsOpen} />
			{toDeleteDatabase && (
				<ConfirmationModal
					alertTitle={t('database.delete.confirm_title')}
					alertDescription={t('database.delete.confirm_description')}
					title={t('database.delete.title')}
					confirmCode={toDeleteDatabase.name}
					description={
						<Trans
							i18nKey='database.delete.confirm'
							values={{ confirmCode: toDeleteDatabase.name }}
							components={{
								confirmCode: <span className='font-bold text-default' />,
							}}
						/>
					}
					onConfirm={deleteHandler}
					isOpen={isOpenDeleteDatabaseDialog}
					closeModal={() => setIsOpenDeleteDatabaseDialog(false)}
				/>
			)}
		</>
	);
}
