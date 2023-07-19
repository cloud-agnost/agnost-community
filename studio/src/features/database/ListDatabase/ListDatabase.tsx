import { DataTable } from 'components/DataTable';
import { Database } from '@/types';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import { useState } from 'react';
import { Row } from '@tanstack/react-table';
import { EmptyState } from 'components/EmptyState';
import { Trans, useTranslation } from 'react-i18next';
import { cn } from '@/utils';
import { DatabaseIcon } from 'components/icons';
import { CreateDatabaseButton } from '@/features/database/CreateDatabaseButton';
import { DatabaseColumns } from '@/features/database/ListDatabase/index.ts';
import { SearchInput } from 'components/SearchInput';
import { CreateAndEditDatabaseDrawer } from '@/features/database/CreateAndEditDatabaseDrawer';
import { ConfirmationModal } from 'components/ConfirmationModal';

export default function ListDatabase() {
	const {
		toDeleteDatabase,
		searchDatabases,
		isOpenDeleteDatabaseDialog,
		setIsOpenDeleteDatabaseDialog,
		databasesForSearch,
		setEditDatabaseDialogOpen,
		deleteDatabase,
		editDatabaseDialogOpen,
	} = useDatabaseStore();
	const [, setSelectedRows] = useState<Row<Database>[]>();
	const { t } = useTranslation();

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

	return (
		<>
			<div className='flex flex-col gap-2 items-center sm:flex-row justify-between'>
				<h1 className='text-[26px] text-default leading-[44px] font-semibold'>
					{t('database.page_title')}
				</h1>
				<div className='flex gap-4'>
					<SearchInput
						onClear={() => searchDatabases('')}
						onChange={(event) => searchDatabases(event.target.value)}
						className='w-[450px]'
					/>
					<CreateDatabaseButton />
				</div>
			</div>

			<div
				className={cn(
					'pb-6',
					databasesForSearch.length === 0 && 'flex items-center justify-center h-full',
				)}
			>
				{databasesForSearch.length === 0 ? (
					<EmptyState
						title={t('version.middleware.no_middleware_found')}
						icon={<DatabaseIcon className='text-[110px]' />}
					>
						<CreateDatabaseButton />
					</EmptyState>
				) : (
					<DataTable<Database>
						columns={DatabaseColumns}
						data={databasesForSearch.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))}
						noDataMessage={<p className='text-xl'>{t('version.middleware.no_middleware_found')}</p>}
						setSelectedRows={setSelectedRows}
					/>
				)}
				<CreateAndEditDatabaseDrawer
					open={editDatabaseDialogOpen}
					onOpenChange={setEditDatabaseDialogOpen}
					editMode
				/>
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
			</div>
		</>
	);
}
