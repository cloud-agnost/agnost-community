import { CreateAndEditDatabaseDrawer } from '@/features/database/CreateAndEditDatabaseDrawer';
import { DatabaseColumns } from '@/features/database/ListDatabase/index.ts';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion.tsx';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import { Database } from '@/types';
import { Row, Table } from '@tanstack/react-table';
import { ConfirmationModal } from 'components/ConfirmationModal';
import { DataTable } from 'components/DataTable';
import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
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
		return databases
			.filter((database) => database.name.toLowerCase().includes(search.toLowerCase()))
			.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
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

	return (
		<>
			<VersionTabLayout<Database>
				onSearchInputClear={() => onSearch('')}
				className='p-0'
				isEmpty={databasesForSearch.length === 0}
				title={t('database.page_title')}
				type='database'
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
					data={databasesForSearch}
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
