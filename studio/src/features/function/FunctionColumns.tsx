import { ActionsCell } from '@/components/ActionsCell';
import { TableConfirmation } from '@/components/Table';
import useFunctionStore from '@/store/function/functionStore';
import useOrganizationStore from '@/store/organization/organizationStore';
import { APIError, ColumnDefWithClassName, HelperFunction, TabTypes } from '@/types';
import { getVersionPermission, notify, translate } from '@/utils';
import { QueryClient } from '@tanstack/react-query';
import { Checkbox } from 'components/Checkbox';
import { SortButton } from 'components/DataTable';
import { DateText } from 'components/DateText';
import { TabLink } from '../version/Tabs';

const canEditFunction = getVersionPermission('function.update');
const canDeleteFunction = getVersionPermission('function.delete');

const { openEditFunctionDrawer, deleteFunction } = useFunctionStore.getState();
const queryClient = new QueryClient();

function deleteHandler(fn: HelperFunction) {
	queryClient
		.getMutationCache()
		.build(queryClient, {
			mutationFn: deleteFunction,
			onError: (error: APIError) => {
				notify({
					title: error.error,
					description: error.details,
					type: 'error',
				});
			},
		})
		.execute({
			appId: fn.appId,
			orgId: fn.orgId,
			versionId: fn.versionId,
			funcId: fn._id,
		});
}
const FunctionColumns: ColumnDefWithClassName<HelperFunction>[] = [
	{
		id: 'select',
		className: '!max-w-[40px] !w-[40px]',
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
		id: 'name',
		header: () => <SortButton text={translate('general.name')} field='name' />,
		accessorKey: 'name',
		sortingFn: 'textCaseSensitive',
		cell: ({ row }) => {
			const { name, _id } = row.original;
			return <TabLink name={name} path={`${_id}`} type={TabTypes.Function} />;
		},
	},
	{
		id: 'createdAt',
		header: () => (
			<SortButton
				className='whitespace-nowrap'
				text={translate('general.created_at')}
				field='createdAt'
			/>
		),
		accessorKey: 'createdAt',
		enableSorting: true,
		size: 200,
		cell: ({
			row: {
				original: { createdAt, createdBy },
			},
		}) => {
			const user = useOrganizationStore
				.getState()
				.members.find((member) => member.member._id === createdBy);

			return <DateText date={createdAt} user={user} />;
		},
	},

	{
		id: 'updatedAt',
		header: () => (
			<SortButton
				className='whitespace-nowrap'
				text={translate('general.updated_at')}
				field='updatedAt'
			/>
		),
		accessorKey: 'updatedAt',
		size: 200,
		cell: ({
			row: {
				original: { updatedAt, updatedBy },
			},
		}) => {
			if (!updatedBy) return null;
			const user = useOrganizationStore
				.getState()
				.members.find((member) => member.member._id === updatedBy);
			return updatedBy && <DateText date={updatedAt} user={user} />;
		},
	},

	{
		id: 'actions',
		className: 'actions !w-[50px]',
		cell: ({ row: { original } }) => {
			return (
				<ActionsCell<HelperFunction>
					onEdit={() => openEditFunctionDrawer(original)}
					original={original}
					canEdit={canEditFunction}
				>
					<TableConfirmation
						align='end'
						closeOnConfirm
						title={translate('function.delete.title')}
						description={translate('function.delete.message')}
						onConfirm={() => deleteHandler(original)}
						contentClassName='m-0'
						hasPermission={canDeleteFunction}
					/>
				</ActionsCell>
			);
		},
	},
];

export default FunctionColumns;
