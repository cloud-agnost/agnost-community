import { Checkbox } from '@/components/Checkbox';
import { ResendButton } from '@/components/ResendButton';
import { TableConfirmation } from '@/components/Table';
import useOrganizationStore from '@/store/organization/organizationStore';
import { Invitation } from '@/types';
import { formatDate, getOrgPermission, notify, translate } from '@/utils';
import { ColumnDef } from '@tanstack/react-table';
import { RoleSelect } from 'components/RoleDropdown';

const canDelete = getOrgPermission('invite.delete');

export const OrganizationInvitationsColumns: ColumnDef<Invitation>[] = [
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
		size: 25,
	},
	{
		id: 'email',
		header: 'Email',
		accessorKey: 'email',
		size: 600,
	},
	{
		id: 'invitedAt',
		header: 'Invited At',
		accessorKey: 'createdAt',
		size: 200,
		cell: ({ row }) =>
			formatDate(row.original.createdAt, { month: 'short', day: 'numeric', year: 'numeric' }),
	},
	{
		id: 'role',
		header: 'Role',
		accessorKey: 'role',
		size: 200,
		cell: ({ row }) => {
			const { token, role } = row.original;
			return (
				<>
					<RoleSelect
						role={role}
						type={'app'}
						onSelect={(val) => {
							useOrganizationStore.getState?.().updateInvitationUserRole({
								token,
								role: val,
							});
						}}
					/>
				</>
			);
		},
	},
	{
		id: 'actions',
		size: 45,
		cell: ({ row }) => {
			const { token } = row.original;
			function onDelete() {
				useOrganizationStore.getState().deleteInvitation({
					token,
					onSuccess: () => {
						notify({
							title: 'Invitation deleted',
							description: 'Invitation has been deleted.',
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
			return (
				<div className='flex items-center justify-end'>
					<ResendButton
						onResend={() => {
							useOrganizationStore.getState?.().resendInvitation({
								token,
								onSuccess: () => {
									notify({
										title: 'Invitation resent',
										description: 'Invitation has been resent to the user.',
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
						}}
					/>
					<TableConfirmation
						title={translate('organization.settings.members.invite.delete')}
						description={translate('organization.settings.members.invite.deleteDesc')}
						onConfirm={onDelete}
						hasPermission={canDelete}
					/>
				</div>
			);
		},
	},
];
