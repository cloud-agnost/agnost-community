import { BreadCrumb, BreadCrumbItem } from '@/components/BreadCrumb';
import { Button } from '@/components/Button';
import { Model as ModelIcon } from '@/components/icons';
import { useNavigatorColumns, useToast } from '@/hooks';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useAuthStore from '@/store/auth/authStore';
import useModelStore from '@/store/database/modelStore';
import useNavigatorStore from '@/store/database/navigatorStore';
import { Field } from '@/types';
import { cn, isEmpty } from '@/utils';
import { Table as TableIcon } from '@phosphor-icons/react';
import { Row, Table } from '@tanstack/react-table';
import { DataTable } from 'components/DataTable';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoaderFunctionArgs, useParams, useSearchParams } from 'react-router-dom';

Navigator.loader = async function ({ params }: LoaderFunctionArgs) {
	if (!useAuthStore.getState().isAuthenticated()) return null;
	const { models } = useModelStore.getState();
	if (models.length > 0) return null;
	const apiParams = params as {
		orgId: string;
		appId: string;
		versionId: string;
		dbId: string;
	};

	const { getModelsOfDatabase } = useModelStore.getState();
	await getModelsOfDatabase(apiParams);
	return null;
};

export default function Navigator() {
	const { t } = useTranslation();
	const { notify } = useToast();
	const [selectedRows, setSelectedRows] = useState<Row<Record<string, any>>[]>();
	const [page, setPage] = useState(0);
	const [table, setTable] = useState<Table<Field>>();
	const [searchParams, setSearchParams] = useSearchParams();
	const {
		setEditedField,
		getDataFromModel,
		deleteMultipleDataFromModel,
		data,
		editedField,
		subModelData,
	} = useNavigatorStore();

	const { model, setModel, models, subModel, resetNestedModels, getModelsTitle } = useModelStore();
	const title = getModelsTitle();
	const canMultiDelete = true;
	const hasSubModel = !isEmpty(subModel);
	const columns = useNavigatorColumns(hasSubModel ? subModel.fields : model.fields);
	const { orgId, appId, versionId } = useParams<{
		orgId: string;
		appId: string;
		versionId: string;
	}>();

	const dbUrl = `/organization/${orgId}/apps/${appId}/version/${versionId}/database`;

	async function deleteHandler() {
		if (!selectedRows) return;
		const ids = selectedRows.map((row) => row.original.id);
		await deleteMultipleDataFromModel({
			ids,
			onSuccess: () => {
				table?.toggleAllRowsSelected(false);
				setPage(0);
			},
			onError: ({ error, details }) => {
				notify({ type: 'error', description: details, title: error });
			},
		});
	}

	useEffect(() => {
		setEditedField('');
		document.body.addEventListener('click', () => {
			setEditedField('');
		});
		return () => {
			document.body.removeEventListener('click', () => {
				setEditedField('');
			});
		};
	}, []);

	useEffect(() => {
		if (model && isEmpty(subModel)) {
			getDataFromModel({
				page,
				limit: 10,
				id: searchParams.get('ref') as string,
			});
		}
	}, [model, subModel]);
	const breadcrumbItems: BreadCrumbItem[] = [
		{
			name: t('database.page_title').toString(),
			url: dbUrl,
		},
		{
			name: 'Navigator',
		},
	];
	return (
		<VersionTabLayout
			isEmpty={false}
			title={title}
			icon={<ModelIcon className='w-44 h-44' />}
			emptyStateTitle={t('database.fields.no_fields')}
			table={table}
			selectedRowLength={selectedRows?.length}
			disabled={!canMultiDelete}
			onMultipleDelete={deleteHandler}
			breadCrumb={<BreadCrumb goBackLink={dbUrl} items={breadcrumbItems} />}
		>
			<div className='flex gap-4 justify-center h-[88%]'>
				<div className=' bg-subtle p-4 rounded-lg w-1/6 space-y-4'>
					<h2 className='text-default text-2xl font-sfCompact'>
						Models
						<span className='text-subtle font-sfCompact'> ({models.length})</span>
					</h2>

					<div>
						{models.map((md) => (
							<div key={md._id}>
								<Button
									className={cn(
										'text-default text-base p-2 font-normal',
										model._id === md._id && 'font-bold bg-wrapper-background-hover',
									)}
									variant='blank'
									onClick={() => {
										setModel(md);
										resetNestedModels();
										setPage(0);
										searchParams.delete('ref');
										setSearchParams(searchParams);
									}}
								>
									<TableIcon className='w-6 h-6 inline-block mr-2' />
									{md.name}
								</Button>
							</div>
						))}
					</div>
				</div>
				<DataTable<any>
					className='table-fixed w-full relative'
					containerClassName='max-h-full overflow-auto'
					setTable={setTable}
					columns={columns}
					data={hasSubModel ? subModelData : data}
					noDataMessage={<p className='text-xl'>{t('database.fields.no_fields')}</p>}
					setSelectedRows={setSelectedRows}
					onCellClick={(cell) => {
						if (editedField !== cell.id) setEditedField(cell.id);
					}}
				/>
			</div>
		</VersionTabLayout>
	);
}