import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { SortButton } from '@/components/DataTable';
import { Refresh } from '@/components/icons';
import { BADGE_COLOR_MAP } from '@/constants';
import { ApplicationSettings, ApplicationTeam } from '@/features/application';
import useApplicationStore from '@/store/app/applicationStore';
import useAuthStore from '@/store/auth/authStore';
import { AppRoles, Application, ColumnDefWithClassName } from '@/types';
import { getRelativeTime, translate } from '@/utils';
const user = useAuthStore.getState().user;
export const ApplicationColumns: ColumnDefWithClassName<Application>[] = [
	{
		id: 'name',
		header: ({ column }) => (
			<SortButton
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				text={translate('application.table.name')}
				field='name'
			/>
		),
		size: 900,
		accessorKey: 'name',

		cell: ({ row }) => {
			const { pictureUrl, name, color } = row.original;
			return (
				<div className='flex items-center gap-5'>
					<Avatar square size='md'>
						<AvatarImage src={pictureUrl} />
						<AvatarFallback name={name} color={color} />
					</Avatar>
					<Button
						variant='blank'
						onClick={() => {
							useApplicationStore.getState().openVersionDrawer(row.original);
						}}
						className='ml-2 link'
					>
						{name}
					</Button>
				</div>
			);
		},
	},
	{
		id: 'role',
		header: ({ column }) => (
			<SortButton
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				text={translate('application.table.role')}
				field='role'
			/>
		),
		accessorKey: 'role',
		cell: ({ row }) => {
			const { team } = row.original;
			const role = team.find((member) => member._id !== useAuthStore.getState().user?._id)
				?.role as string;
			return <Badge text={role} variant={BADGE_COLOR_MAP[role.toUpperCase()]} />;
		},
	},

	{
		id: 'date',
		header: ({ column }) => (
			<SortButton
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				text={translate('application.table.createdAt')}
				field='createdAt'
			/>
		),
		accessorKey: 'createdAt',
		cell: ({ row }) => {
			const { createdAt } = row.original;
			return (
				<div className='flex gap-1 items-center'>
					<Refresh className='w-4 h-4 text-subtle mr-2' />
					{getRelativeTime(createdAt)}
				</div>
			);
		},
	},
	{
		id: 'team',
		header: translate('application.table.team'),
		cell: ({ row }) => {
			const { team } = row.original;
			return <ApplicationTeam team={team} table />;
		},
	},
	{
		id: 'actions',
		className: 'actions !w-[50px]',
		cell: ({ row }) => {
			const { _id, name, team } = row.original;
			const me = team.find((member) => member.userId._id === user?._id);
			return (
				<div className='text-center action'>
					<ApplicationSettings appId={_id} appName={name} role={me?.role as AppRoles} />
				</div>
			);
		},
	},
];
