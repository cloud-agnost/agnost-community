import { Checkbox } from '@/components/Checkbox';
import { TableConfirmation } from '@/components/Table';
import useNavigatorStore from '@/store/database/navigatorStore';
import { ColumnDefWithClassName } from '@/types';
import { getVersionPermission, translate } from '@/utils';

const { deleteDataFromModel } = useNavigatorStore.getState();

async function deleteHandler(id: string) {
	deleteDataFromModel({
		id,
	});
}

export const NavigatorColumns: ColumnDefWithClassName<Record<string, any>>[] = [
	{
		id: 'select',
		size: 50,
		header: ({ table }) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected()}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label='Select all'
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label='Select row'
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		id: 'actions',
		className: 'actions sticky right-0 z-10',
		header: translate('general.actions'),
		size: 100,
		cell: ({ row: { original } }) => {
			const canDeleteModel = getVersionPermission('model.delete');
			return (
				<TableConfirmation
					align='end'
					title={translate('database.navigator.delete.title')}
					description={translate('database.navigator.delete.message')}
					onConfirm={() => deleteHandler(original.id)}
					contentClassName='m-0'
					hasPermission={canDeleteModel}
				/>
			);
		},
	},
];
