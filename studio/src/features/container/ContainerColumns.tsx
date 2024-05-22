import { ActionsCell } from '@/components/ActionsCell';
import { Badge } from '@/components/Badge';
import { SortButton } from '@/components/DataTable';
import { DateText } from '@/components/DateText';
import { Github } from '@/components/icons';
import { BADGE_COLOR_MAP } from '@/constants';
import useContainerStore from '@/store/container/containerStore';
import useOrganizationStore from '@/store/organization/organizationStore';
import { ColumnDefWithClassName } from '@/types';
import { Container } from '@/types/container';
import { translate } from '@/utils';
import { startCase } from 'lodash';
import { Link } from 'react-router-dom';

const ContainerColumns: ColumnDefWithClassName<Container>[] = [
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
			return <Badge className='min-w-[100px]' text={startCase(type)} />;
		},
	},
	{
		id: 'status',
		header: () => <SortButton text={translate('general.status')} field='type' />,
		accessorKey: 'status',
		sortingFn: 'textCaseSensitive',
		enableSorting: true,
		cell: ({ row: { original } }) => {
			const { status } = original;
			return (
				<Badge
					variant={BADGE_COLOR_MAP[status.status.toUpperCase()]}
					text={startCase(status.status)}
					rounded
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
			const { repo, registry } = original;

			return (
				repo?.url && (
					<Link
						className='link'
						to={repo?.url ?? registry?.image ?? ''}
						target='_blank'
						rel='noopener noreferrer'
					>
						<p className='flex items-center gap-2'>
							<Github />
							{repo?.name}/{repo?.branch}
						</p>
					</Link>
				)
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
			const { openEditContainerDialog, openDeleteContainerDialog } = useContainerStore.getState();
			const canDelete = true;
			const canUpdate = true;
			return (
				<ActionsCell<Container>
					original={original}
					onEdit={() => openEditContainerDialog(original)}
					onDelete={() => openDeleteContainerDialog(original)}
					canDelete={canDelete}
					canEdit={canUpdate}
				/>
			);
		},
	},
];

export default ContainerColumns;
