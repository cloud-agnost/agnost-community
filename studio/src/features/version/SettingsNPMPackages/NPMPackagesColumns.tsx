import useOrganizationStore from '@/store/organization/organizationStore';
import useSettingsStore from '@/store/version/settingsStore';
import useVersionStore from '@/store/version/versionStore.ts';
import { ColumnDefWithClassName, NPMPackage } from '@/types';
import { getVersionPermission, translate } from '@/utils';
import { Checkbox } from 'components/Checkbox';
import { SortButton } from 'components/DataTable';
import { DateText } from 'components/DateText';
import { TableConfirmation } from 'components/Table';

const { deleteNPMPackage } = useSettingsStore.getState();

async function onDelete(packageId: string) {
	const { version } = useVersionStore.getState();
	if (!version) return;
	await deleteNPMPackage({
		versionId: version?._id,
		orgId: version?.orgId,
		appId: version?.appId,
		packageId,
	});
}

const NPMPackagesColumns: ColumnDefWithClassName<NPMPackage>[] = [
	{
		id: 'select',
		enableResizing: false,
		size: undefined,
		className:
			'!max-w-[20px] !w-[20px] [&_.checkbox-wrapper]:mx-auto [&_.checkbox-wrapper]:w-fit !p-0',
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
		size: 200,
		header: ({ column }) => (
			<SortButton
				text={translate('general.name')}
				field='name'
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
			/>
		),
		accessorKey: 'name',
		sortingFn: 'text',
	},
	{
		id: 'version',
		size: 200,
		header: translate('general.version'),
		accessorKey: 'version',
	},
	{
		id: 'created_at',
		header: ({ column }) => (
			<SortButton
				text={translate('general.created_at')}
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				field='createdAt'
			/>
		),
		enableSorting: true,
		sortingFn: 'datetime',
		accessorKey: 'createdAt',
		size: 200,
		cell: ({ row }) => {
			const { createdAt, createdBy } = row.original;
			const user = useOrganizationStore
				.getState()
				.members.find((member) => member.member._id === createdBy);

			return <DateText date={createdAt} user={user} />;
		},
	},

	{
		id: 'actions',
		className: 'actions max-w-[50px]',
		cell: ({
			row: {
				original: { _id },
			},
		}) => {
			const canDeletePackage = getVersionPermission('version.param.delete');
			return (
				<div className='flex items-center'>
					<TableConfirmation
						align='end'
						title={translate('version.npm.delete_modal_title')}
						description={translate('version.npm.delete_modal_desc')}
						onConfirm={() => onDelete(_id)}
						contentClassName='m-0'
						hasPermission={canDeletePackage}
					/>
				</div>
			);
		},
	},
];

export default NPMPackagesColumns;
