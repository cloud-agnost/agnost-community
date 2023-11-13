import { Button } from '@/components/Button';
import { CreateModel, EditModel, ModelColumns } from '@/features/database/models';
import { useTabNavigate, useTable, useToast } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion.tsx';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import useModelStore from '@/store/database/modelStore.ts';
import { APIError, Model, TabTypes } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { BreadCrumb, BreadCrumbItem } from 'components/BreadCrumb';
import { DataTable } from 'components/DataTable';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
export default function Models() {
	const {
		models,
		deleteMultipleModel,
		isEditModelDialogOpen,
		closeEditModelDialog,
		getModelsOfDatabase,
	} = useModelStore();
	const [isCreateModelOpen, setIsCreateModelOpen] = useState(false);
	const [searchParams] = useSearchParams();
	const { t } = useTranslation();
	const { notify } = useToast();

	const canCreateModel = useAuthorizeVersion('model.create');
	const { dbId, orgId, appId, versionId } = useParams() as {
		dbId: string;
		orgId: string;
		appId: string;
		versionId: string;
	};
	const { database } = useDatabaseStore();
	const navigate = useTabNavigate();

	const filteredModels = useMemo(() => {
		if (searchParams.get('q')) {
			const query = new RegExp(searchParams.get('q') as string, 'i');
			return models.filter((model) => model.name.match(query));
		}
		return models;
	}, [searchParams.get('q'), models]);

	const table = useTable<Model>({
		data: filteredModels,
		columns: ModelColumns,
	});

	const { isPending } = useQuery({
		queryFn: () => getModelsOfDatabase({ dbId, orgId, appId, versionId }),
		queryKey: ['getModelsOfDatabase'],
	});

	const { mutateAsync: deleteMultipleModelMutation } = useMutation({
		mutationFn: deleteMultipleModel,
		mutationKey: ['deleteMultipleModel'],
		onSuccess: () => {
			table?.resetRowSelection();
		},
		onError: (error: APIError) => {
			notify({
				title: error.error,
				description: error.details,
				type: 'error',
			});
		},
	});

	async function deleteMultipleModelHandler() {
		deleteMultipleModelMutation({
			dbId: database._id,
			versionId: database.versionId,
			appId: database.appId,
			orgId: database.orgId,
			modelIds: table.getSelectedRowModel().rows.map((row) => row.original._id),
		});
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

	function handleViewDataClick() {
		navigate({
			title: 'Navigator',
			path: `${databasesUrl}/${database._id}/navigator`,
			isActive: true,
			isDashboard: false,
			type: TabTypes.Navigator,
		});
	}
	return (
		<>
			<VersionTabLayout<Model>
				breadCrumb={<BreadCrumb goBackLink={databasesUrl} items={breadcrumbItems} />}
				isEmpty={!filteredModels.length}
				title={t('database.models.title')}
				type='model'
				openCreateModal={() => setIsCreateModelOpen(true)}
				createButtonTitle={t('database.models.create')}
				emptyStateTitle={t('database.models.no_models')}
				table={table}
				disabled={!canCreateModel}
				onMultipleDelete={deleteMultipleModelHandler}
				loading={isPending}
				handlerButton={
					<Button variant='secondary' onClick={handleViewDataClick}>
						View Data
					</Button>
				}
			>
				<DataTable<Model> table={table} />
			</VersionTabLayout>
			<EditModel open={isEditModelDialogOpen} onOpenChange={closeEditModelDialog} />
			<CreateModel open={isCreateModelOpen} onOpenChange={setIsCreateModelOpen} />
		</>
	);
}
