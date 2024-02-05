import { BreadCrumb, BreadCrumbItem } from '@/components/BreadCrumb';
import { Button } from '@/components/Button';
import { Refresh } from '@/components/icons';
import { MODULE_PAGE_SIZE } from '@/constants';
import { SelectModel } from '@/features/database';
import { useNavigatorColumns, useToast, useUpdateData, useUpdateEffect } from '@/hooks';
import { VersionTabLayout } from '@/layouts/VersionLayout';
import useDatabaseStore from '@/store/database/databaseStore';
import useModelStore from '@/store/database/modelStore';
import useNavigatorStore from '@/store/database/navigatorStore';
import { APIError, FieldTypes, TabTypes } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CellEditRequestEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css'; // Core CSS
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Theme
import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import _ from 'lodash';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import { Pagination } from './Pagination';
import { TableHeader } from '@/features/database/models/Navigator';

export default function Navigator() {
	const { t } = useTranslation();
	const { toast } = useToast();
	const [searchParams] = useSearchParams();

	const {
		getDataFromModel,
		deleteMultipleDataFromModel,
		getDataOfSelectedModel,
		data: stateData,
		subModelData,
	} = useNavigatorStore();
	const database = useDatabaseStore((state) => state.database);

	const { model, subModel } = useModelStore();
	const canMultiDelete = true;

	const columns = useNavigatorColumns();
	const { orgId, appId, versionId, modelId } = useParams() as Record<string, string>;
	const gridRef = useRef<AgGridReact<any>>(null);
	const data = useMemo(() => getDataOfSelectedModel(modelId) ?? [], [modelId, stateData]);
	const updateData = useUpdateData();
	const dbUrl = `/organization/${orgId}/apps/${appId}/version/${versionId}/database`;

	const { mutateAsync: deleteMultipleMutate } = useMutation({
		mutationFn: deleteMultipleDataFromModel,
		mutationKey: ['deleteMultipleDataFromModel'],
		// onSuccess: () => table.resetRowSelection(),
		onError: ({ details }: APIError) => {
			toast({ action: 'error', title: details });
		},
	});

	async function deleteHandler() {
		const ids = gridRef.current?.api.getSelectedNodes().map((node) => node.data.id);
		deleteMultipleMutate({
			ids,
		});
	}
	function handleExportClick() {
		gridRef.current!.api.exportDataAsCsv();
	}

	const breadcrumbItems: BreadCrumbItem[] = [
		{
			name: database.name,
			url: dbUrl,
		},
		{
			name: model?.name,
			url: `${dbUrl}/${database._id}/models`,
		},
		{
			name: t('database.navigator.title').toString(),
		},
	];

	const { refetch, isFetching } = useQuery({
		queryKey: [
			'getDataFromModel',
			modelId,
			searchParams.get('f'),
			searchParams.get('d'),
			searchParams.get('ref'),
			searchParams.get('page'),
			searchParams.get('size'),
			database.type,
		],
		queryFn: () =>
			getDataFromModel({
				sortBy: searchParams.get('f') as string,
				sortDir: searchParams.get('d') as string,
				page: searchParams.get('page') ? Number(searchParams.get('page')) : 0,
				size: searchParams.get('size') ? Number(searchParams.get('size')) : MODULE_PAGE_SIZE,
				id: searchParams.get('ref') as string,
				dbType: database.type,
			}),
	});
	function onCellEditRequest(event: CellEditRequestEvent) {
		const oldData = event.data;
		const field = event.colDef.field;
		let newValue = event.newValue;
		const newData = { ...oldData };
		newData[field!] = event.newValue;

		const tx = {
			update: [newData],
		};
		if (event.colDef.cellEditorParams.type === FieldTypes.JSON) {
			newValue = JSON.parse(event.newValue.toString() ?? '');
		}

		if (event.colDef.cellEditorParams.type === FieldTypes.GEO_POINT) {
			const coords = {
				lat:
					database.type.toString() === 'MongoDB'
						? event.newValue?.coordinates?.[0]
						: event.newValue?.x,
				lng:
					database.type.toString() === 'MongoDB'
						? event.newValue?.coordinates?.[1]
						: event.newValue?.y,
			};
			newValue = [coords.lat, coords.lng];
		}

		event.api.applyTransaction(tx);

		updateData(
			{
				[field!]: newValue,
			},
			oldData.id,
			event.node.rowIndex as number,
			field!,
		);
	}

	useUpdateEffect(() => {
		if (isFetching) {
			gridRef.current!.api.showLoadingOverlay();
		} else {
			gridRef.current!.api.hideOverlay();
		}
	}, [isFetching]);

	return (
		<VersionTabLayout
			isEmpty={false}
			type={TabTypes.Field}
			emptyStateTitle={t('database.fields.no_fields')}
			disabled={!canMultiDelete}
			onMultipleDelete={deleteHandler}
			loading={false}
			className='!overflow-hidden'
			breadCrumb={<BreadCrumb items={breadcrumbItems} />}
			handlerButton={
				<>
					<Button variant='outline' onClick={handleExportClick} disabled={!canMultiDelete}>
						Export as CSV
					</Button>
					<Button variant='secondary' onClick={() => refetch()} iconOnly>
						<Refresh className='mr-1 text-sm' />
						{t('general.refresh')}
					</Button>
					<SelectModel />
				</>
			}
		>
			<div className='ag-theme-quartz-dark h-full flex flex-col'>
				<AgGridReact
					className='flex-1'
					ref={gridRef}
					rowData={!_.isEmpty(subModel) ? subModelData?.[modelId] : data}
					columnDefs={columns}
					autoSizeStrategy={{ type: 'fitGridWidth' }}
					rowSelection='multiple'
					components={{
						agColumnHeader: TableHeader,
					}}
					readOnlyEdit={true}
					onCellEditRequest={onCellEditRequest}
					reactiveCustomComponents
					overlayLoadingTemplate={
						'<div aria-live="polite" aria-atomic="true" style="position:absolute;top:0;left:0;right:0; bottom:0; background: url(https://ag-grid.com/images/ag-grid-loading-spinner.svg) center no-repeat" aria-label="loading"></div>'
					}
				/>
				<Pagination />
			</div>
		</VersionTabLayout>
	);
}
