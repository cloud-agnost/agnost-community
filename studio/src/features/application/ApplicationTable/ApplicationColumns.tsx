import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { ApplicationSettings, ApplicationTeam } from '@/features/application';
import useAuthStore from '@/store/auth/authStore';
import { Application } from '@/types';
import { getRelativeTime } from '@/utils/utils';
import { ColumnDef } from '@tanstack/react-table';
import { Refresh } from '@/components/icons';
import { getApplicationRoleVariant } from '@/utils';
import { translate } from '@/utils';
import { Button } from '@/components/Button';
import { CaretUpDown } from '@phosphor-icons/react';
import { SortButton } from '@/components/DataTable';
export const ApplicationColumns: ColumnDef<Application>[] = [
	{
		id: 'name',
		header: ({ column }) => (
			<SortButton text={translate('application.table.name')} column={column} />
		),
		size: 1234,
		accessorKey: 'name',
		cell: ({ row }) => {
			const { pictureUrl, name, color } = row.original;
			return (
				<div className='flex items-center gap-5'>
					<Avatar square size='md'>
						<AvatarImage src={pictureUrl} />
						<AvatarFallback name={name} color={color} />
					</Avatar>
					<span className='ml-2'>{name}</span>
				</div>
			);
		},
	},
	{
		id: 'role',
		header: ({ column }) => (
			<SortButton text={translate('application.table.role')} column={column} />
		),
		accessorKey: 'role',
		cell: ({ row }) => {
			const { team } = row.original;
			const role = team.find((member) => member._id !== useAuthStore.getState().user?._id)?.role;
			return <Badge variant={getApplicationRoleVariant(role as string)}>{role}</Badge>;
		},
	},

	{
		id: 'date',
		header: ({ column }) => (
			<SortButton text={translate('application.table.createdAt')} column={column} />
		),
		accessorKey: 'createdAt',
		cell: ({ row }) => {
			const { createdAt } = row.original;
			return (
				<div className='flex gap-1'>
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
			return <ApplicationTeam team={team} />;
		},
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			const { _id, name } = row.original;
			return (
				<div className='text-center'>
					<ApplicationSettings appId={_id} appName={name} />
				</div>
			);
		},
	},
];
