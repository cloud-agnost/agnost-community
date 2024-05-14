import { ActionsCell } from '@/components/ActionsCell';
import { Badge } from '@/components/Badge';
import { Checkbox } from '@/components/Checkbox';
import { SortButton } from '@/components/DataTable';
import { DateText } from '@/components/DateText';
import { BADGE_COLOR_MAP } from '@/constants';
import useOrganizationStore from '@/store/organization/organizationStore';
import { ColumnDefWithClassName } from '@/types';
import { Container } from '@/types/container';
import { translate } from '@/utils';
import { startCase } from 'lodash';
import { Link } from 'react-router-dom';

const ContainerColumns: ColumnDefWithClassName<Container>[] = [
	{
		id: 'select',
		enableResizing: false,
		className: '!max-w-[35px] !w-[35px]',
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
		size: 40,
	},
	{
		id: 'name',
		header: () => <SortButton text={translate('general.name')} field='name' />,
		accessorKey: 'name',
		sortingFn: 'textCaseSensitive',
		enableSorting: true,
	},
	{
		id: 'type',
		header: () => <SortButton text={translate('general.type')} field='type' />,
		accessorKey: 'type',
		sortingFn: 'textCaseSensitive',
		enableSorting: true,
		cell: ({ row: { original } }) => {
			const { type } = original;
			return (
				<Badge
					className='min-w-[100px]'
					variant={BADGE_COLOR_MAP[type.toUpperCase()]}
					text={startCase(type)}
				/>
			);
		},
	},
	{
		id: 'sourceOrRegistry',
		header: () => (
			<SortButton text={translate('project.sourceOrRegistry')} field='sourceOrRegistry' />
		),
		accessorKey: 'sourceOrRegistry',
		sortingFn: 'textCaseSensitive',
		enableSorting: true,
		cell: ({ row: { original } }) => {
			const { sourceOrRegistry } = original;
			return (
				<Badge
					className='min-w-[70px]'
					variant={BADGE_COLOR_MAP[sourceOrRegistry.toUpperCase()]}
					text={startCase(sourceOrRegistry)}
				/>
			);
		},
	},
	{
		id: 'source',
		header: () => <SortButton text={translate('project.source')} field='source' />,
		accessorKey: 'source',
		sortingFn: 'textCaseSensitive',
		enableSorting: true,
		cell: ({ row: { original } }) => {
			const { source, registry } = original;
			return (
				<Link
					className='link'
					to={source?.repo ?? registry?.image ?? ''}
					target='_blank'
					rel='noopener noreferrer'
				>
					{startCase(source?.repoType ?? registry?.registryId)}
				</Link>
			);
		},
	},
	{
		id: 'created_at',
		enableSorting: true,
		header: () => (
			<SortButton
				className='whitespace-nowrap'
				text={translate('general.created_at')}
				field='createdAt'
			/>
		),
		accessorKey: 'createdAt',

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
		enableSorting: true,
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
			// const { openEditCacheModal, openDeleteCacheModal } = useCacheStore.getState();
			const canDelete = true;
			const canUpdate = true;
			return (
				<ActionsCell<Container>
					original={original}
					onEdit={() => {}}
					onDelete={() => {}}
					canDelete={canDelete}
					canEdit={canUpdate}
				/>
			);
		},
	},
];

export default ContainerColumns;
