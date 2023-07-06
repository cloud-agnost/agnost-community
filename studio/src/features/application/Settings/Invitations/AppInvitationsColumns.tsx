import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { TableConfirmation } from '@/components/Table';
import { Invitation } from '@/types';
import { formatDate, notify, translate } from '@/utils';
import { EnvelopeSimple, Trash } from '@phosphor-icons/react';
import { ColumnDef } from '@tanstack/react-table';
import useApplicationStore from '@/store/app/applicationStore';
import { RoleSelect } from 'components/RoleDropdown';
import { DateTime } from 'luxon';

function updateInvitationUserRole(token: string, role: string) {
	useApplicationStore.getState?.().updateInvitationUserRole({
		token,
		role,
		onSuccess: () => {
			notify({
				title: translate('general.success'),
				description: translate('general.invitation.update', { role }),
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
function resendInvitation(token: string, email: string) {
	useApplicationStore.getState?.().resendInvitation({
		token,
		onSuccess: () => {
			notify({
				title: translate('general.success'),
				description: translate('general.invitation.resent_success', {
					email,
				}),
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

function deleteInvitation(token: string) {
	useApplicationStore.getState?.().deleteInvitation({
		token,
		onSuccess: () => {
			notify({
				title: translate('general.success'),
				description: translate('general.invitation.delete'),
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
export const AppInvitationsColumns: ColumnDef<Invitation>[] = [
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
	},
	{
		id: 'email',
		header: 'Email',
		accessorKey: 'email',
	},
	{
		id: 'invitedAt',
		header: 'Invited At',
		accessorKey: 'createdAt',
		size: 200,
		cell: ({ row }) => formatDate(row.original.createdAt, DateTime.DATE_MED),
	},
	{
		id: 'role',
		header: 'Role',
		accessorKey: 'role',
		size: 200,
		cell: ({ row }) => {
			const { token, role } = row.original;
			return (
				<RoleSelect
					role={role}
					type={'app'}
					onSelect={(newRole) => updateInvitationUserRole(token, newRole)}
				/>
			);
		},
	},
	{
		id: 'actions',
		size: 20,
		cell: ({ row }) => {
			const { token, email } = row.original;
			return (
				<div className='flex items-center justify-end'>
					<Button variant='blank' iconOnly onClick={() => resendInvitation(token, email)}>
						<EnvelopeSimple size={24} className='text-icon-base' />
					</Button>
					<TableConfirmation
						title={translate('organization.settings.members.invite.delete')}
						description={translate('organization.settings.members.invite.deleteDesc')}
						onConfirm={() => deleteInvitation(token)}
					>
						<Button variant='blank' iconOnly>
							<Trash size={24} className='text-icon-base' />
						</Button>
					</TableConfirmation>
				</div>
			);
		},
	},
];
