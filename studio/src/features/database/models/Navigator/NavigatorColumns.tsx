import { TableConfirmation } from '@/components/Table';
import { toast } from '@/hooks/useToast';
import useDatabaseStore from '@/store/database/databaseStore';
import useModelStore from '@/store/database/modelStore';
import useNavigatorStore from '@/store/database/navigatorStore';
import { APIError } from '@/types';
import { getVersionPermission, translate } from '@/utils';
import { QueryClient } from '@tanstack/react-query';
import { ColDef, ICellRendererParams } from 'ag-grid-community';

const { deleteDataFromModel } = useNavigatorStore.getState();
const queryClient = new QueryClient();
async function deleteHandler(id: string) {
	const { model } = useModelStore.getState();
	const { database } = useDatabaseStore.getState();
	const { dataCountInfo, getDataFromModel } = useNavigatorStore.getState();
	const countInfo = dataCountInfo?.[model._id];
	return queryClient
		.getMutationCache()
		.build(queryClient, {
			mutationFn: deleteDataFromModel,
			onError: (error: APIError) => {
				toast({
					title: error.details,
					action: 'error',
				});

				getDataFromModel({
					page: countInfo?.currentPage ?? 0,
					size: countInfo?.pageSize ?? 0,
					dbType: database.type,
				});
			},
		})
		.execute({
			id,
		});
}

export const NavigatorColumns: ColDef[] = [
	{
		headerName: '',
		field: 'checkbox',
		checkboxSelection: true,
		headerCheckboxSelection: true,
		width: 50,
		pinned: 'left',
		resizable: true,
	},
	{
		headerName: translate('general.actions'),
		field: 'actions',
		width: 120,
		pinned: 'right',
		resizable: true,
		cellRenderer: (params: ICellRendererParams) => {
			const canDeleteModel = getVersionPermission('model.delete');
			return (
				<TableConfirmation
					align='end'
					title={translate('database.navigator.delete.title')}
					description={translate('database.navigator.delete.message')}
					onConfirm={() => deleteHandler(params.data.id)}
					contentClassName='m-0'
					hasPermission={canDeleteModel}
				/>
			);
		},
	},
];
