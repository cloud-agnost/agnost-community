import { TableConfirmation } from '@/components/Table';
import { toast } from '@/hooks/useToast';
import useNavigatorStore from '@/store/database/navigatorStore';
import { APIError } from '@/types';
import { getVersionPermission, translate } from '@/utils';
import { QueryClient } from '@tanstack/react-query';
import { ColDef } from 'ag-grid-community';

const { deleteDataFromModel } = useNavigatorStore.getState();
const queryClient = new QueryClient();
async function deleteHandler(id: string) {
	return queryClient
		.getMutationCache()
		.build(queryClient, {
			mutationFn: deleteDataFromModel,
			onError: (error: APIError) => {
				toast({
					title: error.details,
					action: 'error',
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
	},
	{
		headerName: translate('general.actions'),
		field: 'actions',
		width: 120,
		pinned: 'right',
		cellRenderer: (params: any) => {
			const canDeleteModel = getVersionPermission('model.delete');
			return (
				<TableConfirmation
					align='end'
					title={translate('database.navigator.delete.title')}
					description={translate('database.navigator.delete.message')}
					onConfirm={() => deleteHandler(params.value.id)}
					contentClassName='m-0'
					hasPermission={canDeleteModel}
				/>
			);
		},
	},
];
