import { ActionsCell } from '@/components/ActionsCell';
import { Badge } from '@/components/Badge';
import { SortButton } from '@/components/DataTable';
import { DateText } from '@/components/DateText';
import { BADGE_COLOR_MAP, RESOURCE_ICON_MAP } from '@/constants';
import useResourceStore from '@/store/resources/resourceStore';
import { ColumnDefWithClassName, Resource, ResourceCreateType } from '@/types';
import { getOrgPermission, translate } from '@/utils';

const { openEditResourceModal } = useResourceStore.getState();
const canEditResource = getOrgPermission('resource.update');
const canDeleteResource = getOrgPermission('resource.delete');
export const ResourceTableColumn: ColumnDefWithClassName<Resource>[] = [
	{
		id: 'name',
		header: ({ column }) => {
			return <SortButton text={translate('resources.table.name')} column={column} />;
		},
		accessorKey: 'name',
		size: 200,
	},
	{
		id: 'type',
		header: ({ column }) => {
			return <SortButton text={translate('resources.table.type')} column={column} />;
		},
		accessorKey: 'instance',
		size: 200,
		cell: ({ row }) => {
			const { instance } = row.original;
			const Icon = RESOURCE_ICON_MAP[instance];
			return (
				<div className='flex gap-1 items-center'>
					{Icon && <Icon className='w-6 h-6' />}
					<span>{instance}</span>
				</div>
			);
		},
	},
	{
		id: 'status',
		header: ({ column }) => {
			return <SortButton text={translate('resources.table.status')} column={column} />;
		},
		accessorKey: 'status',
		size: 200,
		cell: ({ row }) => {
			const { status } = row.original;
			return <Badge text={status} variant={BADGE_COLOR_MAP[status?.toUpperCase()]} rounded />;
		},
	},
	{
		id: 'allowedRoles',
		header: ({ column }) => {
			return <SortButton text={translate('resources.table.allowedRoles')} column={column} />;
		},
		accessorKey: 'allowedRoles',
		size: 200,
		cell: ({ row }) => {
			const { allowedRoles } = row.original;
			return (
				<div className='flex gap-2'>
					{allowedRoles.sort().map((role) => {
						return <Badge key={role} text={role} variant={BADGE_COLOR_MAP[role.toUpperCase()]} />;
					})}
				</div>
			);
		},
	},
	{
		id: 'createdAt',
		header: ({ column }) => {
			return <SortButton text={translate('resources.table.createdAt')} column={column} />;
		},
		accessorKey: 'createdAt',
		size: 200,
		cell: ({ row }) => {
			const { createdAt } = row.original;
			return <DateText date={createdAt} />;
		},
	},
	{
		id: 'actions',
		header: translate('resources.table.actions'),
		size: 45,
		className: 'actions',
		cell: ({ row }) => {
			const resourceCreateType =
				'access' in row.original ? ResourceCreateType.Existing : ResourceCreateType.New;
			return (
				row.original.deletable && (
					<ActionsCell
						original={row.original}
						onDelete={() =>
							useResourceStore.setState({
								deletedResource: row.original,
								isDeletedResourceModalOpen: true,
							})
						}
						onEdit={() => openEditResourceModal(row.original, resourceCreateType)}
						canEdit={canEditResource}
						canDelete={canDeleteResource}
					/>
				)
			);
		},
	},
];