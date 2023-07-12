import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { SortButton } from '@/components/DataTable';
import { ApplicationMember } from '@/types';
import { notify, translate } from '@/utils';
import { Trash } from '@phosphor-icons/react';
import { ColumnDef } from '@tanstack/react-table';
import { RoleSelect } from 'components/RoleDropdown';
import useApplicationStore from '@/store/app/applicationStore';

function removeMember(userId: string) {
	useApplicationStore.getState?.().removeAppMember({
		userId,
		onSuccess: () => {
			notify({
				title: translate('general.success'),
				description: translate('general.member.delete'),
				type: 'success',
			});
		},
		onError: ({ error, details }) => {
			notify({
				title: error,
				description: details,
				type: 'error',
			});
		},
	});
}
function updateMemberRole(userId: string, role: string) {
	useApplicationStore.getState?.().changeAppTeamRole({
		userId,
		role,
		onError: ({ error, details }) => {
			notify({
				title: error,
				description: details,
				type: 'error',
			});
		},
	});
}
export const AppMembersTableColumns: ColumnDef<ApplicationMember>[] = [
	{
		id: 'select',
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
		size: 45,
	},
	{
		id: 'name',
		header: ({ column }) => (
			<SortButton text={translate('application.table.name')} column={column} />
		),
		accessorKey: 'name',
		sortingFn: 'textCaseSensitive',
		size: 600,
		cell: ({ row }) => {
			const { member } = row.original;
			return (
				<div className='flex items-center  gap-4'>
					<Avatar size='md'>
						<AvatarImage src={member.pictureUrl} />
						<AvatarFallback name={member.name} color={member.color} isUserAvatar />
					</Avatar>
					<div className='flex flex-col'>
						<span className='text-default text-sm font-sfCompact'>{member.name}</span>
						<span className='text-subtle text-xs font-sfCompact'>{member.contactEmail}</span>
					</div>
				</div>
			);
		},
	},
	{
		id: 'role',
		header: 'Role',
		accessorKey: 'role',
		size: 200,
		filterFn: 'arrIncludesSome',
		cell: ({ row }) => {
			const { role, member } = row.original;
			return (
				<RoleSelect
					role={role}
					type={'app'}
					onSelect={(selectedRole) => updateMemberRole(member._id, selectedRole)}
					disabled={member.isAppOwner}
				/>
			);
		},
	},
	{
		id: 'action',
		header: '',
		size: 100,
		cell: ({ row }) => {
			const { member } = row.original;
			return (
				!member.isAppOwner && (
					<div className='flex items-center justify-end'>
						<Button variant='blank' iconOnly onClick={() => removeMember(member._id)}>
							<Trash size={20} />
						</Button>
					</div>
				)
			);
		},
	},
];
