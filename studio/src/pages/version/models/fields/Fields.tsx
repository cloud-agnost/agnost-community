import {
	CreateFieldButton,
	EditOrCreateFieldDrawer,
	FieldColumns,
} from '@/features/database/models/fields/ListFields';
import { useSearch, useTable } from '@/hooks';
import useAuthorizeVersion from '@/hooks/useAuthorizeVersion.tsx';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useAuthStore from '@/store/auth/authStore';
import useDatabaseStore from '@/store/database/databaseStore.ts';
import useModelStore from '@/store/database/modelStore.ts';
import { Field } from '@/types';
import { BreadCrumb, BreadCrumbItem } from 'components/BreadCrumb';
import { DataTable } from 'components/DataTable';
import { useTranslation } from 'react-i18next';
import { LoaderFunctionArgs, useParams } from 'react-router-dom';

Fields.loader = async function ({ params }: LoaderFunctionArgs) {
	if (!useAuthStore.getState().isAuthenticated()) return null;

	const apiParams = params as {
		orgId: string;
		appId: string;
		versionId: string;
		dbId: string;
		modelId: string;
	};

	const { getSpecificModelOfDatabase, model } = useModelStore.getState();
	if (apiParams.modelId !== model._id && apiParams.modelId)
		await getSpecificModelOfDatabase(apiParams);

	return { props: {} };
};

export default function Fields() {
	const { modelId, versionId, dbId, appId, orgId } = useParams() as Record<string, string>;

	const { t } = useTranslation();
	const { database } = useDatabaseStore();
	const { deleteMultipleField, model, closeEditFieldDialog, isEditFieldDialogOpen } =
		useModelStore();
	const canMultiDelete = useAuthorizeVersion('model.delete');

	const filteredFields = useSearch(model.fields);

	const table = useTable<Field>({
		data: filteredFields,
		columns: FieldColumns,
	});

	async function deleteHandler() {
		await deleteMultipleField({
			modelId,
			versionId,
			dbId,
			appId,
			orgId,
			fieldIds: table.getSelectedRowModel().rows.map((row) => row.original._id),
		});

		table?.resetRowSelection?.();
	}

	const databasesUrl = `/organization/${database?.orgId}/apps/${database?.appId}/version/${database?.versionId}/database`;
	const databaseUrl = `${databasesUrl}/${model?.dbId}/models`;
	const goParentModelUrl = `${databaseUrl}/${model?._id}/fields`;

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
			name: model?.name,
		},
	];

	return (
		<>
			<VersionTabLayout<Field>
				breadCrumb={<BreadCrumb goBackLink={goParentModelUrl} items={breadcrumbItems} />}
				isEmpty={!filteredFields.length}
				title={t('database.fields.title')}
				type='field'
				handlerButton={<CreateFieldButton />}
				emptyStateTitle={t('database.fields.no_fields')}
				table={table}
				disabled={!canMultiDelete}
				onMultipleDelete={deleteHandler}
				loading={!model}
			>
				<DataTable<Field> table={table} />
			</VersionTabLayout>

			<EditOrCreateFieldDrawer
				key={isEditFieldDialogOpen.toString()}
				open={isEditFieldDialogOpen}
				onOpenChange={closeEditFieldDialog}
				editMode
			/>
		</>
	);
}