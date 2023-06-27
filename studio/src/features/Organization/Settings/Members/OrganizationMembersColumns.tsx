import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { OrganizationMember } from '@/types';
import { Trash } from '@phosphor-icons/react';
import { ColumnDef } from '@tanstack/react-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import useTypeStore from '@/store/types/typeStore';
import { formatDate } from '@/utils';
import useOrganizationStore from '@/store/organization/organizationStore';

const roles = useTypeStore.getState().orgRoles;

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
		header: 'joinedAt',
		accessorKey: 'joinDate',
		size: 200,
		cell: ({ row }) =>
			formatDate(row.original.joinDate, {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
				hour: 'numeric',
				minute: 'numeric',
			}),
	},
	{
		id: 'role',
		header: 'Role',
		accessorKey: 'role',
		size: 200,
		cell: ({ row }) => {
			const { member, role } = row.original;
			return member.isOrgOwner ? (
				role
			) : (
				<Select
					defaultValue={role}
					onValueChange={(val) => {
						useOrganizationStore.getState().changeMemberRole({
							userId: member._id,
							role: val,
						});
					}}
				>
					<SelectTrigger className='w-[150px]'>
						<SelectValue>{role}</SelectValue>
					</SelectTrigger>

					<SelectContent>
						{roles.map((role) => (
							<SelectItem key={role} value={role}>
								{role}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
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
