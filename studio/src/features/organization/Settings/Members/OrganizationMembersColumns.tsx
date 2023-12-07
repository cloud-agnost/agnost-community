import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { Checkbox } from '@/components/Checkbox';
import { DateText } from '@/components/DateText';
import { RoleSelect } from '@/components/RoleDropdown';
import { TableConfirmation } from '@/components/Table';
import useAuthorizeOrg from '@/hooks/useAuthorizeOrg';
import useOrganizationStore from '@/store/organization/organizationStore';
import { OrganizationMember } from '@/types';
import { getOrgPermission, translate } from '@/utils';
import { ColumnDef } from '@tanstack/react-table';
function updateRole(userId: string, role: string) {
	useOrganizationStore.getState().changeMemberRole({
		userId,
		role,
	});
}

function deleteHandler(member: OrganizationMember) {
	const { removeMemberFromOrganization } = useOrganizationStore.getState();
	removeMemberFromOrganization({
		userId: member.member._id,
		onError: ({ error, details }) => {
			console.error(error, details);
		},
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
			const { role } = row.original;
			return <UpdateInvitationUserRole member={row.original} role={role} />;
		},
	},
	{
		id: 'actions',
		size: 25,
		cell: ({ row: { original } }) => {
			const canDelete = getOrgPermission('member.delete');
			return (
				<TableConfirmation
					align='end'
					title={translate('organization.settings.members.delete')}
					description={translate('organization.settings.members.deleteDesc')}
					onConfirm={() => deleteHandler(original)}
					contentClassName='m-0'
					hasPermission={canDelete}
					disabled={original.member.isOrgOwner}
				/>
			);
		},
	},
];

function UpdateInvitationUserRole({ member, role }: { member: OrganizationMember; role: string }) {
	const canUpdate = useAuthorizeOrg('member.update');
	return (
		<RoleSelect
			disabled={member.member.isOrgOwner || !canUpdate}
			role={role}
			type='org'
			onSelect={(newRole) => updateRole(member.member._id, newRole)}
		/>
	);
}
