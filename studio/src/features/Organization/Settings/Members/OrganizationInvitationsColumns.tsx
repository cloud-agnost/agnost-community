import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import { TableConfirmation } from '@/components/Table';
import useOrganizationStore from '@/store/organization/organizationStore';
import useTypeStore from '@/store/types/typeStore';
import { Invitation } from '@/types';
import { notify, formatDate, translate } from '@/utils';
import { EnvelopeSimple, Trash } from '@phosphor-icons/react';
import { ColumnDef } from '@tanstack/react-table';

const roles = useTypeStore.getState?.().orgRoles;

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
				<Select
					defaultValue={role}
					onValueChange={(val) => {
						useOrganizationStore.getState().updateInvitationUserRole({
							token,
							role: val,
						});
					}}
				>
					<SelectTrigger className='w-[180px]'>
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
		size: 45,
		cell: ({ row }) => {
			const { token } = row.original;
			return (
				<div className='flex items-center justify-end'>
					<Button
						variant='blank'
						iconOnly
						onClick={() => {
							useOrganizationStore.getState().resendInvitation({
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
					>
						<EnvelopeSimple size={24} className='text-icon-base' />
					</Button>
					<TableConfirmation
						title={translate('organization.settings.members.invite.delete')}
						description={translate('organization.settings.members.invite.deleteDesc')}
						onConfirm={() => {
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
						}}
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
