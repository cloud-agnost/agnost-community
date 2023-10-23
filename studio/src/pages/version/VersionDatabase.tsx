import { CreateAndEditDatabaseDrawer } from '@/features/database/CreateAndEditDatabaseDrawer';
import { DatabaseColumns } from '@/features/database/ListDatabase/index.ts';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion.tsx';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import { Database } from '@/types';
import { Row, Table } from '@tanstack/react-table';
import { ConfirmationModal } from 'components/ConfirmationModal';
import { DataTable } from 'components/DataTable';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';

export default function VersionDatabase() {
	const {
		databases,
		toDeleteDatabase,
		isOpenDeleteDatabaseDialog,
		setIsOpenDeleteDatabaseDialog,
		setEditDatabaseDialogOpen,
		deleteDatabase,
		getDatabasesOfApp,
		editDatabaseDialogOpen,
		// lastFetchedCount,
	} = useDatabaseStore();
	const [page, setPage] = useState(0);
	const { t } = useTranslation();
	const [selectedRows, setSelectedRows] = useState<Row<Database>[]>();
	const canEdit = useAuthorizeVersion('db.create');
	const [createDrawerIsOpen, setCreateDrawerIsOpen] = useState(false);
	const [table, setTable] = useState<Table<Database>>();
	const [searchParams] = useSearchParams();
	const [loading, setLoading] = useState(false);
	const { versionId, appId, orgId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();
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

	useEffect(() => {
		if (!versionId || !appId || !orgId) return;
		setLoading(true);
		getDatabasesOfApp({
			orgId: orgId as string,
			versionId: versionId as string,
			appId: appId as string,
		});
		// search: searchParams.get('q') ?? '',
		// page,
		// size: PAGE_SIZE,
		setLoading(false);
	}, [page, searchParams.get('q')]);
	console.log(loading);
	return (
		<VersionTabLayout<Database>
			className='p-0'
			isEmpty={databases.length === 0}
			title={t('database.page_title')}
			type='database'
			openCreateModal={() => setCreateDrawerIsOpen(true)}
			createButtonTitle={t('database.add.title')}
			emptyStateTitle={t('database.empty_text')}
			table={table}
			selectedRowLength={selectedRows?.length}
			onSearch={() => setPage(0)}
			disabled={!canEdit}
		>
			{/* <InfiniteScroll
				scrollableTarget='version-layout'
				dataLength={databases.length}
				next={() => setPage(page + 1)}
				hasMore={lastFetchedCount >= PAGE_SIZE}
				loader={loading && <TableLoading />}
			>
			</InfiniteScroll> */}
			<DataTable<Database>
				columns={DatabaseColumns}
				setTable={setTable}
				data={databases}
				noDataMessage={<p className='text-xl'>{t('database.empty_text')}</p>}
				setSelectedRows={setSelectedRows}
			/>
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
		</VersionTabLayout>
	);
}
