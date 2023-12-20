import { CreateDatabase, DatabaseColumns, EditDatabase } from '@/features/database';
import { useSearch, useTable, useToast, useUpdateEffect } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion.tsx';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import useEnvironmentStore from '@/store/environment/environmentStore';
import { APIError, Database } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ConfirmationModal } from 'components/ConfirmationModal';
import { DataTable } from 'components/DataTable';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
export default function VersionDatabase() {
	const {
		databases,
		toDeleteDatabase,
		isDeleteDatabaseDialogOpen,
		isEditDatabaseDialogOpen,
		isDatabaseFetched,
		closeEditDatabaseDialog,
		closeDeleteDatabaseDialog,
		deleteDatabase,
		getDatabasesOfApp,
	} = useDatabaseStore();
	const { t } = useTranslation();
	const { notify } = useToast();
	const canEdit = useAuthorizeVersion('db.create');
	const [createDrawerIsOpen, setCreateDrawerIsOpen] = useState(false);
	const { versionId, appId, orgId } = useParams<{
		versionId: string;
		appId: string;
		orgId: string;
	}>();

	const filteredDatabase = useSearch(databases);

	const { isFetching, refetch } = useQuery({
		queryKey: ['getDatabases'],
		queryFn: () =>
			getDatabasesOfApp({
				orgId: orgId as string,
				versionId: versionId as string,
				appId: appId as string,
			}),
		enabled: !isDatabaseFetched,
		refetchOnWindowFocus: false,
	});

	const table = useTable({
		data: filteredDatabase,
		columns: DatabaseColumns,
	});
	const { getEnvironmentResources, environment } = useEnvironmentStore();
	const { mutateAsync: deleteDatabaseMutation, isPending: deleteLoading } = useMutation({
		mutationFn: deleteDatabase,
		onError: (error: APIError) => {
			notify({
				title: error.error,
				description: error.details,
				type: 'error',
			});
		},
		onSettled: () => {
			closeDeleteDatabaseDialog();
		},
		onSuccess: () => {
			getEnvironmentResources({
				orgId: environment?.orgId,
				appId: environment?.appId,
				envId: environment?._id,
				versionId: environment?.versionId,
			});
		},
	});
	async function deleteHandler() {
		if (!toDeleteDatabase) return;
		deleteDatabaseMutation({
			orgId: toDeleteDatabase.orgId,
			appId: toDeleteDatabase.appId,
			dbId: toDeleteDatabase._id,
			versionId: toDeleteDatabase.versionId,
		});
	}
	useUpdateEffect(() => {
		refetch();
	}, [orgId, appId, versionId]);
	return (
		<>
			<CreateDatabase open={createDrawerIsOpen} onOpenChange={setCreateDrawerIsOpen} />
			<EditDatabase open={isEditDatabaseDialogOpen} onOpenChange={closeEditDatabaseDialog} />
			<VersionTabLayout<Database>
				searchable
				className='p-0'
				isEmpty={databases.length === 0}
				title={t('database.page_title') as string}
				type='database'
				openCreateModal={() => setCreateDrawerIsOpen(true)}
				createButtonTitle={t('database.add.title')}
				emptyStateTitle={t('database.empty_text')}
				table={table}
				disabled={!canEdit}
				loading={isFetching && !databases.length}
			>
				<DataTable<Database> table={table} />
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
						isOpen={isDeleteDatabaseDialogOpen}
						closeModal={closeDeleteDatabaseDialog}
						closable
						loading={deleteLoading}
					/>
				)}
			</VersionTabLayout>
		</>
	);
}
