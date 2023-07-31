import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { DateText } from '@/components/DateText';
import { RoleSelect } from '@/components/RoleDropdown';
import useOrganizationStore from '@/store/organization/organizationStore';
import { OrganizationMember } from '@/types';
import { Trash } from '@phosphor-icons/react';
import { ColumnDef } from '@tanstack/react-table';

function updateRole(userId: string, role: string) {
	useOrganizationStore.getState().changeMemberRole({
		userId,
		role,
	});
}

export const OrganizationMembersColumns: ColumnDef<OrganizationMember>[] = [
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
		header: 'Members',
		accessorKey: 'name',
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
						<span className='text-default text-sm'>{member.name}</span>
						<span className='text-subtle text-xs'>{member.contactEmail}</span>
					</div>
				</div>
			);
		},
	},
	{
		id: 'joinedAt',
		header: 'Joined At',
		accessorKey: 'joinDate',
		size: 200,
		cell: ({ row }) => <DateText date={row.original.joinDate} />,
	},
	{
		id: 'role',
		header: 'Role',
		accessorKey: 'role',
		size: 200,
		cell: ({ row }) => {
			const { member, role } = row.original;
			return (
				<RoleSelect
					disabled={member.isOrgOwner}
					role={role}
					type={'app'}
					onSelect={(newRole) => updateRole(member._id, newRole)}
				/>
			);
		},
	},
	{
		id: 'actions',
		size: 25,
		cell: () => (
			<Button variant='blank' iconOnly>
				<Trash size={24} className='text-icon-base' />
			</Button>
		),
	},
];
